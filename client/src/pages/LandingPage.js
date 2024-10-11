// src/pages/LandingPage.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';

function LandingPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        justifyContent: 'center',
        //backgroundColor: '#f5f5f5', // Light grey background
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginTop: '-20vh',
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
            }}
          >
            Welcome to CaneBane
          </Typography>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              mb: 4,
              color: 'text.secondary',
            }}
          >
            Your personal Kanban board manager
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/signup"
            size="large"
            sx={{
              mt: 2,
              px: 4,
              py: 1,
              fontSize: '1.2rem',
            }}
          >
            Get Started
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
export default LandingPage;