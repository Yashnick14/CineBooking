// Initialize Stripe only if the secret key is available
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.error('⚠️  WARNING: STRIPE_SECRET_KEY is not set!');
  console.error('Payment features will not work until you add your Stripe key to .env');
  // Create a dummy stripe object to prevent crashes
  stripe = {
    checkout: {
      sessions: {
        create: async () => { throw new Error('Stripe not configured'); },
        retrieve: async () => { throw new Error('Stripe not configured'); }
      }
    }
  };
}

const Booking = require('../models/bookingModel');

// @desc    Create Stripe Payment Intent
// @route   POST /api/payments/create-payment-intent
// @access  Public
const createPaymentIntent = async (req, res) => {
  try {
    const { totalAmount, bookingData } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'lkr',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingData: JSON.stringify(bookingData), // Store booking data in metadata
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe PaymentIntent creation error:', error.message);
    res.status(500).json({ message: `Payment failed: ${error.message}` });
  }
};

// @desc    Verify payment and create booking
// @route   POST /api/payments/verify
// @access  Public
const verifyPaymentAndCreateBooking = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const bookingData = JSON.parse(paymentIntent.metadata.bookingData);
      
      const booking = new Booking({
        ...bookingData,
        paymentStatus: 'Paid',
        stripeSessionId: paymentIntentId, // Using PaymentIntent ID as the reference
      });

      const createdBooking = await booking.save();
      res.status(201).json(createdBooking);
    } else {
      res.status(400).json({ message: 'Payment not completed or failed' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

module.exports = {
  createPaymentIntent,
  verifyPaymentAndCreateBooking,
};
