import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Box, CircularProgress } from '@mui/material';
import { getBoard, updateTask } from '../services/api';

const columns = [
  { id: 'Backlog', title: 'Backlog' },
  { id: 'To Do', title: 'To Do' },
  { id: 'Specification Active', title: 'Specification Active' },
  { id: 'Specification Done', title: 'Specification Done' },
  { id: 'Implementation Active', title: 'Implementation Active' },
  { id: 'Implementation Done', title: 'Implementation Done' },
  { id: 'Test', title: 'Test' },
  { id: 'Done', title: 'Done' }
];

function BoardView() {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBoard(id);
      console.log('Fetched board data:', JSON.stringify(data, null, 2));
      setBoard(data);
    } catch (error) {
      console.error('Error fetching board:', error);
      setError('Failed to load board data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    console.log('Fetching board...');
    fetchBoard();
  }, [fetchBoard]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!board || !board.tasks) return <Typography>No tasks found. Try refreshing the page.</Typography>;

  const groupedTasks = columns.reduce((acc, column) => {
    acc[column.id] = board.tasks.filter(tasks => tasks.status === column.id);
    return acc;
  }, {});

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Kanban Board: {board.name}</Typography>
      <Box display="flex" flexWrap="wrap" gap={2}>
        {columns.map(column => (
          <Box key={column.id} width={300} flexShrink={0}>
            <Paper sx={{ p: 2, minHeight: '300px' }}>
              <Typography variant="h6">{column.title}</Typography>
              <Box
                sx={{
                  background: 'lightgrey',
                  padding: 1,
                  minHeight: 500,
                }}
              >
                {groupedTasks[column.id]?.map((task) => (
                  <Paper
                    key={task._id}
                    sx={{
                      userSelect: 'none',
                      padding: 2,
                      margin: '0 0 8px 0',
                      minHeight: '50px',
                      backgroundColor: '#456C86',
                      color: 'white',
                    }}
                  >
                    <Typography variant="body2" gutterBottom>ID: {task._id}</Typography>
                    <Typography>{task.title}</Typography>
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Box>
        ))}
      </Box>
    </Container>
  );
}

export default BoardView;