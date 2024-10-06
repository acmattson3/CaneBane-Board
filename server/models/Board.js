const mongoose = require('mongoose');
const shortid = require('shortid');

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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Board', boardSchema);