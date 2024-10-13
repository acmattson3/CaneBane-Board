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