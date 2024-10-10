// src/pages/LandingPage.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';

function LandingPage() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to CaneBane
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Your personal Kanban board manager
        </Typography>
        <Button variant="contained" color="primary" component={RouterLink} to="/login" sx={{ mt: 4 }}>
          Get Started
        </Button>
      </Box>
    </Container>
  );
}

export default LandingPage;