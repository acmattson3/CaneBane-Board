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
  const response = await apiClient.get('/boards');
  return response.data;
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
  const response = await apiClient.get(`/boards/${id}`);
  return response.data;
};

export const createTask = async (boardId, taskData) => {
  const response = await apiClient.post(`/boards/${boardId}/tasks`, taskData);
  return response.data;
};