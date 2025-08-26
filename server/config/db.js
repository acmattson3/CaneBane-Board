const mongoose = require('mongoose'); // Import mongoose for MongoDB object modeling
require('dotenv').config(); // Load environment variables from .env file

// Determine the MongoDB connection string. Default to the Docker Compose
// service name when MONGODB_URI is not provided.
const mongoURI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/canebane';

// Function to connect to the MongoDB database
const connectDB = async () => {
  try {
    // Connect to MongoDB using the resolved URI
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true, // Use the new URL parser
      useUnifiedTopology: true, // Use the new unified topology layer
      useCreateIndex: true, // Use createIndex instead of deprecated ensureIndex
    });
    console.log('MongoDB connected successfully'); // Log success message
  } catch (error) {
    console.error('MongoDB connection error:', error); // Log connection error
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB; // Export the connectDB function for use in other files
