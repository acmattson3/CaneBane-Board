const Board = require('../models/Board');
const mongoose = require('mongoose');

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
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }
    console.log('Retrieved board:', JSON.stringify(board, null, 2));
    res.json(board);
  } catch (error) {
    console.error('Error retrieving board:', error);
    res.status(500).json({ message: 'Error retrieving board' });
  }
};

exports.createBoard = async (req, res) => {
  try {
    console.log('Received board creation request:', req.body);
    const { name, owner, columns } = req.body;
    
    if (!name || !owner || !columns) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const board = new Board({
      name,
      owner,
      columns: columns.map(column => ({
        ...column,
        wipLimit: column.wipLimit || null,
        doneRule: column.doneRule || ''
      }))
    });
    
    console.log('Creating board:', board);
    await board.save();
    console.log('Board created successfully');
    res.status(201).json(board);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { columns } = req.body;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    board.columns = columns.map(column => ({
      ...column,
      wipLimit: column.wipLimit || null,
      doneRule: column.doneRule || ''
    }));

    await board.save();
    res.status(200).json(board);
  } catch (error) {
    res.status(400).json({ error: error.message });
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
    const { id } = req.params; // board id
    const { title, status, color } = req.body;
    
    const board = await Board.findById(id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const newTask = {
      _id: new mongoose.Types.ObjectId().toString(),
      title,
      status: status || 'Backlog',
      color: color || '#' + Math.floor(Math.random()*16777215).toString(16)
    };

    board.tasks.push(newTask);
    await board.save();

    console.log('New task created:', newTask);

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { boardId, taskId } = req.params;
    const { title, description, status } = req.body;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const taskIndex = board.tasks.findIndex(task => task._id.toString() === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update the task
    board.tasks[taskIndex].title = title || board.tasks[taskIndex].title;
    board.tasks[taskIndex].description = description || board.tasks[taskIndex].description;
    board.tasks[taskIndex].status = status || board.tasks[taskIndex].status;
    board.tasks[taskIndex].updatedAt = new Date();

    await board.save();

    res.json(board.tasks[taskIndex]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

exports.joinBoard = async (req, res) => {
  try {
    const { code } = req.body;
    const board = await Board.findOne({ code });

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already a member of this board' });
    }

    board.members.push(req.user.id);
    await board.save();

    res.json(board);
  } catch (error) {
    console.error('Error joining board:', error);
    res.status(500).json({ message: 'Error joining board', error: error.message });
  }
};

exports.updateColumn = async (req, res) => {
  console.log('updateColumn called with params:', req.params);
  console.log('updateColumn request body:', req.body);
  try {
    const { boardId, columnId } = req.params;
    const { wipLimit, doneRule } = req.body;

    console.log(`Attempting to find board with id: ${boardId}`);
    const board = await Board.findById(boardId);
    if (!board) {
      console.log(`Board not found with id: ${boardId}`);
      return res.status(404).json({ error: 'Board not found' });
    }

    console.log(`Attempting to find column with id: ${columnId}`);
    const columnIndex = board.columns.findIndex(col => col.id === columnId);
    if (columnIndex === -1) {
      console.log(`Column not found with id: ${columnId}`);
      return res.status(404).json({ error: 'Column not found' });
    }

    board.columns[columnIndex].wipLimit = wipLimit;
    board.columns[columnIndex].doneRule = doneRule;

    console.log('Saving updated board');
    await board.save();
    console.log('Board saved successfully');
    res.status(200).json(board.columns[columnIndex]);
  } catch (error) {
    console.error('Error in updateColumn:', error);
    res.status(400).json({ error: error.message });
  }
};