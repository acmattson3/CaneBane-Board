const mongoose = require('mongoose');
const shortid = require('shortid');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Backlog', 'To Do', 'In Progress', 'Done'],
    default: 'Backlog'
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
  code: {
    type: String,
    unique: true,
    default: shortid.generate
  },
  tasks: [taskSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Board', boardSchema);