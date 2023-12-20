const { getCompletion } = require('../services/openAi');
const { getEmbeddings } = require('../services/huggingface');
const { connectDB} = require('../config/database');
const Doc = require('../models/document');
const chatmodel = require('../models/Chat');
const { cosineSimilarity } = require("../utils/cosineSimilarity");
const { ObjectId } = require('mongodb');

let chathistory = [];



// pinecone config
// TODO : ADD THE PINECONE CONFIG TO CONFIGs/PINECONE.JS
// const pinecone = await initialize();

exports.handler = async (req, res) => {
  // 1. check for POST call
  // peter send us query and id of single chat
  try {
    const { query , id } = req.body; 
  

  // 2. connect to mongodb
  await connectDB();

  await chatmodel.findOneAndUpdate({
    _id : id,
  },{
    $push:{
      messages: {role: 'user',content: query },
    }
  })
  chathistory = await chatmodel.findById(id).find({});
  
  
  chathistory = chathistory[0].messages.map(chat=>{return {role:chat.role,content:chat.content }});
  
 // 3. query the file by id

  const myFile = await chatmodel.findById(id).find({}).select("documentId -_id");
  
  if (!myFile) {
    return res.status(400).send({ message: 'invalid file id' });
  }


  //4. get embeddings for the query
  const questionEmb = await getEmbeddings(query);



  //////////////////////// PINECONE /////////////////////
//   // 5. initialize pinecone
//   const pinecone = new Pinecone({
//     environment: process.env.PDB_ENV,
//     apiKey: process.env.PDB_KEY,
// });

//   // 6. connect to index
//   const index = pinecone.Index(myFile.vectorIndex);

//   // 7. query the pinecone db
//   const queryRequest = {
//     vector: questionEmb,
//     topK: 2,
//     includeValues: true,
//     includeMetadata: true,
//   };

//   // TODO : take only the first result or 2

//   let result = await index.query(queryRequest);
//   console.log('--result--', result);

//   // 8. get the metadata from the results
//   let contexts = result['matches'].map((item) => item['metadata'].text);

//   contexts = contexts.join('\n\n---\n\n');

//   console.log('--contexts--', contexts);

  // build a similar search function
const file = await chatmodel.findById(id);

const thedocument = await Doc.findById(file.documentId);



const similarityResults = [] ;
for(let i=0; i<thedocument.Chunks.length; i++){
  const chunk = thedocument.Chunks[i];
  const similarity = cosineSimilarity(questionEmb,chunk.embeddings);
  similarityResults.push({ chunk, similarity });
}


//sort to get the highest three chunks similarity 
similarityResults.sort((a, b) => b.similarity - a.similarity);
//get these three chunks from the array
let contextsTopSimilartyChunks = similarityResults.slice(0, 3).map((result) => result.chunk);
contextsTopSimilartyChunks = contextsTopSimilartyChunks.map(chunk=>chunk.rawText)






  //9. build the prompt
//TODO : TAKE THE LANGUAGE FROM THE USER (req.body.language) 
 const languageResponse = 'English'; // defula output language is english
  const promptStart = `Answer the question based on the context below with ${languageResponse}:\n\n`;
  const promptEnd = `\n\nQuestion: ${query} \n\nAnswer:`;
  // const chats = `chat history: ${chathistory}`;
  
  const prompt = `${promptStart} ${contextsTopSimilartyChunks} ${promptEnd}`;

  console.log('--prompt--', prompt);

  // const prompt = `Answer The question based on the context below with English. Question is : ${query}`
  chathistory.push({role:"user",content:prompt})
  // 10. get the completion from openai
  const response = await getCompletion(chathistory);

  await chatmodel.findOneAndUpdate({
    _id : id,
  },{
    $push:{
      messages: {role: 'assistant', content: response  },
    }
  })
  console.log('--completion--', response);
  // 11. return the response
  res.status(200).json({ response : response,topchunks: contextsTopSimilartyChunks});
  } catch (error) {
    res.json({error:error.message})
  }

};
