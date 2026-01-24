const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');
const connectDB = require('./config/db');

dotenv.config();

const seedAdmin = async () => {
  await connectDB();

  try {
    const adminEmail = 'yashnick514@gmail.com';
    const adminPassword = 'Yash123';

    const userExists = await User.findOne({ email: adminEmail });

    if (userExists) {
      userExists.password = adminPassword;
      userExists.isAdmin = true;
      await userExists.save();
      console.log('Admin user updated successfully');
    } else {
      await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: adminPassword,
        isAdmin: true,
      });
      console.log('Admin user created successfully');
    }

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
