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
      acc[column.id] = column.hasSubsections ? { active: [], done: [] } : [];
      return acc;
    }, {});

    tasks.forEach(task => {
      const status = task.status.toLowerCase().replace(' ', '');
      if (grouped[status]) {
        if (typeof grouped[status] === 'object') {
          if (task.status.includes('Done')) {
            grouped[status].done.push(task);
          } else {
            grouped[status].active.push(task);
          }
        } else {
          grouped[status].push(task);
        }
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
    const { source, destination } = result;

    if (!destination) return;

    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;

    const newTasks = { ...tasks };

    let sourceArray, destArray;

    if (sourceColumn.includes('-')) {
      const [colId, section] = sourceColumn.split('-');
      sourceArray = newTasks[colId]?.[section] || [];
    } else {
      sourceArray = newTasks[sourceColumn] || [];
    }

    if (destColumn.includes('-')) {
      const [colId, section] = destColumn.split('-');
      destArray = newTasks[colId]?.[section] || [];
    } else {
      destArray = newTasks[destColumn] || [];
    }

    const [movedTask] = sourceArray.splice(source.index, 1);
    destArray.splice(destination.index, 0, movedTask);

    // Update task status
    const newStatus = destColumn.includes('-') 
      ? `${destColumn.split('-')[0].charAt(0).toUpperCase() + destColumn.split('-')[0].slice(1)} ${destColumn.split('-')[1].charAt(0).toUpperCase() + destColumn.split('-')[1].slice(1)}`
      : destColumn.charAt(0).toUpperCase() + destColumn.slice(1);
    
    movedTask.status = newStatus;

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
                  <Box display="flex" flexGrow={1}>
                    <Box width="50%" pr={1}>
                      <Typography variant="subtitle2">Active</Typography>
                      <Droppable droppableId={`${column.id}-active`}>
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} style={{ height: '100%', overflowY: 'auto' }}>
                            {(tasks[column.id]?.active || []).map((task, index) => (
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
                    <Box width="50%" pl={1} borderLeft={1} borderColor="divider">
                      <Typography variant="subtitle2">Done</Typography>
                      <Droppable droppableId={`${column.id}-done`}>
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} style={{ height: '100%', overflowY: 'auto' }}>
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