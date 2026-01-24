const express = require('express');
const router = express.Router();
const { registerUser, authUser, getUsers } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/login', authUser);

module.exports = router;
