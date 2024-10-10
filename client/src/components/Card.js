// src/components/Card.js
import React from 'react';
import { Card as MUICard, CardContent, Typography } from '@mui/material';

function Card({ card }) {
  return (
    <MUICard sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" component="h3">
          {card.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {card.description}
        </Typography>
      </CardContent>
    </MUICard>
  );
}

export default Card;