// server/controllers/boardController.js
const Board = require('../models/Board');

exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ owner: req.user._id });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, owner: req.user._id });
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createBoard = async (req, res) => {
  try {
    const { name } = req.body;
    const board = new Board({ name, owner: req.user._id });
    await board.save();
    res.status(201).json(board);
  } catch (error) {
    res.status(400).json({ message: 'Error creating board' });
  }
};

exports.joinBoard = async (req, res) => {
  try {
      const { code } = req.body;
      const board = await Board.findOne({ code });
      if (!board) {
          return res.status(404).json({ message: 'Board not found' });
      }
      if (!board.members.includes(req.user._id)) {
          board.members.push(req.user._id);
          await board.save();
      }
      res.json(board);
  } catch (error) {
      res.status(400).json({ message: 'Error joining board' });
  }
};

exports.updateBoard = async (req, res) => {
  try {
    const board = await Board.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    res.json(board);
  } catch (error) {
    res.status(400).json({ message: 'Board update failed' });
  }
};

exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};