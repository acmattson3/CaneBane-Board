const mongoose = require('mongoose');
const shortid = require('shortid');

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
  status: {
    type: String,
    required: true,
    enum: ['Backlog', 'To Do', 'Specification Active', 'Specification Done', 'Implementation Active', 'Implementation Done', 'Test', 'Done'],
    default: 'Backlog'
  },
  color: {
    type: String,
    required: false  
  },
  description: {
    type: String,
    trim: true
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
  code: {
    type: String,
    unique: true,
    default: shortid.generate
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Board', boardSchema);