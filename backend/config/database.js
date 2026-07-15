import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables in case this module is loaded/tested independently
dotenv.config();

/**
 * Connects to the MongoDB Atlas database.
 * Uses configuration options to ensure compatibility with modern MongoDB setups.
 * Logs connection host on success or exits the application with an error code on failure.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when connection is successful
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
