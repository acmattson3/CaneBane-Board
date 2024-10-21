// src/components/Header.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Switch } from '@mui/material';

// Header component for the application
function Header({ darkMode, setDarkMode }) {
    return (
      <AppBar position="static"> {/* AppBar component for the header */}
        <Toolbar> {/* Toolbar to hold header elements */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CaneBane {/* Application title */}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}> {/* Box to align items in a row */}
            <Switch
              checked={darkMode} // Switch state based on darkMode prop
              onChange={() => setDarkMode(!darkMode)} // Toggle dark mode on change
              color="default" // Default color for the switch
            />
            <Typography variant="body2" sx={{ color: 'inherit', marginRight: 2 }}>
              {darkMode ? 'Light Mode' : 'Dark Mode'} {/* Display current mode */}
            </Typography>
            {/* Navigation buttons */}
            <Button color="inherit" component={RouterLink} to="/">Home</Button>
            <Button color="inherit" component={RouterLink} to="/dashboard">Dashboard</Button>
            <Button color="inherit" component={RouterLink} to="/login">Login</Button>
            <Button color="inherit" component={RouterLink} to="/signup">Sign Up</Button>
          </Box>
        </Toolbar>
      </AppBar>
    );
}

export default Header; // Export the Header component
