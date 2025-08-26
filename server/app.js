// server/app.js
const express = require('express'); // Import express framework
const cors = require('cors'); // Import CORS middleware for handling cross-origin requests
const mongoose = require('mongoose'); // Import mongoose for MongoDB object modeling
require('dotenv').config(); // Load environment variables from .env file

const authRoutes = require('./routes/auth'); // Import authentication routes
const boardRoutes = require('./routes/boards'); // Import board routes
const userRoutes = require('./routes/users'); // Import user routes

const app = express(); // Create an instance of the express application

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse incoming JSON requests

// Determine the MongoDB connection string. Default to the Docker Compose
// service name when MONGODB_URI is not provided.
const mongoURI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/canebane';

// Connect to MongoDB using the resolved URI
mongoose.connect(mongoURI, {
  useNewUrlParser: true, // Use the new URL parser
  useUnifiedTopology: true, // Use the new unified topology layer
});

// Set up routes for the application
app.use('/api/auth', authRoutes); // Route for authentication requests
app.use('/api/boards', boardRoutes); // Route for board requests
app.use('/api/users', userRoutes); // Route for user requests

// Export the app instance for use in other files (e.g., server.js)
module.exports = app;
