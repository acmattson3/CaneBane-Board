const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/boards');
require('dotenv').config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('CaneBane API is running');
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});