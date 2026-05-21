const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { protect } = require('../middleware/auth');
const dotenv = require('dotenv');
dotenv.config();

let stripe;
const isMockMode = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.toLowerCase().includes('mock');
if (!isMockMode) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

router.post('/create-payment-intent', protect, async (req, res) => {
  const { amount, currency = 'inr', description = 'Vacation booking payment' } = req.body;
  const numericAmount = Number(amount);

  if (!numericAmount || numericAmount <= 0) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }

  if (!stripe) {
    return res.json({
      clientSecret: `mock_client_secret_${Date.now()}`,
      mode: 'mock'
    });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(numericAmount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
      description,
      metadata: {
        userId: req.user.id,
        integration: 'Vacation Booking System'
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
