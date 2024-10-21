// src/App.js
import React, { useState } from 'react'; // Import React and useState hook
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Router components for navigation
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'; // Import Material-UI components
import LandingPage from './pages/LandingPage'; // Import LandingPage component
import Dashboard from './pages/Dashboard'; // Import Dashboard component
import BoardView from './pages/BoardView'; // Import BoardView component
import Login from './components/Login'; // Import Login component
import Header from './components/Header'; // Import Header component
import SignUp from './components/SignUp'; // Import SignUp component

function App() {
  const [darkMode, setDarkMode] = useState(false); // State to manage dark mode

  // Create a theme based on the darkMode state
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light', // Set theme mode based on darkMode state
      primary: {
        main: '#1976d2', // Primary color
      },
      secondary: {
        main: '#dc004e', // Secondary color
      },
    },
  });

  return (
    <ThemeProvider theme={theme}> {/* Provide the theme to the application */}
      <CssBaseline /> {/* Normalize CSS styles */}
      <Router> {/* Set up routing for the application */}
        <Header darkMode={darkMode} setDarkMode={setDarkMode} /> {/* Render Header with dark mode props */}
        <Routes> {/* Define application routes */}
          <Route path="/" element={<LandingPage />} /> {/* Route for LandingPage */}
          <Route path="/login" element={<Login />} /> {/* Route for Login */}
          <Route path="/signup" element={<SignUp />} /> {/* Route for SignUp */}
          <Route path="/dashboard" element={<Dashboard />} /> {/* Route for Dashboard */}
          <Route path="/board/:id" element={<BoardView darkMode={darkMode} />} /> {/* Route for BoardView with dynamic ID */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; // Export App component
