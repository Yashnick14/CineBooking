const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Screen = require('./models/screenModel');
const connectDB = require('./config/db');

dotenv.config();

const screens = [
  {
    name: 'Silver',
    totalSeats: 100,
    rows: 10,
    cols: 10,
    seatTypes: [
      { name: 'Standard', price: 200 },
      { name: 'Executive', price: 350 }
    ]
  },
  {
    name: 'Platinum',
    totalSeats: 50,
    rows: 5,
    cols: 10,
    seatTypes: [
      { name: 'Premium', price: 500 },
      { name: 'VIP', price: 800 }
    ]
  }
];

const seedScreens = async () => {
  await connectDB();

  try {
    for (const screenData of screens) {
      const screenExists = await Screen.findOne({ name: screenData.name });
      if (!screenExists) {
        await Screen.create(screenData);
        console.log(`${screenData.name} screen created`);
      } else {
        console.log(`${screenData.name} screen already exists`);
      }
    }
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedScreens();
