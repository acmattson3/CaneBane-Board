import axios from 'axios'; // Import axios for making HTTP requests
import { getCurrentUser } from './auth'; // Import function to get current user data

const API_URL = '/api'; // Base URL for the API

// Create an axios instance with the base URL
const apiClient = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const user = getCurrentUser(); // Get the current user
    if (user && user.token) { // Check if user and token exist
      config.headers['Authorization'] = `Bearer ${user.token}`; // Set the Authorization header
    }
    return config; // Return the modified config
  },
  (error) => Promise.reject(error) // Handle request error
);

// Function to rename a board
export const renameBoard = async (boardId, newName) => {
  try {
    const response = await apiClient.put(`/boards/${boardId}/rename`, { name: newName }); // Make PUT request to rename board
    return response.data; // Return the data from the response
  } catch (error) {
    console.error('Error renaming board:', error); // Log error
    throw error; // Rethrow error
  }
};

// Function to get all boards
export const getBoards = async () => {
  const response = await apiClient.get('/boards'); // Make GET request to fetch boards
  return response.data; // Return the data from the response
};

// Function to create a new board
export const createBoard = async (name) => {
  const currentUser = getCurrentUser(); // Get the current user
  if (!currentUser || !currentUser.user || !currentUser.user.id) { // Validate user data
    throw new Error('User data is invalid or missing'); // Throw error if invalid
  }
  
  // Define default columns for the new board
  const defaultColumns = [
    { id: 'backlog', title: 'Backlog', hasSubsections: false },
    { id: 'specification', title: 'Specification', hasSubsections: true },
    { id: 'implementation', title: 'Implementation', hasSubsections: true },
    { id: 'test', title: 'Test', hasSubsections: false },
    { id: 'done', title: 'Done', hasSubsections: false }
  ];
  
  // Prepare board data to be sent in the request
  const boardData = { 
    name, 
    owner: currentUser.user.id, 
    columns: defaultColumns
  };
  
  const response = await apiClient.post('/boards', boardData); // Make POST request to create board
  return response.data; // Return the data from the response
};

// Function to join a board using a code
export const joinBoard = async (boardCode) => {
  try {
    const response = await apiClient.post('/boards/join', { boardCode }); // Use "boardCode" to match backend
    return response.data; // Return the data from the response
  } catch (error) {
    console.error('Error joining board:', error); // Log error
    throw error; // Rethrow error
  }
};


// Function to get a specific board by ID
export const getBoard = async (boardId) => {
  try {
    const response = await apiClient.get(`/boards/${boardId}`); // Make GET request to fetch board
    return response.data; // Return the data from the response
  } catch (error) {
    console.error('Error fetching board:', error); // Log error
    throw error; // Rethrow error
  }
};

// Function to create a task in a specific board
export const createTask = async (boardId, taskData) => {
  const response = await apiClient.post(`/boards/${boardId}/tasks`, taskData); // Make POST request to create task
  return response.data; // Return the data from the response
};

// Function to update a task in a specific board
export const updateTask = async (boardId, taskId, updatedData) => {
  try {
    const response = await apiClient.put(`/boards/${boardId}/tasks/${taskId}`, updatedData); // Make PUT request to update task
    return { success: true, task: response.data }; // Return success status and updated task data
  } catch (error) {
    console.error('Error updating task:', error); // Log error
    return { success: false, message: error.response?.data?.message || 'Failed to update task' }; // Return error message
  }
};

// Function to update a column in a specific board
export const updateColumn = async (boardId, columnId, updatedData) => {
  console.log(`Updating column: boardId=${boardId}, columnId=${columnId}`); // Log update action
  console.log('Updated data:', updatedData); // Log updated data
  try {
    const response = await apiClient.put(`/boards/${boardId}/columns/${columnId}`, updatedData); // Make PUT request to update column
    console.log('Update column response:', response.data); // Log response data
    return response.data; // Return the data from the response
  } catch (error) {
    console.error('Error updating column:', error.response || error); // Log error
    throw error; // Rethrow error
  }
};

// Function to delete a task from a specific board
export const deleteTask = async (boardId, taskId) => {
  try {
    const response = await apiClient.delete(`/boards/${boardId}/tasks/${taskId}`); // Make DELETE request to delete task
    return response.data; // Return the data from the response
  } catch (error) {
    console.error('Error deleting task:', error); // Log error
    throw error; // Rethrow error
  }
};

// Function to delete a board by ID
export const deleteBoard = async (boardId) => {
  try {
    const response = await apiClient.delete(`/boards/${boardId}`); // Make DELETE request to delete board
    return response.data; // Return the data from the response
  } catch (error) {
    console.error('Error deleting board:', error); // Log error
    throw error; // Rethrow error
  }
};

// Function to get members of a specific board
export const getBoardMembers = async (boardId) => {
  try {
    const response = await apiClient.get(`/boards/${boardId}/members`); // Make GET request to fetch board members
    return response.data; // Return the data from the response
  } catch (error) {
    console.error('Error fetching board members:', error); // Log error
    throw error; // Rethrow error
  }
};
