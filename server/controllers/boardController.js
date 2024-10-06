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
    const boardId = req.params.id;
    console.log('Fetching board with ID:', boardId);
    
    const board = await Board.findById(boardId);
    
    if (!board) {
      console.log('Board not found for ID:', boardId);
      return res.status(404).json({ message: 'Board not found' });
    }
    
    if (!board.members.includes(req.user.id) && board.owner.toString() !== req.user.id) {
      console.log('User does not have permission to view board:', boardId);
      return res.status(403).json({ message: 'You do not have permission to view this board' });
    }
    
    console.log('Board found:', board);
    res.json(board);
  } catch (error) {
    console.error('Error in getBoard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createBoard = async (req, res) => {
  try {
    console.log('Creating new board with data:', req.body);
    console.log('User creating board:', req.user);

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Board name is required' });
    }

    const newBoard = new Board({
      name,
      owner: req.user.id,
      members: [req.user.id]
    });

    console.log('New board object:', newBoard);

    const savedBoard = await newBoard.save();
    console.log('Saved board:', savedBoard);

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

exports.listBoardIds = async (req, res) => {
  try {
    const boards = await Board.find({ $or: [{ owner: req.user.id }, { members: req.user.id }] }, '_id');
    res.json(boards.map(board => board._id));
  } catch (error) {
    console.error('Error listing board IDs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};