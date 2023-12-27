const { getCompletion } = require("../services/openAi");
const { getEmbeddings } = require("../services/huggingface");
const { connectDB } = require("../config/database");
const Doc = require("../models/document");
const chatModel = require("../models/chat");
const userModel = require("../models/user");
const { cosineSimilarity } = require("../utils/cosineSimilarity");

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.json());

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

exports.handler = async (req, res) => {
  try {
    await connectDB();
    const { _id: userId } = req.user;
    const { query, id } = req.body;

    const user = await userModel.findById(userId).catch((error) => {
      console.error("Error fetching user from the database:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const chats = user.chats;
    if (!chats.includes(id)) {
      return res.status(400).json({ message: "Unauthorized" });
    }

    const chat = await chatModel.findById(id).catch((error) => {
      console.error("Error fetching chat from the database:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    });

    const chunks = await Doc.findById(chat.documentId).select("Chunks -_id").catch((error) => {
      console.error("Error fetching chunks from the database:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    });

    const questionEmb = await getEmbeddings(query);

    const similarityResults = [];
    chunks.Chunks.forEach((chunk) => {
      const similarity = cosineSimilarity(questionEmb, chunk.embeddings);
      similarityResults.push({ chunk, similarity });
    });

    similarityResults.sort((a, b) => b.similarity - a.similarity);
    const topThree = similarityResults.slice(0, 3).map((result) => result.chunk.rawText);

    const languageResponse = "English";
    const promptStart = `Answer the question based on the context below with ${languageResponse}:\n\n`;
    const promptEnd = `\n\nQuestion: ${query} \n\nAnswer:`;

    const prompt = `${promptStart} ${topThree.join("\n")} ${promptEnd}`;
    const chatHistory = chat.messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    chatHistory.push({ role: "user", content: prompt });

    const responseStream = await getCompletion(chatHistory);
    const fullResponse = [];

    for await (const part of responseStream) {
      const text = part.choices[0]?.delta?.content || "";
      chatHistory.push({ role: "assistant", content: text });
      fullResponse.push({ role: "assistant", content: text });

      // Send -reaaal time data - each chunk to the frontend --> to connected sockets
      io.emit("chat_message", { role: "assistant", content: text });
    }

    // Store the full response in the database
    if (fullResponse.length > 0) {
      await chatModel.findByIdAndUpdate(id, { messages: fullResponse });
    }

    if (fullResponse.length === 0) {
      return res.status(400).json({ message: "Error" });
    }

    chatHistory.pop();
    chatHistory.push({ role: "user", content: query });
    await chatModel.findByIdAndUpdate(id, { messages: chatHistory });

    return res.status(200).json({ response: fullResponse });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
