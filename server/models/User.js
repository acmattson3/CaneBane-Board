const mongoose = require('mongoose'); // Import mongoose for MongoDB object modeling
const bcrypt = require('bcryptjs'); // Import bcrypt for hashing passwords

// Define the schema for the user
const userSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true // Display Name is required
  },
  username: {
    type: String,
    required: true,
    unique: true // Username must be unique
  },
  email: {
    type: String,
    required: true,
    unique: true // Email must be unique
  },
  password: { 
    type: String, 
    required: true // Password is required
  }
}, { collection: 'users' }); // Specify the collection name in MongoDB

// Pre-save middleware to hash the password before saving the user
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) { // Check if the password has been modified
    this.password = await bcrypt.hash(this.password, 8); // Hash the password with a salt round of 8
  }
  next(); // Proceed to the next middleware or save operation
});

// Method to compare a candidate password with the stored hashed password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password); // Compare and return the result
};

// Export the User model based on the userSchema
module.exports = mongoose.model('User', userSchema);
