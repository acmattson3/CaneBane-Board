// src/pages/LandingPage.js
import React from 'react'; // Import React library
import { Link as RouterLink } from 'react-router-dom'; // Import RouterLink for navigation
import { Container, Typography, Button, Box } from '@mui/material'; // Import Material-UI components

function LandingPage() {
  return (
    <Box
      sx={{
        display: 'flex', // Use flexbox for layout
        flexDirection: 'column', // Stack children vertically
        minHeight: '100vh', // Full viewport height
        justifyContent: 'center', // Center content vertically
      }}
    >
      <Container maxWidth="md"> {/* Container for responsive layout */}
        <Box
          sx={{
            display: 'flex', // Use flexbox for layout
            flexDirection: 'column', // Stack children vertically
            alignItems: 'center', // Center children horizontally
            textAlign: 'center', // Center text
            marginTop: '-20vh', // Negative margin for positioning
          }}
        >
          <Typography
            variant="h2" // Heading level 2
            component="h1" // Render as an h1 element
            gutterBottom // Add bottom margin
            sx={{
              fontWeight: 'bold', // Bold text
              color: 'primary.main', // Primary color from theme
            }}
          >
            Welcome to CaneBane {/* Main heading */}
          </Typography>
          <Typography
            variant="h5" // Heading level 5
            component="h2" // Render as an h2 element
            gutterBottom // Add bottom margin
            sx={{
              mb: 4, // Margin bottom
              color: 'text.secondary', // Secondary text color from theme
            }}
          >
            Your personal Kanban board manager {/* Subheading */}
          </Typography>
          <Button
            variant="contained" // Filled button style
            color="primary" // Primary color from theme
            component={RouterLink} // Use RouterLink for navigation
            to="/signup" // Link to signup page
            size="large" // Large button size
            sx={{
              mt: 2, // Margin top
              px: 4, // Horizontal padding
              py: 1, // Vertical padding
              fontSize: '1.2rem', // Font size
            }}
          >
            Get Started {/* Button text */}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default LandingPage; // Export LandingPage component
