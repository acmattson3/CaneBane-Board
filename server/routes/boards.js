const express = require('express');
const { 
  getBoards, 
  getBoard, 
  createBoard, 
  updateBoard, 
  deleteBoard, 
  createTask,
  updateTask  // Add this line
} = require('../controllers/boardController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', getBoards);
router.get('/:id', getBoard);
router.post('/', createBoard);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);
router.post('/:id/tasks', createTask);
router.put('/:boardId/tasks/:taskId', updateTask);  // This line should now work

module.exports = router;