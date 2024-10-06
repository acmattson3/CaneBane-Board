import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Grid, Paper, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { getBoard, createTask } from '../services/api';

const columns = ['Backlog', 'To Do', 'In Progress', 'Done'];

function BoardView() {
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [openNewTaskDialog, setOpenNewTaskDialog] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const data = await getBoard(id);
        setBoard(data);
        setTasks(data.tasks || []);
      } catch (error) {
        console.error('Error fetching board:', error);
      }
    };
    fetchBoard();
  }, [id]);

  const handleNewTask = async () => {
    try {
      const newTask = await createTask(id, { title: newTaskTitle, status: 'Backlog' });
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setOpenNewTaskDialog(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  if (!board) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {board.name}
      </Typography>
      <Button variant="contained" onClick={() => setOpenNewTaskDialog(true)}>
        New Task
      </Button>
      <Box mt={3}>
        <Grid container spacing={3}>
          {columns.map(column => (
            <Grid item xs={3} key={column}>
              <Paper elevation={3} sx={{ p: 2, height: '70vh', overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom>{column}</Typography>
                {tasks
                  .filter(task => task.status === column)
                  .map(task => (
                    <Paper key={task._id} sx={{ p: 1, mb: 1 }}>
                      {task.title}
                    </Paper>
                  ))
                }
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Dialog open={openNewTaskDialog} onClose={() => setOpenNewTaskDialog(false)}>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewTaskDialog(false)}>Cancel</Button>
          <Button onClick={handleNewTask}>Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default BoardView;