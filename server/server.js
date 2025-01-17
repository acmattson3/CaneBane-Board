const express = require('express'); // Importing the Express framework
const cors = require('cors'); // Importing CORS middleware for cross-origin requests
const morgan = require('morgan'); // Importing Morgan for logging HTTP requests
const path = require('path'); // Importing path module to handle file paths
const connectDB = require('./config/db'); // Importing the database connection function
const authRoutes = require('./routes/auth'); // Importing authentication routes
const boardRoutes = require('./routes/boards'); // Importing board routes
require('dotenv').config(); // Loading environment variables from .env file

const app = express(); // Creating an instance of Express

// Connect to database
connectDB(); // Establishing a connection to the database

// Middleware
app.use(cors()); // Enabling CORS for all routes
app.use(express.json()); // Parsing incoming JSON requests
app.use(morgan('dev')); // Logging HTTP requests in development mode

// API Routes
app.use('/api/auth', authRoutes); // Setting up authentication routes
app.use('/api/boards', boardRoutes); // Setting up board routes

// Serve React Frontend
const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
app.use(express.static(clientBuildPath)); // Serve static files from React build directory

// Catch-all route to serve React app for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve(clientBuildPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => { // Middleware to handle errors
  console.error(err.stack); // Logging the error stack
  res.status(500).json({ message: 'Something went wrong!', error: err.message }); // Sending error response
});

// Start the server
const PORT = process.env.PORT || 5000; // Defining the port to listen on
app.listen(PORT, () => { // Starting the server
  console.log(`Server is running on port ${PORT}`); // Logging the server start message
});
