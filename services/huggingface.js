const { HuggingFaceInferenceEmbeddings } = require("langchain/embeddings/hf");


// Initialize the embeddings
const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGING_FACE_KEY,
});

// Get the embeddings of Chunks
// JUST ONE FUNCTION TO MAKE IT EASY

exports.getEmbeddings = async (content) => {
  if (Array.isArray(content)) {
    // If content is an array, assume it's an array of documents
    return embeddings.embedDocuments(content);

  } else if (typeof content === 'string') {
    // If content is a string, assume it's a single document or query
    return embeddings.embedQuery(content);
    
  } else {
    // Handle other data types or throw an error
    throw new Error('Invalid input type. Expected string or array.');
  }
}

