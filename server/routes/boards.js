const express = require('express');
const { 
  getBoards, 
  getBoard, 
  createBoard, 
  updateBoard, 
  deleteBoard, 
  createTask,
  updateTask,
  joinBoard,
  updateColumn,
  deleteTask,
  getBoardMembers
} = require('../controllers/boardController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// Route to get all boards for the authenticated user
router.get('/', getBoards);

// Route to get a specific board by ID
router.get('/:id', getBoard);

// Route to create a new board
router.post('/', createBoard);

// Route to update an existing board by ID
router.put('/:id', updateBoard);

// Route to delete a board by ID
router.delete('/:id', deleteBoard);

// Route to create a new task in a specific board
router.post('/:id/tasks', createTask);

// Route to update an existing task in a specific board
router.put('/:boardId/tasks/:taskId', updateTask);

// Route to join a board using a code
router.post('/join', joinBoard);

// Route to update a column in a specific board
router.put('/:boardId/columns/:columnId', updateColumn);

// Route to delete a task from a specific board
router.delete('/:boardId/tasks/:taskId', deleteTask);

// Route to get members of a specific board
router.get('/:boardId/members', getBoardMembers);

module.exports = router;

// Apply auth middleware to all routes
router.get('/', auth, getBoards);
router.get('/:id', auth, getBoard);
router.post('/', auth, createBoard);
router.put('/:id', auth, updateBoard);
router.delete('/:id', auth, deleteBoard);
router.post('/:id/tasks', auth, createTask);
router.put('/:boardId/tasks/:taskId', auth, updateTask);
router.post('/join', auth, joinBoard);
router.put('/:boardId/columns/:columnId', auth, updateColumn);
router.delete('/:boardId/tasks/:taskId', auth, deleteTask);
router.get('/:boardId/members', auth, getBoardMembers);

module.exports = router;