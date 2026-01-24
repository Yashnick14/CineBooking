const Screen = require('../models/screenModel');

// @desc    Fetch all screens
// @route   GET /api/screens
// @access  Public
const getScreens = async (req, res) => {
  const screens = await Screen.find({});
  res.json(screens);
};

// @desc    Create a screen
// @route   POST /api/screens
// @access  Private/Admin
const createScreen = async (req, res) => {
  const { name, totalSeats, rows, cols, seatTypes } = req.body;

  const screen = new Screen({
    name,
    totalSeats,
    rows,
    cols,
    seatTypes,
  });

  const createdScreen = await screen.save();
  res.status(201).json(createdScreen);
};

// @desc    Update a screen
// @route   PUT /api/screens/:id
// @access  Private/Admin
const updateScreen = async (req, res) => {
  const { name, totalSeats, rows, cols, seatTypes } = req.body;

  const screen = await Screen.findById(req.params.id);

  if (screen) {
    screen.name = name || screen.name;
    screen.totalSeats = totalSeats || screen.totalSeats;
    screen.rows = rows || screen.rows;
    screen.cols = cols || screen.cols;
    screen.seatTypes = seatTypes || screen.seatTypes;

    const updatedScreen = await screen.save();
    res.json(updatedScreen);
  } else {
    res.status(404).json({ message: 'Screen not found' });
  }
};

// @desc    Delete a screen
// @route   DELETE /api/screens/:id
// @access  Private/Admin
const deleteScreen = async (req, res) => {
  const screen = await Screen.findById(req.params.id);

  if (screen) {
    await screen.deleteOne();
    res.json({ message: 'Screen removed' });
  } else {
    res.status(404).json({ message: 'Screen not found' });
  }
};

module.exports = { getScreens, createScreen, updateScreen, deleteScreen };
