import axios from 'axios';
import { getCurrentUser } from './auth';

const API_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const user = getCurrentUser();
    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getBoards = async () => {
  try {
    const response = await apiClient.get('/boards');
    console.log('API response for getBoards:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getBoards API call:', error);
    throw error;
  }
};

export const createBoard = async (name) => {
  const response = await apiClient.post('/boards', { name });
  return response.data;
};

export const joinBoard = async (code) => {
  const response = await apiClient.post('/boards/join', { code });
  return response.data;
};

export const getBoard = async (id) => {
  try {
    console.log('Fetching board with id:', id);
    const response = await apiClient.get(`/boards/${id}`);
    console.log('API response for getBoard:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getBoard API call:', error);
    console.error('Error response:', error.response);
    throw error;
  }
};