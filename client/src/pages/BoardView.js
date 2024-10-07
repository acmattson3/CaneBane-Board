import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Button, Grid, Paper, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import AddIcon from '@mui/icons-material/Add';
import { getBoard, createTask, updateTask } from '../services/api';

const columns = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'specification', title: 'Specification' },
  { id: 'implementation', title: 'Implementation' },
  { id: 'test', title: 'Test' },
  { id: 'done', title: 'Done' }
];

function BoardView() {
  const [tasks, setTasks] = useState({});
  const [openNewTaskDialog, setOpenNewTaskDialog] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const { id } = useParams();

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const data = await getBoard(id);
        console.log('Fetched board data:', data);
        const groupedTasks = groupTasksByStatus(data.tasks || []);
        setTasks(groupedTasks);
      } catch (error) {
        console.error('Error fetching board:', error);
      }
    };
    fetchBoard();
  }, [id]);

  useEffect(() => {
    console.log('Tasks state updated:', tasks);
  }, [tasks]);

  const groupTasksByStatus = (tasks) => {
    const grouped = columns.reduce((acc, column) => {
      acc[column.id] = [];
      return acc;
    }, {});

    tasks.forEach(task => {
      const status = task.status.toLowerCase();
      const columnId = columns.find(col => col.id === status)?.id || 'backlog';
      grouped[columnId].push({ ...task, id: task._id.toString() });
    });

    console.log('Grouped tasks:', grouped);
    return grouped;
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;

    const newTasks = { ...tasks };

    // Remove from source column
    const [movedTask] = newTasks[sourceColumn].splice(source.index, 1);

    // Add to destination column
    newTasks[destColumn].splice(destination.index, 0, movedTask);

    setTasks(newTasks);

    // Update task status in the backend
    updateTask(id, draggableId, { status: destColumn });
  };

  const handleNewTask = async () => {
    try {
      const newTask = await createTask(id, { 
        title: newTaskTitle, 
        status: 'backlog'
      });
      setTasks(prev => ({
        ...prev,
        backlog: [...(prev.backlog || []), { ...newTask, id: newTask._id.toString() }]
      }));
      setNewTaskTitle('');
      setOpenNewTaskDialog(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  console.log('Rendering with tasks:', tasks);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom align="center">Kanban Board</Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => setOpenNewTaskDialog(true)}
        sx={{ mb: 2 }}
      >
        Add Task
      </Button>
      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={2}>
          {columns.map(column => (
            <Grid item xs={12} sm={6} md={2.4} key={column.id}>
              <Paper elevation={3} sx={{ p: 2, height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                  {column.title}
                </Typography>
                <Droppable droppableId={column.id} key={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{
                        background: snapshot.isDraggingOver ? 'lightblue' : 'lightgrey',
                        padding: 4,
                        flexGrow: 1,
                        minHeight: 500,
                        overflowY: 'auto'
                      }}
                    >
                      {(tasks[column.id] || []).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                userSelect: 'none',
                                padding: 16,
                                margin: '0 0 8px 0',
                                minHeight: '50px',
                                backgroundColor: snapshot.isDragging ? '#263B4A' : '#456C86',
                                color: 'white',
                                ...provided.draggableProps.style
                              }}
                            >
                              {task.title}
                            </div>
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