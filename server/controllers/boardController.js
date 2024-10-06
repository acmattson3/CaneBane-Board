const Board = require('../models/Board');

exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ $or: [{ owner: req.user.id }, { members: req.user.id }] });
    res.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ message: 'Error fetching boards', error: error.message });
  }
};

exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, $or: [{ owner: req.user.id }, { members: req.user.id }] });
    if (!board) {
      return res.status(404).json({ message: 'Board not found or you do not have permission to view it' });
    }
    res.json(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ message: 'Error fetching board', error: error.message });
  }
};

exports.createBoard = async (req, res) => {
  try {
    const { name } = req.body;
    const newBoard = new Board({
      name,
      owner: req.user.id,
      members: [req.user.id]
    });
    const savedBoard = await newBoard.save();
    res.status(201).json(savedBoard);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ message: 'Error creating board', error: error.message });
  }
};

exports.updateBoard = async (req, res) => {
  try {
    const board = await Board.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!board) {
      return res.status(404).json({ message: 'Board not found or you do not have permission to update' });
    }
    res.json(board);
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ message: 'Error updating board', error: error.message });
  }
};

exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!board) {
      return res.status(404).json({ message: 'Board not found or you do not have permission to delete' });
    }
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({ message: 'Error deleting board', error: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status } = req.body;
    
    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const newTask = { title, status };
    board.tasks.push(newTask);
    await board.save();

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { boardId, taskId } = req.params;
    const { status } = req.body;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const task = board.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status;
    await board.save();

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};