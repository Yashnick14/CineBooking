const express = require('express');
const router = express.Router();
const { createPaymentIntent, verifyPaymentAndCreateBooking } = require('../controllers/paymentController');
const { optionalProtect } = require('../middleware/authMiddleware');

router.post('/create-payment-intent', optionalProtect, createPaymentIntent);
router.post('/verify', verifyPaymentAndCreateBooking);

module.exports = router;
