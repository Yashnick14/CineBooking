const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'User' },
    movie: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Movie' },
    screen: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Screen' },
    showDate: { type: Date, required: true },
    showTime: { type: String, required: true },
    seats: [
      {
        row: { type: Number, required: true },
        col: { type: Number, required: true },
        seatNumber: { type: String, required: true },
        price: { type: Number, required: true },
      }
    ],
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, required: true, default: 'Pending' }, // Pending, Paid, Cancelled
    bookingStatus: { type: String, required: true, default: 'Confirmed' },
    stripeSessionId: { type: String },
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
