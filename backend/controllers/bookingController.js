const Booking = require('../models/bookingModel');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const addBookingItems = async (req, res) => {
  const { movie, screen, showDate, showTime, seats, totalAmount } = req.body;

  if (seats && seats.length === 0) {
    res.status(400).json({ message: 'No seats selected' });
    return;
  } else {
    const booking = new Booking({
      user: req.user ? req.user._id : null,
      movie,
      screen,
      showDate,
      showTime,
      seats,
      totalAmount,
    });

    const createdBooking = await booking.save();
    res.status(201).json(createdBooking);
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'name email')
    .populate('movie', 'title')
    .populate('screen', 'name');

  if (booking) {
    res.json(booking);
  } else {
    res.status(404).json({ message: 'Booking not found' });
  }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('movie', 'title posterUrl')
    .populate('screen', 'name');
  res.json(bookings);
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
const getBookings = async (req, res) => {
  const bookings = await Booking.find({})
    .populate('user', 'id name')
    .populate('movie', 'title')
    .populate('screen', 'name');
  res.json(bookings);
};

// @desc    Get occupied seats for a show
// @route   GET /api/bookings/occupied-seats
// @access  Public
const getOccupiedSeats = async (req, res) => {
  const { movie, showDate, showTime } = req.query;

  try {
    const bookings = await Booking.find({
      movie,
      showDate,
      showTime,
    });

    // Flatten all seats from all matching bookings
    const occupiedSeats = bookings.reduce((acc, booking) => {
      const seats = booking.seats.map(s => `${s.row}-${s.col}`);
      return [...acc, ...seats];
    }, []);

    res.json(occupiedSeats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching occupied seats' });
  }
};

module.exports = { addBookingItems, getBookingById, getMyBookings, getBookings, getOccupiedSeats };
