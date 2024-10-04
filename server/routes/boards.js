// server/routes/boards.js
const express = require('express');
const { 
    getBoards, 
    getBoard, 
    createBoard, 
    updateBoard, 
    deleteBoard,
    joinBoard
} = require('../controllers/boardController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', getBoards);
router.get('/:id', getBoard);
router.post('/', createBoard);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);
router.post('/join', joinBoard);

module.exports = router;