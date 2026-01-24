const express = require('express');
const router = express.Router();
const { addBookingItems, getBookingById, getMyBookings, getBookings, getOccupiedSeats } = require('../controllers/bookingController');
const { protect, optionalProtect, admin } = require('../middleware/authMiddleware');

router.get('/occupied-seats', getOccupiedSeats);
router.post('/', optionalProtect, addBookingItems);
router.get('/', protect, admin, getBookings);
router.get('/mybookings', protect, getMyBookings);
router.get('/:id', protect, getBookingById);

module.exports = router;
