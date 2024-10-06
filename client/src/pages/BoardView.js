import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, CircularProgress } from '@mui/material';
import { getBoard } from '../services/api';

function BoardView() {
  const [board, setBoard] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        console.log('Fetching board with id:', id);
        const data = await getBoard(id);
        console.log('Fetched board data:', data);
        setBoard(data);
      } catch (error) {
        console.error('Error fetching board:', error);
        if (error.response && error.response.status === 404) {
          setError('Board not found. It may have been deleted or you may not have permission to view it.');
        } else {
          setError('An error occurred while fetching the board. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [id]);

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  if (!board) {
    return (
      <Container>
        <Typography variant="h6" gutterBottom>
          No board data available.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {board.name}
      </Typography>
      {/* Add more board details and functionality here */}
      <Button variant="contained" onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </Button>
    </Container>
  );
}

export default BoardView;