// server/models/Board.js
const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  columns: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Column' }],
  code: { type: String, unique: true }
});

module.exports = mongoose.model('Board', boardSchema);