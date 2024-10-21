// src/components/Login.js
import React, { useState } from 'react'; // Importing React and useState hook
import { useNavigate } from 'react-router-dom'; // Importing useNavigate for navigation
import { Container, TextField, Button, Typography, Box } from '@mui/material'; // Importing Material-UI components
import { login } from '../services/auth'; // Importing login function from auth service

// Login component for user authentication
function Login() {
  const [email, setEmail] = useState(''); // State for email input
  const [password, setPassword] = useState(''); // State for password input
  const [error, setError] = useState(''); // State for error messages
  const navigate = useNavigate(); // Hook to programmatically navigate

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(''); // Clear previous error messages
    try {
      await login(email, password); // Attempt to log in with email and password
      navigate('/dashboard'); // Redirect to dashboard after successful login
    } catch (err) {
      console.error('Login error:', err); // Log error to console
      // Set error message based on response or default message
      setError(err.response?.data?.message || 'Network error. Please try again.');
    }
  };

  return (
    <Container maxWidth="xs"> {/* Container for centering the login form */}
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5"> {/* Title of the login form */}
          Sign In
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}> {/* Form element */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address" // Label for email input
            name="email"
            autoComplete="email" // Auto-complete for email
            autoFocus // Autofocus on this input
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
            autoComplete="current-password" // Auto-complete for current password
            value={password} // Controlled input for password
            onChange={(e) => setPassword(e.target.value)} // Update password state on change
          />
          <Button
            type="submit" // Submit button
            fullWidth
            variant="contained" // Material-UI contained button style
            sx={{ mt: 3, mb: 2 }} // Margin styles
          >
            Sign In
          </Button>
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

export default Login; // Export the Login component
