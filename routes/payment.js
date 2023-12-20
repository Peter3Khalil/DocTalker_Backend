const express = require('express');
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middlewares/auth');
const router = express.Router();

// Create a payment intent
router.post('/create-payment-intent',auth, paymentController.createPaymentIntent);

// Process a payment
router.post('/process-payment',auth, paymentController.processPayment);

module.exports = router;
