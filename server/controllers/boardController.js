const Board = require('../models/Board'); // Import the Board model for database operations
const mongoose = require('mongoose'); // Import mongoose for ObjectId handling

// Function to get all boards for the current user
exports.getBoards = async (req, res) => {
  try {
    // Find boards where the user is either the owner or a member
    const boards = await Board.find({ $or: [{ owner: req.user.id }, { members: req.user.id }] });
    res.json(boards); // Respond with the list of boards
  } catch (error) {
    console.error('Error fetching boards:', error); // Log error
    res.status(500).json({ message: 'Error fetching boards', error: error.message }); // Return server error
  }
};

// Function to get a specific board by ID
exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id); // Find board by ID
    if (!board) {
      console.error(`Board not found: ${req.params.id}`); // Log if board not found
      return res.status(404).json({ message: 'Board not found' }); // Return not found error
    }
    
    // Log a success message without the board contents
    console.log(`Board loaded successfully: ${board.name} (ID: ${board._id})`); // Log board name and ID
    res.json(board); // Respond with the board data
  } catch (error) {
    console.error('Error fetching board:', error.message); // Log error
    res.status(500).json({ message: 'Error fetching board' }); // Return server error
  }
};

// Function to create a new board
exports.createBoard = async (req, res) => {
  try {
    const { name } = req.body; // Destructure board name from request body
    const owner = req.user.id; // Get the ID of the board owner

    // Create a new board instance with default columns
    const board = new Board({
      name,
      owner,
      members: [owner], // Add the owner to the members list
      columns: [
        { id: 'backlog', title: 'Backlog', hasSubsections: false, allowWipLimit: false },
        { id: 'specification', title: 'Specification', hasSubsections: true, allowWipLimit: true },
        { id: 'implementation', title: 'Implementation', hasSubsections: true, allowWipLimit: true },
        { id: 'test', title: 'Test', hasSubsections: false, allowWipLimit: true },
        { id: 'done', title: 'Done', hasSubsections: false, allowWipLimit: false }
      ]
    });

    await board.save(); // Save the new board to the database
    res.status(201).json(board); // Respond with the created board
  } catch (error) {
    console.error('Error creating board:', error); // Log error
    res.status(500).json({ message: 'Error creating board', error: error.message }); // Return server error
  }
};

// Function to update an existing board
exports.updateBoard = async (req, res) => {
  try {
    const { boardId } = req.params; // Get board ID from request parameters
    const { columns } = req.body; // Get updated columns from request body

    const board = await Board.findById(boardId); // Find board by ID
    if (!board) {
      return res.status(404).json({ error: 'Board not found' }); // Return not found error
    }

    // Update board columns with new data
    board.columns = columns.map(column => ({
      ...column,
      wipLimit: column.wipLimit || null, // Set WIP limit or null if not provided
      doneRule: column.doneRule || '' // Set done rule or empty string if not provided
    }));

    await board.save(); // Save the updated board
    res.status(200).json(board); // Respond with the updated board
  } catch (error) {
    console.error('Error updating board:', error.message); // Log error
    res.status(400).json({ error: 'Update failed' }); // Return bad request error
  }
};

// Function to delete a board
exports.deleteBoard = async (req, res) => {
  try {
    // Find and delete the board by ID and ensure the user is the owner
    const board = await Board.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!board) {
      return res.status(404).json({ message: 'Board not found or permission denied' }); // Return not found or permission error
    }
    res.json({ message: 'Board deleted successfully' }); // Respond with success message
  } catch (error) {
    console.error('Error deleting board:', error.message); // Log error
    res.status(500).json({ message: 'Deletion failed' }); // Return server error
  }
};

// Function to create a new task in a specific board
exports.createTask = async (req, res) => {
  try {
    const { id } = req.params; // Get board ID from request parameters
    const { title, status, color } = req.body; // Destructure task data from request body
    
    const board = await Board.findById(id); // Find board by ID
    if (!board) {
      return res.status(404).json({ message: 'Board not found' }); // Return not found error
    }

    // Create a new task object
    const newTask = {
      _id: new mongoose.Types.ObjectId().toString(), // Generate a new ObjectId for the task
      title,
      status: status || 'Backlog', // Default status is 'Backlog'
      color: color || '#' + Math.floor(Math.random()*16777215).toString(16) // Generate a random color if not provided
    };

    board.tasks.push(newTask); // Add the new task to the board's tasks
    await board.save(); // Save the updated board

    res.status(201).json(newTask); // Respond with the created task
  } catch (error) {
    console.error('Error creating task:', error); // Log error
    res.status(500).json({ message: 'Error creating task', error: error.message }); // Return server error
  }
};

