const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Connection to MongoDB failed: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
