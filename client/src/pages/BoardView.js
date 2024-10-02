// src/pages/BoardView.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';
import { getBoard } from '../services/api';
import Column from '../components/Column';

function BoardView() {
  const [board, setBoard] = useState(null);
  const { id } = useParams();

  const fetchBoard = useCallback(async () => {
    try {
      const data = await getBoard(id);
      setBoard(data);
    } catch (error) {
      console.error('Error fetching board:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  if (!board) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {board.name}
      </Typography>
      <Box sx={{ display: 'flex', overflowX: 'auto' }}>
        {board.columns.map(column => (
          <Column key={column._id} column={column} />
        ))}
      </Box>
    </Container>
  );
}

export default BoardView;