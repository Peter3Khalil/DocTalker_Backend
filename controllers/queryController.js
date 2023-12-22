const { getCompletion } = require("../services/openAi")
const { getEmbeddings } = require("../services/huggingface")
const { connectDB } = require("../config/database")
const Doc = require("../models/document")
const chatModel = require("../models/Chat")
const userModel = require("../models/user")
const { cosineSimilarity } = require("../utils/cosineSimilarity")


exports.handler = async (req, res) => {
  try {
    await connectDB()
    const { _id:userId } = req.user
    const { query, id } = req.body
    
    const user = await userModel.findById(userId)
    if (!user) {
      return res.status(400).json({ message: "user not found" })
    }


    const chats = user.chats
    if (!chats.includes(id)) {
      return res.status(400).json({ message: "unauthorized" })
    }


    const chat = await chatModel.findById(id);
    let chunks = await Doc.findById(chat.documentId).select("Chunks -_id");
    chunks = chunks.Chunks
    const questionEmb = await getEmbeddings(query)

    const similarityResults = []
    chunks.forEach((chunk) => {
      const similarity = cosineSimilarity(questionEmb, chunk.embeddings)
      similarityResults.push({ chunk, similarity })
    })

    similarityResults.sort((a, b) => b.similarity - a.similarity)
    let topThree = similarityResults
      .slice(0, 3)
      .map((result) => result.chunk.rawText)



    const languageResponse = "English"
    const promptStart = `Answer the question based on the context below with ${languageResponse}:\n\n`
    const promptEnd = `\n\nQuestion: ${query} \n\nAnswer:`

    const prompt = `${promptStart} ${topThree.join("\n")} ${promptEnd}`
    let chatHistory = chat.messages.map((message) => {
      return { role: message.role, content: message.content }
    })
    chatHistory.push({ role: "user", content: prompt})
    const response = await getCompletion(chatHistory)
    if (!response){
     return res.status(400).json({ message: "error" })
    }
    chatHistory.pop()
    chatHistory.push({ role: "user", content: query})
    chatHistory.push({ role: "assistant", content: response})
    await chatModel.findByIdAndUpdate(id, { messages: chatHistory })
    return res.status(200).json({ response })
  } catch (error) {
    console.log(error.message)
    return res.json({ error: error.message })
  }
}
