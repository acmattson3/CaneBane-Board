import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Button, Box, Paper, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Tooltip, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import AddIcon from '@mui/icons-material/Add';
import { getBoard, createTask, updateTask } from '../services/api';
import TaskDetailsDialog from '../components/TasksDetails';

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
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [showCodeTooltip, setShowCodeTooltip] = useState(false);
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
      if (status === 'specification active') {
        grouped['specification'].active.push(task);
      } else if (status === 'specification done') {
        grouped['specification'].done.push(task);
      } else if (status === 'implementation active') {
        grouped['implementation'].active.push(task);
      } else if (status === 'implementation done') {
        grouped['implementation'].done.push(task);
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

  const mapStatusToBackend = (frontendStatus) => {
    const statusMap = {
      'backlog': 'Backlog',
      'specification-active': 'Specification Active',
      'specification-done': 'Specification Done',
      'implementation-active': 'Implementation Active',
      'implementation-done': 'Implementation Done',
      'test': 'Test',
      'done': 'Done'
    };
    return statusMap[frontendStatus] || frontendStatus;
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
      movedTask.status = mapStatusToBackend(`${colId}-${section}`);
    } else {
      newTasks[destColumn].splice(destination.index, 0, movedTask);
      movedTask.status = mapStatusToBackend(destColumn);
    }

    console.log('New tasks state:', newTasks);
    console.log('Moved task:', movedTask);
    setTasks(newTasks);

    try {
      console.log('Updating task with status:', movedTask.status);
      await updateTask(id, movedTask._id, { status: movedTask.status });
      console.log('Task updated successfully:', movedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert the changes in the UI
      setTasks(tasks);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setTaskDetailsOpen(true);
  };

  const handleTaskUpdate = async (updatedTask) => {
    try {
      const response = await updateTask(id, updatedTask._id, {
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status
      });
      
      if (response.success) {
        setTasks(prevTasks => {
          const newTasks = { ...prevTasks };
          Object.keys(newTasks).forEach(column => {
            if (Array.isArray(newTasks[column])) {
              newTasks[column] = newTasks[column].map(task => 
                task._id === updatedTask._id ? response.task : task
              );
            } else if (newTasks[column].active && newTasks[column].done) {
              newTasks[column].active = newTasks[column].active.map(task => 
                task._id === updatedTask._id ? response.task : task
              );
              newTasks[column].done = newTasks[column].done.map(task => 
                task._id === updatedTask._id ? response.task : task
              );
            }
          });
          return newTasks;
        });
        console.log('Task updated successfully:', response.task);
      } else {
        console.error('Failed to update task:', response.message);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCopyCode = () => {
    if (board && board.code) {
      navigator.clipboard.writeText(board.code);
      setShowCodeTooltip(true);
      setTimeout(() => setShowCodeTooltip(false), 2000);
    }
  };
  const renderTask = (task, provided) => (
    <Paper
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      sx={{
        p: 1,
        mb: 1,
        backgroundColor: task.color || '#f0f0f0',
        cursor: 'pointer',
        minHeight: '100px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
        transition: 'box-shadow 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        },
        width: 'calc(100% - 8px)', // Subtract padding to ensure it fits within the column
        maxWidth: '100%',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
      }}
      onClick={() => handleTaskClick(task)}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
        {task.title}
      </Typography>
      {task.description && (
        <Typography
          variant="body2"
          sx={{
            flexGrow: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {task.description}
        </Typography>
      )}
    </Paper>
  );
  
  if (!board) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth={false} sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 2, pt: 2 }}>
        <Typography variant="h4" gutterBottom>
          {board.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 1 }}>Board Code: {board.code}</Typography>
          <Tooltip title={showCodeTooltip ? "Copied!" : "Copy Code"} arrow>
            <IconButton onClick={handleCopyCode}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Button
        variant="contained"
        onClick={() => setOpenNewTaskDialog(true)}
        sx={{
          mb: 2,
          alignSelf: 'flex-start',
          ml: 2,
          backgroundColor: '#FFFF88',
          color: '#000',
          boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
          transform: 'rotate(-2deg)',
          '&:hover': {
            backgroundColor: '#FFFF99',
            transform: 'rotate(0deg) scale(1.05)',
          },
          transition: 'all 0.3s ease',
          width: '100px',
          height: '100px',
          borderRadius: '2px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          lineHeight: 1.2,
          fontSize: '0.9rem',
          fontWeight: 'bold',
          textTransform: 'none',
        }}
      >
        <AddIcon sx={{ fontSize: '2rem', mb: 1 }} />
        Add Task
      </Button>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Box 
            display="flex" 
            sx={{ 
              minHeight: 'min-content',
              overflowX: 'auto',
              pb: 2,
              pt: 1, // Add top padding here
              justifyContent: 'center',
              margin: '0 auto',
              maxWidth: '100%',
            }}
          >
            {columns.map(column => (
              <Box 
                key={column.id} 
                width={300} 
                sx={{ 
                  flexShrink: 0, 
                  px: 1, 
                  height: 'fit-content',
                  minWidth: 300
                }}
              >
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column',
                    height: '100%',
                    minHeight: 'calc(100vh - 230px)', // Adjusted to account for added top padding
                  }}
                >
                  <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                    {column.title}
                  </Typography>
                  {column.hasSubsections ? (
                    <Box display="flex" flexGrow={1}>
                      <Box width="50%" pr={1} display="flex" flexDirection="column">
                        <Typography variant="subtitle2" align="center">Done</Typography>
                        <Droppable droppableId={`${column.id}-done`}>
                          {(provided) => (
                            <div 
                              {...provided.droppableProps} 
                              ref={provided.innerRef} 
                              style={{ 
                                flexGrow: 1, 
                                overflowY: 'auto', 
                                minHeight: '200px',
                                width: '100%' // Add this line
                              }}
                            >
                              {(tasks[column.id]?.done || []).map((task, index) => (
                                <Draggable key={task._id} draggableId={task._id} index={index}>
                                  {(provided) => renderTask(task, provided)}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </Box>
                      <Divider orientation="vertical" flexItem />
                      <Box width="50%" pl={1} display="flex" flexDirection="column">
                        <Typography variant="subtitle2" align="center">Active</Typography>
                        <Droppable droppableId={`${column.id}-active`}>
                          {(provided) => (
                            <div 
                              {...provided.droppableProps} 
                              ref={provided.innerRef} 
                              style={{ 
                                flexGrow: 1, 
                                overflowY: 'auto', 
                                minHeight: '200px',
                                width: '100%' // Add this line
                              }}
                            >
                              {(tasks[column.id]?.active || []).map((task, index) => (
                                <Draggable key={task._id.toString()} draggableId={task._id.toString()} index={index}>
                                  {(provided) => renderTask(task, provided)}
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
                        <div 
                          {...provided.droppableProps} 
                          ref={provided.innerRef} 
                          style={{ 
                            flexGrow: 1, 
                            overflowY: 'auto', 
                            minHeight: '200px',
                            width: '100%' // Add this line
                          }}
                        >
                          {(tasks[column.id] || []).map((task, index) => (
                            <Draggable key={task._id} draggableId={task._id} index={index}>
                              {(provided) => renderTask(task, provided)}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  )}
                </Paper>
              </Box>
            ))}
          </Box>
        </DragDropContext>
      </Box>
      <TaskDetailsDialog
        open={taskDetailsOpen}
        onClose={() => setTaskDetailsOpen(false)}
        task={selectedTask}
        onUpdate={handleTaskUpdate}
      />
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