import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Grid, Paper, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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
    return tasks.reduce((acc, task) => {
      const status = task.status.toLowerCase().replace(' ', '');
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(task);
      return acc;
    }, {});
  };

  const handleNewTask = async () => {
    try {
      const newTask = await createTask(id, { title: newTaskTitle, status: 'Backlog' });
      setTasks(prev => ({
        ...prev,
        backlog: [...(prev.backlog || []), newTask]
      }));
      setNewTaskTitle('');
      setOpenNewTaskDialog(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;

    if (sourceColumn === destColumn) {
      const newColumnTasks = Array.from(tasks[sourceColumn]);
      const [reorderedItem] = newColumnTasks.splice(source.index, 1);
      newColumnTasks.splice(destination.index, 0, reorderedItem);

      setTasks({
        ...tasks,
        [sourceColumn]: newColumnTasks
      });
    } else {
      const sourceColumnTasks = Array.from(tasks[sourceColumn]);
      const destColumnTasks = Array.from(tasks[destColumn]);
      const [movedTask] = sourceColumnTasks.splice(source.index, 1);

      // Update task status
      movedTask.status = columns.find(col => col.id === destColumn).title;
      
      destColumnTasks.splice(destination.index, 0, movedTask);

      setTasks({
        ...tasks,
        [sourceColumn]: sourceColumnTasks,
        [destColumn]: destColumnTasks
      });

      // Update task on the server
      try {
        await updateTask(id, movedTask._id, { status: movedTask.status });
      } catch (error) {
        console.error('Error updating task:', error);
      }
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
      <DragDropContext onDragEnd={onDragEnd}>
        <Box mt={3}>
          <Grid container spacing={3}>
            {columns.map(column => (
              <Grid item xs={3} key={column.id}>
                <Paper elevation={3} sx={{ p: 2, height: '70vh', overflow: 'auto' }}>
                  <Typography variant="h6" gutterBottom>{column.title}</Typography>
                  <Droppable droppableId={column.id}>
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {(tasks[column.id] || []).map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided) => (
                              <Paper
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{ p: 1, mb: 1, backgroundColor: '#f0f0f0' }}
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
        </Box>
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