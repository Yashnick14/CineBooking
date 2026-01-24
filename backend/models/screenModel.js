const mongoose = require('mongoose');

const screenSchema = mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., Screen 1, IMAX
    totalSeats: { type: Number, required: true },
    rows: { type: Number, required: true },
    cols: { type: Number, required: true },
    seatTypes: [
      {
        name: { type: String }, // e.g., Gold, Premium
        price: { type: Number },
      }
    ],
  },
  { timestamps: true }
);

const Screen = mongoose.model('Screen', screenSchema);
module.exports = Screen;
