// client/src/services/auth.js
import axios from 'axios'; // Import axios for making HTTP requests

const API_URL = 'http://localhost:5000/api/auth'; // Base URL for authentication API

// Function to register a new user
export const register = async (name, email, password) => {
  // Make a POST request to the register endpoint with user details
  const response = await axios.post(`${API_URL}/register`, { name, email, password });
  
  // If a token is returned, store user data in local storage
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data)); // Store user data
  }
  
  return response.data; // Return the response data
};

// Function to log in an existing user
export const login = async (email, password) => {
  // Make a POST request to the login endpoint with user credentials
  const response = await axios.post(`${API_URL}/login`, { email, password });
  
  // If a token is returned, store user data in local storage
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data)); // Store user data
  }
  
  return response.data; // Return the response data
};

// Function to log out the current user
export const logout = () => {
  localStorage.removeItem('user'); // Remove user data from local storage
};

// Function to get the current logged-in user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user'); // Retrieve user data from local storage
  if (userStr) return JSON.parse(userStr); // Parse and return user data if it exists
  return null; // Return null if no user data is found
};
