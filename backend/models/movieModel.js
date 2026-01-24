const mongoose = require('mongoose');

const movieSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    posterUrl: { type: String },
    trailerUrl: { type: String },
    genre: { type: [String], required: true },
    duration: { type: Number, required: true }, // in minutes
    releaseDate: { type: Date, required: false },
    language: { type: String, required: true },
    cast: { type: [String] },
    status: { 
      type: String, 
      enum: ['Now Showing', 'Coming Soon'], 
      default: 'Now Showing' 
    },
    screen: { type: String, required: false },
    showTimes: { type: [String], required: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;
