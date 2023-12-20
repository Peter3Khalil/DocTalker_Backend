const mongoose = require('mongoose');


exports.connectDB = async ()=> {
  if (mongoose.connections[0].readyState) {
    // If a connection is already established, reuse it
    console.log('existing connection available')
    return;
  }

	const MONGO_URI = process.env.MONGO_URI
  console.log(process.env.MONGO_URI);

  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the Node.js process on connection error
  }
}



// FOR FUTURE USE
 exports.disconnectDB = async()=> {
  if (mongoose.connections[0].readyState) {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

