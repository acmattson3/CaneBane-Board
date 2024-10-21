// src/components/SignUp.js
import React, { useState } from 'react'; // Importing React and useState hook
import { useNavigate } from 'react-router-dom'; // Importing useNavigate for navigation
import { Link as RouterLink } from 'react-router-dom'; // Importing RouterLink for navigation links
import { Container, TextField, Button, Typography, Box } from '@mui/material'; // Importing Material-UI components
import { register } from '../services/auth'; // Importing register function from auth service

// SignUp component for user registration
function SignUp() {
  const [name, setName] = useState(''); // State for user's name
  const [email, setEmail] = useState(''); // State for user's email
  const [password, setPassword] = useState(''); // State for user's password
  const [error, setError] = useState(''); // State for error messages
  const navigate = useNavigate(); // Hook to programmatically navigate

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(''); // Clear previous error messages
    try {
      await register(name, email, password); // Attempt to register with name, email, and password
      navigate('/login'); // Redirect to login page after successful registration
    } catch (err) {
      // Set error message based on response or default message
      setError(err.response?.data?.message || 'An error occurred during registration');
    }
  };

  return (
    <Container maxWidth="xs"> {/* Container for centering the sign-up form */}
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5"> {/* Title of the sign-up form */}
          Sign Up
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}> {/* Form element */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name" // Label for name input
            name="name"
            autoComplete="name" // Auto-complete for name
            autoFocus // Autofocus on this input
            value={name} // Controlled input for name
            onChange={(e) => setName(e.target.value)} // Update name state on change
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address" // Label for email input
            name="email"
            autoComplete="email" // Auto-complete for email
            value={email} // Controlled input for email
            onChange={(e) => setEmail(e.target.value)} // Update email state on change
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password" // Label for password input
            type="password" // Password input type
            id="password"
            autoComplete="new-password" // Auto-complete for new password
            value={password} // Controlled input for password
            onChange={(e) => setPassword(e.target.value)} // Update password state on change
          />
          <Button
            type="submit" // Submit button
            fullWidth
            variant="contained" // Material-UI contained button style
            sx={{ mt: 3, mb: 2 }} // Margin styles
          >
            Sign Up
          </Button>
          <Box sx={{ mt: 2, textAlign: 'center' }}> {/* Box for the login link */}
            <Typography variant="body2">
              Already have an account?{' '}
              <RouterLink to="/login" style={{ textDecoration: 'none' }}> {/* Link to login page */}
                <Button color="primary" size="small">
                  Log In
                </Button>
              </RouterLink>
            </Typography>
          </Box>
          {error && ( // Conditionally render error message if exists
            <Typography color="error" align="center">
              {error} {/* Display error message */}
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default SignUp; // Export the SignUp component
