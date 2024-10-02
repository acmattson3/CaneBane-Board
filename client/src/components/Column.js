// src/components/Column.js
import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import Card from './Card';

function Column({ column }) {
  return (
    <Paper sx={{ minWidth: 300, m: 1, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {column.name}
      </Typography>
      <Box>
        {column.cards.map(card => (
          <Card key={card._id} card={card} />
        ))}
      </Box>
    </Paper>
  );
}

export default Column;