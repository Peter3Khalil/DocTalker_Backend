const math = require('mathjs');

// Function to calculate cosine similarity using math.js
exports.cosineSimilarity = (vector1, vector2) => {
  const dot = math.dot(vector1, vector2);
  const mag1 = math.norm(vector1);
  const mag2 = math.norm(vector2);

  // Handle division by zero error
  if (mag1 === 0 || mag2 === 0) {
    
    return 0;
  }
  return dot / (mag1 * mag2);
}
