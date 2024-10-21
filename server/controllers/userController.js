// server/controllers/userController.js
const User = require('../models/User'); // Import the User model for database operations

// Function to get user details by ID
exports.getUser = async (req, res) => {
  try {
    // Find user by ID and exclude the password field from the result
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); // Return error if user not found
    }
    res.json(user); // Respond with the user data
  } catch (error) {
    console.error('Error fetching user:', error); // Log error
    res.status(500).json({ message: 'Server error' }); // Return server error
  }
};

// Function to update user details
exports.updateUser = async (req, res) => {
  try {
    // Find user by ID and update with the provided data, excluding the password field
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); // Return error if user not found
    }
    res.json(user); // Respond with the updated user data
  } catch (error) {
    console.error('Error updating user:', error); // Log error
    res.status(400).json({ message: 'User update failed' }); // Return bad request error
  }
};
