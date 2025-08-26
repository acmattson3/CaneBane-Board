const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

// Define the schema for tasks within a board
const taskSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['Backlog', 'Specification Active', 'Specification Done', 'Implementation Active', 'Implementation Done', 'Test', 'Done'],
    default: 'Backlog'
  },
  color: {
    type: String,
    required: false  
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Define the schema for columns within a board
const columnSchema = new mongoose.Schema({
  id: String,
  title: String,
  hasSubsections: Boolean,
  wipLimit: Number,
  doneRule: String
});

// Define the schema for the board itself
const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tasks: [taskSchema],
  columns: [columnSchema],
  code: {
    type: String,
    unique: true,
    default: () => nanoid(10)
  }
}, {
  timestamps: true
});

// Export the Board model based on the boardSchema
module.exports = mongoose.model('Board', boardSchema);
