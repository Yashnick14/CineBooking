const express = require('express');
const router = express.Router();
const { getScreens, createScreen, updateScreen, deleteScreen } = require('../controllers/screenController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getScreens).post(protect, admin, createScreen);
router.route('/:id').put(protect, admin, updateScreen).delete(protect, admin, deleteScreen);

module.exports = router;
