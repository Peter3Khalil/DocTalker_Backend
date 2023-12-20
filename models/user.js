const mongoose = require('mongoose');
const { isEmail } = require('validator');



const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: [3, 'Minimum name length is 3 characters']
    },
    lastName: {
        type: String,
        required: true,
        minlength: [3, 'Minimum name length is 3 characters']
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
    },
    googleId: {
        type: String,
        unique: true,  // idk if this is needed -- google already gives unique IDs
        default: null
    },
    subscription: {
        type: String,
        enum: ['free', 'gold', 'premium'],
        default: 'free',
    },
    stripeCustomerId: {
        type: String,
        unique: true,
    },
    // check if the user already made the OTP or not 
    isVerified: {
        type : Boolean,
        default : false 
    },
    
    // array of chat ids that the user is in

    chats:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Chat'
    }],
    uploadRequest: {
        type: Number,
        default: 0,
    },
    maxUploadRequest: {
        type: Number,
        default: 2, // Default value for free subscription -- change if the user has a different subscription
    },
    queryRequest: {
        type: Number,
        default: 0,
    },
    queryMax: {
        type: Number,
        default: 5,  // Default value for free subscription -- change if the user has a different subscription
    },
    },
 {
    timestamps: true
 }
);

// RESET UPLOAD REQUEST AFTER 24 HOURS  -- 11:59 PM LOCAL TIME


// Function to reset the numbers
userSchema.methods.resetNumbers = function () {
    userSchema.uploadRequest = 0;
    this.uploadRequest = 0; // Reset uploadRequest
};

// Middleware to automatically reset numbers before saving
userSchema.pre('save', async function (next) {
    const now = new Date();
    console.log("hello from mongo middleware mf");
    // Calculate 11:59 pm in the user's local time
    const resetTime = new Date(now);
    resetTime.setHours(17, 37, 0, 0);

    // Check if it's past 11:59 pm in the user's local time
    if (now > resetTime) {
        this.resetNumbers();
    }

    next();
});

module.exports = mongoose.model('User', userSchema);



