const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Replace with your actual MongoDB URI later, or use Env variables
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dropout-prediction');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
