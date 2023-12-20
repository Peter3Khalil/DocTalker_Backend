const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    chatID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    },

    messageID : {
        type : mongoose.Schema.Types.ObjectId,
        required : true ,
    },
    
    feedbackMessage: {
        type :String ,
        required : true ,
        createdAt : {
            type : Date,
            default : Date.now()
        }
    },
}, {
    timestamps: true
});


module.exports = mongoose.model('Feedback', feedbackSchema);
