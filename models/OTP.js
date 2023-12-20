const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    otpExpiresIn: {
        type: Date,
        required: true
    },
}, {
    timestamps: true
});

// Create a TTL index that expires documents after 20 minutes
otpSchema.index({ otpExpiresIn: 1 }, { expireAfterSeconds: 1200 }); // 1200 seconds = 20 minutes

module.exports = mongoose.model('OTP', otpSchema);
