const userModel = require("../models/user")
const chatModel = require("../models/chat")
const Doc = require("../models/document")



exports.getAllChats = async (req, res) => {
  try {
    const { id } = req.user //User ID
    const user = await userModel.findById(id)
    if (!user) {
      return res.status(400).json({ message: "user not found" })
    }
    const chats = user.chats
    let allChats = await chatModel.find({ _id: { $in: chats } })
    allChats = allChats.map((chat) => {
      return { id: chat._id, chatName: chat.chatName }
    })
    res.json(allChats)
  } catch (error) {
    res.json({ error: error.message })
  }
}

exports.getChat = async (req, res) => {
  try {
    const { id } = req.params //Chat ID
    const chats = req.user.chats

    if (!chats.includes(id)) {
      return res.status(400).json({ message: "unauthorized" })
    }

    const theChat = await chatModel.findById(id)
    if (!theChat) {
      return res.status(400).json({ message: "chat not found" })
    }
    const name = theChat.chatName
    const messages = theChat.messages

    const document = await Doc.findById(theChat.documentId)

    return res.json({ name, messages, url: document.FileUrl })
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}

exports.deleteChat = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user
    const chats = user.chats
    console.log(chats)

    if (!chats.includes(id)) {
      return res.status(400).json({ message: "unauthorized" })
    }

    const deleteChat = await chatModel.findByIdAndDelete(id)
    const updatedUser = await userModel.findByIdAndUpdate(user._id, {
        $pull: { chats: id },
    })

    res.json({ deleteChat , updatedUser})
    
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

exports.updateChat = async (req, res) => {
  try {
    const { id } = req.params
    const { chatName } = req.body
   await chatModel.findByIdAndUpdate(
      { _id: id },
      { $set: { chatName } },
      { new: true }
    )

    return res.json({ message: "Chat Name Updated Successfully" })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
