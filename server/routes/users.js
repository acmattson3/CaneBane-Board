// server/routes/users.js
const express = require('express'); // Import express for routing
const { getUser, updateUser } = require('../controllers/userController'); // Import user controller functions
const auth = require('../middleware/auth'); // Import authentication middleware

const router = express.Router(); // Create a new router instance

router.use(auth); // Apply authentication middleware to all routes

// Route to get a specific user by ID
router.get('/:id', getUser); // Handle GET requests to /:id for fetching user details

// Route to update a specific user by ID
router.put('/:id', updateUser); // Handle PUT requests to /:id for updating user details

module.exports = router; // Export the router for use in other files
