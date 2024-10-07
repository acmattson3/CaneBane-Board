import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Button, Grid, Paper, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Box } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import AddIcon from '@mui/icons-material/Add';
import { getBoard, createTask, updateTask } from '../services/api';

const columns = [
  { id: 'backlog', title: 'Backlog', hasSubsections: false },
  { id: 'specification', title: 'Specification', hasSubsections: true },
  { id: 'implementation', title: 'Implementation', hasSubsections: true },
  { id: 'test', title: 'Test', hasSubsections: false },
  { id: 'done', title: 'Done', hasSubsections: false }
];

const getRandomColor = () => {
  const colors = ['#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA'];
  return colors[Math.floor(Math.random() * colors.length)];
};

function BoardView() {
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState({});
  const [openNewTaskDialog, setOpenNewTaskDialog] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const { id } = useParams();

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const data = await getBoard(id);
        console.log('Fetched board data:', data);
        setBoard(data);
        const groupedTasks = groupTasksByStatus(data.tasks || []);
        console.log('Grouped tasks:', groupedTasks);
        setTasks(groupedTasks);
      } catch (error) {
        console.error('Error fetching board:', error);
      }
    };
    fetchBoard();
  }, [id]);

  const groupTasksByStatus = (tasks) => {
    console.log('Grouping tasks:', tasks);
    const grouped = columns.reduce((acc, column) => {
      if (column.hasSubsections) {
        acc[column.id] = { active: [], done: [] };
      } else {
        acc[column.id] = [];
      }
      return acc;
    }, {});

    tasks.forEach(task => {
      console.log('Processing task:', task);
      const status = task.status.toLowerCase();
      if (status.includes('specification') || status.includes('implementation')) {
        const [mainStatus, subStatus] = status.split(' ');
        if (subStatus === 'done') {
          grouped[mainStatus].done.push(task);
        } else {
          grouped[mainStatus].active.push(task);
        }
      } else if (grouped[status]) {
        grouped[status].push(task);
      } else {
        grouped['backlog'].push(task);
      }
    });

    return grouped;
  };

  const handleNewTask = async () => {
    try {
      const color = getRandomColor();
      console.log('Creating new task with color:', color);
      const newTask = await createTask(id, { 
        title: newTaskTitle, 
        status: 'Backlog',
        color: color
      });
      console.log('New task created:', newTask);
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
    console.log('Drag ended:', result);
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;

    let newTasks = { ...tasks };
    let movedTask;

    // Remove from source
    if (sourceColumn.includes('-')) {
      const [colId, section] = sourceColumn.split('-');
      movedTask = newTasks[colId][section].find(task => task._id === draggableId);
      newTasks[colId][section] = newTasks[colId][section].filter(task => task._id !== draggableId);
    } else {
      movedTask = newTasks[sourceColumn].find(task => task._id === draggableId);
      newTasks[sourceColumn] = newTasks[sourceColumn].filter(task => task._id !== draggableId);
    }

    if (!movedTask) {
      console.error('Task not found:', draggableId);
      return;
    }

    // Add to destination
    if (destColumn.includes('-')) {
      const [colId, section] = destColumn.split('-');
      newTasks[colId][section].splice(destination.index, 0, movedTask);
      movedTask.status = `${colId} ${section}`;
    } else {
      newTasks[destColumn].splice(destination.index, 0, movedTask);
      movedTask.status = destColumn;
    }

    console.log('New tasks state:', newTasks);
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
      <Typography variant="h4" gutterBottom align="center">
        Kanban Board
      </Typography>
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
                {column.hasSubsections ? (
                  <Box display="flex" flexDirection="column" flexGrow={1}>
                    <Box flexGrow={1}>
                      <Typography variant="subtitle2">Active</Typography>
                      <Droppable droppableId={`${column.id}-active`}>
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} style={{ minHeight: '100px', overflowY: 'auto' }}>
                            {(tasks[column.id]?.active || []).map((task, index) => (
                              <Draggable key={task._id.toString()} draggableId={task._id.toString()} index={index}>
                                {(provided) => (
                                  <Paper
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    sx={{ p: 1, mb: 1, backgroundColor: task.color || '#f0f0f0' }}
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
                    </Box>
                    <Box flexGrow={1}>
                      <Typography variant="subtitle2">Done</Typography>
                      <Droppable droppableId={`${column.id}-done`}>
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} style={{ minHeight: '100px', overflowY: 'auto' }}>
                            {(tasks[column.id]?.done || []).map((task, index) => (
                              <Draggable key={task._id} draggableId={task._id} index={index}>
                                {(provided) => (
                                  <Paper
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    sx={{ p: 1, mb: 1, backgroundColor: task.color || '#f0f0f0' }}
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
                    </Box>
                  </Box>
                ) : (
                  <Droppable droppableId={column.id}>
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} style={{ flexGrow: 1, overflowY: 'auto' }}>
                        {(tasks[column.id] || []).map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided) => (
                              <Paper
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{ p: 1, mb: 1, backgroundColor: task.color || '#f0f0f0' }}
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
                )}
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