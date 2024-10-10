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
  try {
    const response = await apiClient.post('/boards/join', { code });
    return response.data;
  } catch (error) {
    console.error('Error joining board:', error);
    throw error;
  }
};

export const getBoard = async (boardId) => {
  try {
    const response = await apiClient.get(`/boards/${boardId}`);
    console.log('API response for getBoard:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching board:', error);
    throw error;
  }
};

export const createTask = async (boardId, taskData) => {
  const response = await apiClient.post(`/boards/${boardId}/tasks`, taskData);
  return response.data;
};

export const updateTask = async (boardId, taskId, updatedData) => {
  try {
    const response = await apiClient.put(`/boards/${boardId}/tasks/${taskId}`, updatedData);
    return { success: true, task: response.data };
  } catch (error) {
    console.error('Error updating task:', error);
    return { success: false, message: error.response?.data?.message || 'Failed to update task' };
  }
};

export const updateColumn = async (boardId, columnId, updatedData) => {
  console.log(`Updating column: boardId=${boardId}, columnId=${columnId}`);
  console.log('Updated data:', updatedData);
  try {
    const response = await apiClient.put(`/boards/${boardId}/columns/${columnId}`, updatedData);
    console.log('Update column response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating column:', error.response || error);
    throw error;
  }
};