
/// this is the model for the authentication token that will be used to verify the user
// STILL DK HOW TO USE THIS
// SHEKIB GONNA TELL US !!!!!


const mongoose = require('mongoose');

const AuthenticationSchema = new mongoose.Schema({
   tokenID: mongoose.Schema.Types.ObjectId,
   userID: mongoose.Schema.Types.ObjectId,
   token: String,
   expiresAt: Date
});

const Authentication = mongoose.model('Authentication', AuthenticationSchema);



// Function to remove expired tokens
function removeExpiredTokens() {
   const now = new Date();
   Authentication.deleteMany({ expiresAt: { $lt: now } }, (err) => {
      if (err) {
         console.error('Error removing expired tokens:', err);
      } else {
         console.log('Expired-tokens removed');
      }
   });
}

// Schedule the function to run periodically


// itrerate every hour
setInterval(removeExpiredTokens, 1000 * 60 * 60);
