const jwt = require('jsonwebtoken'); // Import jsonwebtoken for token verification
const User = require('../models/User'); // Import User model for database operations

// Middleware function to authenticate users based on JWT
const auth = async (req, res, next) => {
  try {
    // Extract token from the Authorization header
    const token = req.header('Authorization').replace('Bearer ', '');
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Find the user associated with the decoded token ID
    const user = await User.findOne({ _id: decoded.id });

    // If user is not found, throw an error
    if (!user) {
      throw new Error('User not found');
    }

    // Attach the token and user information to the request object
    req.token = token; // Store the token in the request object
    req.user = user; // Store the user object in the request object
    console.log(`Authenticated user: ${user.name} (ID: ${user._id})`); // Log authenticated user information
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Authentication error:', error); // Log authentication error
    res.status(401).json({ message: 'Please authenticate' }); // Return unauthorized error response
  }
};

module.exports = auth; // Export the auth middleware for use in other files
