const DocumentModel = require("../models/document")
const chatmodel = require("../models/chat")
const { connectDB } = require("../config/database")
const { convertDocToChunks } = require("../utils/extractDataFromDocs")
const { getEmbeddings } = require("../services/huggingface")
const Chat = require("../models/chat")

exports.handler = async (req, res) => {
  // 1. check for POST call
  if (req.method !== "POST") {
    return res.status(400).json({ message: "http method not allowed" })
  }

  try {
    // 2. connect to mongodb
    await connectDB()

    // 3. query the file by id

    // TODO : PASS THE CHAT ID
    const { id } = req.body

    // NOTE : chatId is the id of the chat that the user wants to process -- > documentId
    if (!id) {
      return res.status(400).json({ message: "chat id is required" })
    }

    const chat = await chatmodel.findById(id)
    const myFile = await DocumentModel.findById(chat.documentId)
    const currUser = req.user

    if (!myFile) {
      return res.status(400).json({ message: "file not found" })
    }

    // CHECK IF THE FILE IS ALREADY PROCESSED
    if (myFile.isProcessed) {
      return res.status(400).json({ message: "file is already processed" })
    }

    // Chunk the text using RecursiveCharacterTextSplitter
    const chunks = await convertDocToChunks(myFile.FileName, myFile.FileUrl)

    // ADD THE CHUNKS TO THE DATABASE WITH THE EMBEDDINGS
    const vectors = []
    for (const chunk of chunks) {
      const embedding = await getEmbeddings(chunk)

      // Push the object to the vectors array
      vectors.push({
        rawText: chunk,
        embeddings: embedding,
      })
    }

    // 10. update mongodb with isProcessed to true
    myFile.Chunks = vectors
    // TODO : HANDLE THE ERRORS
    myFile.isProcessed = true
    await myFile.save()

    // Create new Chat return chat id to the forntend -
    // and add the chat id to the user chats array
    const newChat = new Chat({
      documentId: myFile._id,
      chatName: myFile.FileName,
      messages: [],
    })

    await newChat.save()

    currUser.chats.push(newChat._id)
    await currUser.save()

    ///

    // 11. return the response
    return res
      .status(200)
      .json({ message: "File processed and uploaded to mongodb successfully" })
  } catch (e) {
    console.log(e)
    // await disconnectDB()
    return res.status(500).json({ message: e.message })
  }
}
