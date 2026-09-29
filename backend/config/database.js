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
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/startup-crm-lite';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error (${uri}): ${error.message}`);
    
    // Attempt automatic fallback to local MongoDB if primary fails
    const localUri = 'mongodb://127.0.0.1:27017/startup-crm-lite';
    if (uri !== localUri) {
      try {
        console.warn(`[MongoDB] Attempting fallback to local instance: ${localUri}`);
        const fallbackConn = await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB Connected (Fallback): ${fallbackConn.connection.host}`);
        return;
      } catch (fallbackError) {
        console.error(`MongoDB Local Fallback Error: ${fallbackError.message}`);
      }
    }
    
    console.warn('[MongoDB Warning] Could not connect to MongoDB. Express will remain running to return informative responses.');
  }
};

export default connectDB;
