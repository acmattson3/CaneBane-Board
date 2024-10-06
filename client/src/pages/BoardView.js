import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Grid, Paper, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import AddIcon from '@mui/icons-material/Add';
import { getBoard, createTask, updateTask } from '../services/api';

const columns = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'todo', title: 'To Do' },
  { id: 'inProgress', title: 'In Progress' },
  { id: 'done', title: 'Done' }
];

function BoardView() {
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState({});
  const [openNewTaskDialog, setOpenNewTaskDialog] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeColumn, setActiveColumn] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const data = await getBoard(id);
        setBoard(data);
        const groupedTasks = groupTasksByStatus(data.tasks || []);
        setTasks(groupedTasks);
      } catch (error) {
        console.error('Error fetching board:', error);
      }
    };
    fetchBoard();
  }, [id]);

  const groupTasksByStatus = (tasks) => {
    const grouped = columns.reduce((acc, column) => {
      acc[column.id] = [];
      return acc;
    }, {});

    tasks.forEach(task => {
      const status = task.status.toLowerCase().replace(' ', '');
      if (grouped[status]) {
        grouped[status].push(task);
      } else {
        grouped['backlog'].push(task);
      }
    });

    return grouped;
  };

  const handleNewTask = async () => {
    try {
      const newTask = await createTask(id, { title: newTaskTitle, status: columns.find(col => col.id === activeColumn).title });
      setTasks(prev => ({
        ...prev,
        [activeColumn]: [...(prev[activeColumn] || []), newTask]
      }));
      setNewTaskTitle('');
      setOpenNewTaskDialog(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;

    const newTasks = { ...tasks };

    if (!newTasks[sourceColumn]) newTasks[sourceColumn] = [];
    if (!newTasks[destColumn]) newTasks[destColumn] = [];

    const [movedTask] = newTasks[sourceColumn].splice(source.index, 1);
    newTasks[destColumn].splice(destination.index, 0, movedTask);

    movedTask.status = columns.find(col => col.id === destColumn).title;

    setTasks(newTasks);

    try {
      await updateTask(id, movedTask._id, { status: movedTask.status });
    } catch (error) {
      console.error('Error updating task:', error);
      setTasks(tasks);
    }
  };

  if (!board) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        {board.name}
      </Typography>
      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={2}>
          {columns.map(column => (
            <Grid item xs={12} sm={6} md={3} key={column.id}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 2, 
                  height: 'calc(100vh - 200px)', 
                  display: 'flex', 
                  flexDirection: 'column'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                  {column.title}
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />} 
                  onClick={() => {
                    setActiveColumn(column.id);
                    setOpenNewTaskDialog(true);
                  }}
                  sx={{ mb: 2 }}
                >
                  New Task
                </Button>
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef} 
                      style={{ flexGrow: 1, overflowY: 'auto' }}
                    >
                      {(tasks[column.id] || []).map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{ p: 2, mb: 2, backgroundColor: '#f0f0f0' }}
                            >
                              {task.title}
                            </Paper>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DragDropContext>
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