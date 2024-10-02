// client/src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const getBoards = async () => {
  const response = await axios.get(`${API_URL}/boards`);
  return response.data;
};

export const getBoard = async (id) => {
  const response = await axios.get(`${API_URL}/boards/${id}`);
  return response.data;
};