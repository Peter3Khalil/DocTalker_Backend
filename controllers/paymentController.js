const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/user');


// Create a payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const amount = req.body.amount;
    const currency = req.body.currency;
    const userId = req.body.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: user.stripeCustomerId,
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Process a payment
exports.processPayment = async (req, res) => {
  const { paymentMethodId, paymentIntentId, userId } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId,
    });

    const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

    // Handle successful payment logic here
    // Update the user's subscription or order status, if needed

    res.json({ message: 'Payment successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
