const User = require('../models/User'); // Import User model for database operations
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for creating tokens

// Function to handle user registration
exports.register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body; // Destructure user data from request body
    const existingUser = await User.findOne({ $or: [{ email }, { username }] }); // Check if user already exists
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' }); // Return error if user exists
    }
    const user = new User({ name, username, email, password }); // Create a new user instance
    await user.save(); // Save the new user to the database
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' }); // Create a JWT token
    res.status(201).json({ token, user: { id: user._id, name: user.name, username: user.username, email: user.email } }); // Respond with token and user data
  } catch (error) {
    console.error('Registration error:', error.message); // Log registration error
    res.status(500).json({ message: 'Registration failed' }); // Return server error
  }
};

// Function to handle user login
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // Destructure user credentials from request body
    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] }); // Find user by email or username
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' }); // Return error if user not found
    }

    const isMatch = await user.comparePassword(password); // Compare provided password with stored password
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' }); // Return error if password does not match
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' }); // Create a JWT token
    res.json({ token, user: { id: user._id, name: user.name, username: user.username, email: user.email } }); // Respond with token and user data
  } catch (error) {
    console.error('Login error:', error.message); // Log login error
    res.status(500).json({ message: 'Login failed' }); // Return server error
  }
};