// Function to update an existing task in a specific board
exports.updateTask = async (req, res) => {
  try {
    const { boardId, taskId } = req.params; // Get board ID and task ID from request parameters
    const { title, description, status, color, assignedTo } = req.body; // Destructure task data from request body

    const board = await Board.findById(boardId); // Find board by ID
    if (!board) {
      return res.status(404).json({ message: 'Board not found' }); // Return not found error
    }

    // Find the index of the task to update
    const taskIndex = board.tasks.findIndex(task => task._id.toString() === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' }); // Return not found error if task does not exist
    }

    // Update task properties with new data
    board.tasks[taskIndex].title = title || board.tasks[taskIndex].title;
    board.tasks[taskIndex].description = description || board.tasks[taskIndex].description;
    board.tasks[taskIndex].status = status || board.tasks[taskIndex].status;
    board.tasks[taskIndex].color = color || board.tasks[taskIndex].color;
    board.tasks[taskIndex].assignedTo = assignedTo || board.tasks[taskIndex].assignedTo;

    await board.save(); // Save the updated board

    res.json({ success: true, task: board.tasks[taskIndex] }); // Respond with success status and updated task
  } catch (error) {
    console.error('Error updating task:', error); // Log error
    res.status(500).json({ message: 'Error updating task', error: error.message }); // Return server error
  }
};

// Function to delete a task from a specific board
exports.deleteTask = async (req, res) => {
  try {
    const { boardId, taskId } = req.params; // Get board ID and task ID from request parameters

    const board = await Board.findById(boardId); // Find board by ID
    if (!board) {
      return res.status(404).json({ message: 'Board not found' }); // Return not found error
    }

    // Find the index of the task to delete
    const taskIndex = board.tasks.findIndex(task => task._id.toString() === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' }); // Return not found error if task does not exist
    }

    board.tasks.splice(taskIndex, 1); // Remove the task from the board's tasks
    await board.save(); // Save the updated board

    res.json({ message: 'Task deleted successfully' }); // Respond with success message
  } catch (error) {
    console.error('Error deleting task:', error); // Log error
    res.status(500).json({ message: 'Error deleting task', error: error.message }); // Return server error
  }
};

// Function to get members of a specific board
exports.getBoardMembers = async (req, res) => {
  try {
    const { boardId } = req.params; // Get board ID from request parameters
    const board = await Board.findById(boardId).populate('members', '_id name email'); // Find board and populate members' data
    if (!board) {
      return res.status(404).json({ message: 'Board not found' }); // Return not found error
    }
    res.json(board.members); // Respond with the list of board members
  } catch (error) {
    console.error('Error fetching board members:', error); // Log error
    res.status(500).json({ message: 'Error fetching board members', error: error.message }); // Return server error
  }
};

exports.joinBoard = async (req, res) => {
  try {
    const { boardCode } = req.body; // Assuming the client provides a unique board code to join
    const userId = req.user.id; // Authenticated user's ID

    // Find the board by its unique code
    const board = await Board.findOne({ code: boardCode });
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if the user is already a member of the board
    if (board.members.includes(userId)) {
      return res.status(400).json({ message: 'You are already a member of this board' });
    }

    // Add the user to the board's members
    board.members.push(userId);
    await board.save();

    res.status(200).json({ message: 'Joined the board successfully', board });
  } catch (error) {
    console.error('Error joining board:', error);
    res.status(500).json({ message: 'Error joining board', error: error.message });
  }
};

exports.updateColumn = async (req, res) => {
  try {
    const { boardId, columnId } = req.params; // Extract board and column IDs from request params
    const { title, wipLimit, doneRule } = req.body; // Extract updated column data from request body

    const board = await Board.findById(boardId); // Find the board by ID
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Find the column to update
    const columnIndex = board.columns.findIndex(column => column.id === columnId);
    if (columnIndex === -1) {
      return res.status(404).json({ message: 'Column not found' });
    }

    // Update column data
    const column = board.columns[columnIndex];
    column.title = title || column.title;
    column.wipLimit = wipLimit || column.wipLimit;
    column.doneRule = doneRule || column.doneRule;

    await board.save(); // Save the updated board

    res.status(200).json({ message: 'Column updated successfully', column });
  } catch (error) {
    console.error('Error updating column:', error.message);
    res.status(500).json({ message: 'Error updating column', error: error.message });
  }
};

// Function to rename a board
exports.renameBoard = async (req, res) => {
  try {
    const { name } = req.body;

    if (typeof name !== 'string') { // Validate the type of `name`
      return res.status(400).json({ message: 'Invalid name format. Name must be a string.' });
    }

    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (!board.owner.equals(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized to rename this board.' });
    }

    //process.stdout.write(`LOG!!! New board name: ${JSON.stringify(name)}\n`);
    console.log("LOG!!! New board name:", require('util').inspect(name, { depth: null }));
    board.name = String(name); // Update the board name
    await board.save();

    res.status(200).json({ message: 'Board renamed successfully.', board });
  } catch (error) {
    console.error('Error renaming board:', error);
    res.status(500).json({ message: 'Error renaming board' });
  }
};


