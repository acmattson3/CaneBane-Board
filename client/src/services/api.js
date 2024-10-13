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
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.user || !currentUser.user.id) {
    throw new Error('User data is invalid or missing');
  }
  
  const defaultColumns = [
    { id: 'backlog', title: 'Backlog', hasSubsections: false },
    { id: 'specification', title: 'Specification', hasSubsections: true },
    { id: 'implementation', title: 'Implementation', hasSubsections: true },
    { id: 'test', title: 'Test', hasSubsections: false },
    { id: 'done', title: 'Done', hasSubsections: false }
  ];
  
  const boardData = { 
    name, 
    owner: currentUser.user.id, 
    columns: defaultColumns
  };
  
  const response = await apiClient.post('/boards', boardData);
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

export const deleteTask = async (boardId, taskId) => {
  try {
    const response = await apiClient.delete(`/boards/${boardId}/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const deleteBoard = async (boardId) => {
  try {
    const response = await apiClient.delete(`/boards/${boardId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting board:', error);
    throw error;
  }
};