const mongoose = require('mongoose'); // Import mongoose for MongoDB object modeling
require('dotenv').config(); // Load environment variables from .env file

// Function to connect to the MongoDB database
const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from environment variables
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true, // Use the new URL parser
      useUnifiedTopology: true, // Use the new unified topology layer
    });
    console.log('MongoDB connected successfully'); // Log success message
  } catch (error) {
    console.error('MongoDB connection error:', error); // Log connection error
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB; // Export the connectDB function for use in other files
