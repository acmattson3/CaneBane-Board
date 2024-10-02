// server/models/Card.js
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  column: { type: mongoose.Schema.Types.ObjectId, ref: 'Column', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Card', cardSchema);