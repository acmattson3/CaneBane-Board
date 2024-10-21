// server/routes/auth.js
const express = require('express'); // Import express for routing
const { register, login } = require('../controllers/authController'); // Import authentication controller functions

const router = express.Router(); // Create a new router instance

// Route for user registration
router.post('/register', register); // Handle POST requests to /register with the register function

// Route for user login
router.post('/login', login); // Handle POST requests to /login with the login function

module.exports = router; // Export the router for use in other files
