/**
 * MongoDB connection configuration.
 * @module config/db
 */
const mongoose = require('mongoose');

/**
 * Connects to MongoDB using MONGO_URI (or a sensible local fallback).
 * @returns {Promise<void>} Resolves when the connection is established.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/apartment_management'
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;