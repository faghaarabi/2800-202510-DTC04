const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Remove deprecated options
    const conn = await mongoose.connect(process.env.DATABASE_URL);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;