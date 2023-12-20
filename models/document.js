const mongoose = require('mongoose');


const documentSchema = new mongoose.Schema({
    FileName: {
        type: String,
        required: true
    },
    FileUrl: {
        type: String,
        required: true
    },
    
    Chunks : [
        {
            rawText : String,
            embeddings : [Number]
        }
    ] ,

    isProcessed: {
        type: Boolean,
        default: false
   }

}, {
    timestamps: true
});


module.exports = mongoose.model('Document', documentSchema);
