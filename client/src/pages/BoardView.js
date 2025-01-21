import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Button, Box, Paper, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Tooltip, IconButton, Snackbar, Alert, Chip, Avatar } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import AddIcon from '@mui/icons-material/Add';
import { getBoard, createTask, updateTask, updateColumn, deleteTask, getBoardMembers } from '../services/api';
import TaskDetailsDialog from '../components/TasksDetails';
import ColumnSettingsDialog from '../components/ColumnSettings';
import WarningIcon from '@mui/icons-material/Warning';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';


function BoardView({ darkMode }) {
  // State variables for board, tasks, dialogs, snackbar, etc.
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [isRenameDisabled, setIsRenameDisabled] = useState(true);
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState({});
  const [openNewTaskDialog, setOpenNewTaskDialog] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [showCodeTooltip, setShowCodeTooltip] = useState(false);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [columns, setColumns] = useState([
    { id: 'backlog', title: 'Backlog', hasSubsections: false, allowWipLimit: false },
    { id: 'specification', title: 'Specification', hasSubsections: true, allowWipLimit: true },
    { id: 'implementation', title: 'Implementation', hasSubsections: true, allowWipLimit: true },
    { id: 'test', title: 'Test', hasSubsections: false, allowWipLimit: true },
    { id: 'done', title: 'Done', hasSubsections: false, allowWipLimit: false }
  ]);
  const { id } = useParams(); // Get board ID from URL parameters
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [boardMembers, setBoardMembers] = useState([]); // State for board members

  useEffect(() => {
    // Fetch board data and tasks
    const fetchBoard = async () => {
      try {
        const data = await getBoard(id); // Fetch board data
        setBoard(data);
        const groupedTasks = groupTasksByStatus(data.tasks || []); // Group tasks by status
        setTasks(groupedTasks);
        
        // Merge fetched column data with initial column structure
        const updatedColumns = columns.map(col => {
          const fetchedCol = data.columns.find(c => c.id === col.id);
          return fetchedCol ? { ...col, ...fetchedCol } : col;
        });
        setColumns(updatedColumns);

        // Fetch board members
        const membersData = await getBoardMembers(id);
        setBoardMembers(membersData);
      } catch (error) {
        console.error('Error fetching board:', error);
      }
    };

    fetchBoard();

    const intervalId = setInterval(fetchBoard, 5000); // Refresh every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [id]);

  useEffect(() => {
    setIsRenameDisabled(
      newBoardName.trim() === board?.name || 
      newBoardName.trim().length < 1 || 
      newBoardName.trim().length > 25
    );
  }, [newBoardName, board]);

  // Helper function to open the rename dialog
  const handleOpenRenameDialog = () => {
    setNewBoardName(board.name); // Initialize with the current name
    setRenameDialogOpen(true);
  };

  // Function to handle renaming the board
  const handleRenameBoard = async () => {
    try {
      // Call the API to update the board name
      await updateBoardName(board._id, { name: newBoardName });

      // Update the board state with the new name
      setBoard((prevBoard) => ({ ...prevBoard, name: newBoardName }));

      // Close the dialog and show success message
      setRenameDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Board name updated successfully!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error renaming board:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update board name. Please try again.',
        severity: 'error',
      });
    }
  };

  // Function to handle column settings click
  const handleColumnSettingsClick = (column) => {
    setSelectedColumn(column);
    setColumnSettingsOpen(true);
  };

  // Function to save updated column settings
  const handleColumnSettingsSave = async (columnId, updatedSettings) => {
    try {
      await updateColumn(board._id, columnId, updatedSettings);
      setColumns(prevColumns => 
        prevColumns.map(col =>
          col.id === columnId ? { ...col, ...updatedSettings } : col
        )
      );
      setBoard(prevBoard => ({
        ...prevBoard,
        columns: prevBoard.columns.map(col =>
          col.id === columnId ? { ...col, ...updatedSettings } : col
        )
      }));
    } catch (error) {
      console.error('Error updating column settings:', error);
    }
  };

  // Function to check if WIP limit is exceeded
  const isWipLimitExceeded = (columnId) => {
    const column = columns.find(col => col.id === columnId);
    if (!column || !column.allowWipLimit || !column.wipLimit) return false;

    let taskCount;
    if (column.hasSubsections) {
      taskCount = (tasks[columnId]?.active?.length || 0) + (tasks[columnId]?.done?.length || 0);
    } else {
      taskCount = tasks[columnId]?.length || 0;
    }

    return taskCount > column.wipLimit; // Return true if task count exceeds WIP limit
  };

  // Function to group tasks by their status
  const groupTasksByStatus = (tasks) => {
    const grouped = columns.reduce((acc, column) => {
      if (column.hasSubsections) {
        acc[column.id] = { active: [], done: [] };
      } else {
        acc[column.id] = [];
      }
      return acc;
    }, {});

    tasks.forEach(task => {
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

    return grouped; // Return grouped tasks
  };

  // Function to handle new task creation
  const handleNewTask = async () => {
    try {
      const colorPairs = [
        { light: '#FFD1DC', dark: '#d51a79' }, // Light Pink / Dark Red
        { light: '#8ffaa4', dark: '#11c000' }, // Light Green / Dark Green
        { light: '#B0E0E6', dark: '#0000cd' }, // Powder Blue / Dark Blue
        { light: '#E6E6FA', dark: '#5d00a0' }, // Lavender / Indigo
        { light: '#ffeb00', dark: '#e88408' }, // Yellow / Saddle Brown
      ];
      const randomColorPair = colorPairs[Math.floor(Math.random() * colorPairs.length)];
      const color = darkMode ? randomColorPair.dark : randomColorPair.light;
      
      const newTask = await createTask(id, { 
        title: newTaskTitle, 
        status: 'Backlog',
        color: color
      });
      setTasks(prev => ({
        ...prev,
        backlog: [...(prev.backlog || []), newTask]
      }));
      setNewTaskTitle(''); // Reset new task title
      setOpenNewTaskDialog(false); // Close dialog
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  // Function to handle drag end event
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // If there's no destination, we don't need to do anything
    if (!destination) {
      return;
    }

    // Check if the task is being moved to a different column or within the same column
    if (
      source.droppableId !== destination.droppableId ||
      source.index !== destination.index
    ) {
      const sourceColumnId = source.droppableId.split('-')[0];
      const destColumnId = destination.droppableId.split('-')[0];
      const destColumn = columns.find(col => col.id === destColumnId);

      // Check if the destination column has a WIP limit
      if (destColumn.wipLimit) {
        const destTasks = destColumn.hasSubsections
          ? [...(tasks[destColumnId]?.active || []), ...(tasks[destColumnId]?.done || [])]
          : tasks[destColumnId] || [];

        // If the task is moving from a different column and the destination column is at or over the WIP limit, prevent the move
        if (sourceColumnId !== destColumnId && destTasks.length >= destColumn.wipLimit) {
          setSnackbar({
            open: true,
            message: `Cannot move task: WIP limit reached for ${destColumn.title}`,
            severity: 'warning'
          });
          return;
        }
      }

      // Proceed with updating the task status
      const taskId = draggableId;
      const newStatus = getNewStatus(destination.droppableId);

      try {
        await updateTask(board._id, taskId, { status: newStatus });

        // Update local state
        setTasks(prevTasks => {
          const updatedTasks = JSON.parse(JSON.stringify(prevTasks)); // Deep clone
          const task = findTaskById(taskId, updatedTasks);

          if (task) {
            // Remove the task from its current location
            removeTaskFromCurrentLocation(task, updatedTasks);

            // Add the task to its new location
            addTaskToNewLocation(task, newStatus, destination.index, updatedTasks);
          }

          return updatedTasks;
        });
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    }
  };

  // Helper function to find a task by its ID
  const findTaskById = (taskId, tasks) => {
    for (const columnTasks of Object.values(tasks)) {
      if (Array.isArray(columnTasks)) {
        const task = columnTasks.find(t => t._id === taskId);
        if (task) return task;
      } else if (columnTasks.active || columnTasks.done) {
        const task = columnTasks.active.find(t => t._id === taskId) || columnTasks.done.find(t => t._id === taskId);
        if (task) return { ...task }; // Return a copy of the task
      }
    }
    return null; // Return null if task not found
  };

  // Helper function to remove a task from its current location
  const removeTaskFromCurrentLocation = (task, tasks) => {
    for (const [columnId, columnTasks] of Object.entries(tasks)) {
      if (Array.isArray(columnTasks)) {
        const index = columnTasks.findIndex(t => t._id === task._id);
        if (index !== -1) {
          columnTasks.splice(index, 1); // Remove task from array
          return;
        }
      } else if (columnTasks.active || columnTasks.done) {
        ['active', 'done'].forEach(subColumn => {
          const index = columnTasks[subColumn].findIndex(t => t._id === task._id);
          if (index !== -1) {
            columnTasks[subColumn].splice(index, 1); // Remove task from sub-column
            return;
          }
        });
      }
    }
  };

  // Helper function to add a task to its new location
  const addTaskToNewLocation = (task, newStatus, index, tasks) => {
    const [columnId, subColumn] = newStatus.toLowerCase().split(' ');
    if (tasks[columnId]) {
      if (Array.isArray(tasks[columnId])) {
        tasks[columnId].splice(index, 0, { ...task, status: newStatus }); // Add task to array
      } else if (subColumn) {
        tasks[columnId][subColumn].splice(index, 0, { ...task, status: newStatus }); // Add task to sub-column
      }
    }
  };

  // Helper function to determine the new status based on the destination droppableId
  const getNewStatus = (droppableId) => {
    const [columnId, subColumn] = droppableId.split('-');
    if (subColumn) {
      return `${columnId.charAt(0).toUpperCase() + columnId.slice(1)} ${subColumn.charAt(0).toUpperCase() + subColumn.slice(1)}`;
    }
    return columnId.charAt(0).toUpperCase() + columnId.slice(1);
  };

  // Function to handle task click
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setTaskDetailsOpen(true);
  };

  // Function to handle task update
  const handleTaskUpdate = async (updatedTask) => {
    try {
      const response = await updateTask(id, updatedTask._id, {
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        color: updatedTask.color,
        assignedTo: updatedTask.assignedTo
      });
      
      if (response.success) {
        setTasks(prevTasks => {
          const newTasks = { ...prevTasks };
          Object.keys(newTasks).forEach(column => {
            if (Array.isArray(newTasks[column])) {
              newTasks[column] = newTasks[column].map(task => 
                task._id === updatedTask._id ? { ...task, ...response.task } : task
              );
            } else if (newTasks[column].active && newTasks[column].done) {
              newTasks[column].active = newTasks[column].active.map(task => 
                task._id === updatedTask._id ? { ...task, ...response.task } : task
              );
              newTasks[column].done = newTasks[column].done.map(task => 
                task._id === updatedTask._id ? { ...task, ...response.task } : task
              );
            }
          });
          return newTasks; // Return updated tasks
        });
        console.log('Task updated successfully:', response.task);
      } else {
        console.error('Failed to update task:', response.message);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Function to handle task deletion
  const handleTaskDelete = async (taskId) => {
    try {
      await deleteTask(board._id, taskId);
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        Object.keys(newTasks).forEach(column => {
          if (Array.isArray(newTasks[column])) {
            newTasks[column] = newTasks[column].filter(task => task._id !== taskId); // Filter out deleted task
          } else if (newTasks[column].active && newTasks[column].done) {
            newTasks[column].active = newTasks[column].active.filter(task => task._id !== taskId);
            newTasks[column].done = newTasks[column].done.filter(task => task._id !== taskId);
          }
        });
        return newTasks; // Return updated tasks
      });
      setSnackbar({
        open: true,
        message: 'Task deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting task',
        severity: 'error'
      });
    }
  };

  // Function to handle code copying
  const handleCopyCode = () => {
    if (board && board.code) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(board.code)
          .then(() => {
            setShowCodeTooltip(true);
            setTimeout(() => setShowCodeTooltip(false), 2000);
          })
          .catch(err => console.error('Failed to copy: ', err));
      } else {
        // Fallback for browsers that do not support the Clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = board.code;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          setShowCodeTooltip(true);
          setTimeout(() => setShowCodeTooltip(false), 2000);
        } catch (err) {
          console.error('Fallback: Unable to copy', err);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } else {
      console.warn('No code available to copy');
    }
  };

  // Function to render a task
  const renderTask = (task, provided) => {
    const colorPairs = [
      { light: '#FFD1DC', dark: '#d51a79' }, // Light Pink / Dark Red
      { light: '#8ffaa4', dark: '#11c000' }, // Light Green / Dark Green
      { light: '#B0E0E6', dark: '#0000cd' }, // Powder Blue / Dark Blue
      { light: '#E6E6FA', dark: '#5d00a0' }, // Lavender / Indigo
      { light: '#ffeb00', dark: '#e88408' }, // Yellow / Dark Orange
    ];

    const getTaskColor = () => {
      if (!task.color) return colorPairs[0];
      const colorIndex = colorPairs.findIndex(pair => pair.light === task.color || pair.dark === task.color);
      return colorIndex !== -1 ? colorPairs[colorIndex] : colorPairs[0];
    };

    const taskColor = getTaskColor();
    const isLightMode = !darkMode; 

    const assignedMember = boardMembers.find(member => member._id === task.assignedTo);

    return (
      <Paper
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        sx={{
          p: 1,
          mb: 1,
          backgroundColor: isLightMode ? taskColor.light : taskColor.dark,
          color: isLightMode ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
          cursor: 'pointer',
          minHeight: '100px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
          transition: 'box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            transform: 'translateY(-2px) rotate(1deg)',
          },
          width: 'calc(100% - 8px)',
          maxWidth: '100%',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          borderRadius: '2px',
          transform: 'rotate(-1deg)',
        }}
        onClick={() => handleTaskClick(task)} // Handle task click
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
        {assignedMember && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Tooltip title={`Assigned to: ${assignedMember.name || assignedMember.email}`}>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: '0.75rem',
                  bgcolor: isLightMode ? 'primary.main' : 'primary.dark',
                }}
              >
                {assignedMember.name ? assignedMember.name[0].toUpperCase() : <PersonIcon />}
              </Avatar>
            </Tooltip>
          </Box>
        )}
      </Paper>
    );
  };
  
  if (!board) {
    return <Typography>Loading...</Typography>; // Show loading text if board is not loaded
  }

  return (
    <Container maxWidth={false} sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1, px: 2, pt: .5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: .1 }}>
          <Typography variant="body2" sx={{ mr: 1, pt: 1}}>Board Code: {board.code}</Typography>
          <Tooltip title={showCodeTooltip ? "Copied!" : "Copy Code"} arrow>
            <IconButton onClick={handleCopyCode}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="h4" align="center" sx={{ mr: 2 }}>
            {board.name}
          </Typography>
          {board.owner === currentUserId && ( // Check if the current user is the owner
            <Tooltip title="Edit Board Name">
              <IconButton onClick={() => setRenameDialogOpen(true)} size="small">
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      <Button
        variant="contained"
        onClick={() => setOpenNewTaskDialog(true)} // Open new task dialog
        sx={{
          mb: 1, // Reduced mb
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
              pt: 1,
              justifyContent: 'flex-start',
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
                  sx={(theme) => ({ 
                    display: 'flex', 
                    flexDirection: 'column',
                    height: 'calc(100vh - 200px)', // Fixed height
                    border: isWipLimitExceeded(column.id) 
                      ? `2px solid ${theme.palette.error.main}`
                      : `1px solid ${theme.palette.divider}`,
                    overflow: 'hidden',
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? theme.palette.background.paper 
                      : theme.palette.background.default,
                  })}
                >
                  <Box 
                    sx={(theme) => ({ 
                      p: 2, 
                      backgroundColor: theme.palette.mode === 'dark'
                        ? theme.palette.background.default
                        : theme.palette.background.paper,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    })}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                        {column.title}
                      </Typography>
                      <Tooltip title="Column Settings">
                        <IconButton onClick={() => handleColumnSettingsClick(column)} size="small" sx={{ color: 'text.secondary' }}>
                          <HelpOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    {column.wipLimit && (
                      <Chip
                        size="small"
                        label={`WIP: ${
                          column.hasSubsections 
                            ? (tasks[column.id]?.active?.length || 0) + (tasks[column.id]?.done?.length || 0)
                            : tasks[column.id]?.length || 0
                        }/${column.wipLimit}`}
                        color={isWipLimitExceeded(column.id) ? "error" : "default"}
                        sx={(theme) => ({ 
                          backgroundColor: isWipLimitExceeded(column.id) 
                            ? theme.palette.error.main 
                            : theme.palette.mode === 'dark'
                              ? theme.palette.action.selected
                              : theme.palette.action.hover,
                          color: isWipLimitExceeded(column.id) 
                            ? theme.palette.error.contrastText 
                            : theme.palette.text.primary,
                          fontWeight: isWipLimitExceeded(column.id) ? 'bold' : 'normal',
                          mb: 1,
                        })}
                      />
                    )}
                    
                    {column.doneRule && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                          Done Rule:
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.primary' }}>
                          {column.doneRule}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  {isWipLimitExceeded(column.id) && (
                    <Box
                      sx={{
                        backgroundColor: 'error.main',
                        color: 'error.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 0.5,
                      }}
                    >
                      <WarningIcon sx={{ mr: 1, fontSize: '0.9rem' }} />
                      <Typography variant="caption" fontWeight="bold">WIP Limit Exceeded</Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    overflow: 'hidden'
                  }}>
                    {column.hasSubsections ? (
                      <Box display="flex" flexGrow={1} overflow="hidden">
                        <Box width="50%" display="flex" flexDirection="column" overflow="hidden">
                          <Typography 
                            variant="subtitle2" 
                            align="center" 
                            sx={(theme) => ({ 
                              py: 1, 
                              px: 2,
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              backgroundColor: theme.palette.mode === 'dark' 
                                ? theme.palette.grey[800] 
                                : theme.palette.grey[100],
                              fontWeight: 'bold'
                            })}
                          >
                            Active
                          </Typography>
                          <Droppable droppableId={`${column.id}-active`}>
                            {(provided) => (
                              <Box 
                                {...provided.droppableProps} 
                                ref={provided.innerRef}
                                flexGrow={1} 
                                overflow="auto" 
                                sx={{ p: 1 }}
                              >
                                {(tasks[column.id]?.active || []).map((task, index) => (
                                  <Draggable key={task._id.toString()} draggableId={task._id.toString()} index={index}>
                                    {(provided) => renderTask(task, provided)}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </Box>
                            )}
                          </Droppable>
                        </Box>
                        <Divider 
                          orientation="vertical" 
                          flexItem 
                          sx={(theme) => ({
                            width: 2,
                            backgroundColor: theme.palette.mode === 'dark' 
                              ? theme.palette.grey[600]
                              : theme.palette.grey[400],
                          })}
                        />
                        <Box width="50%" display="flex" flexDirection="column" overflow="hidden">
                          <Typography 
                            variant="subtitle2" 
                            align="center" 
                            sx={(theme) => ({ 
                              py: 1, 
                              px: 2,
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              backgroundColor: theme.palette.mode === 'dark' 
                                ? theme.palette.grey[800] 
                                : theme.palette.grey[100],
                              fontWeight: 'bold'
                            })}
                          >
                            Done
                          </Typography>
                          <Droppable droppableId={`${column.id}-done`}>
                            {(provided) => (
                              <Box 
                                {...provided.droppableProps} 
                                ref={provided.innerRef}
                                flexGrow={1} 
                                overflow="auto" 
                                sx={{ p: 1 }}
                              >
                                {(tasks[column.id]?.done || []).map((task, index) => (
                                  <Draggable key={task._id} draggableId={task._id} index={index}>
                                    {(provided) => renderTask(task, provided)}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </Box>
                            )}
                          </Droppable>
                        </Box>
                      </Box>
                    ) : (
                      <Droppable droppableId={column.id}>
                        {(provided) => (
                          <Box 
                            {...provided.droppableProps} 
                            ref={provided.innerRef}
                            flexGrow={1} 
                            overflow="auto" 
                            sx={{ p: 1 }}
                          >
                            {(tasks[column.id] || []).map((task, index) => (
                              <Draggable key={task._id} draggableId={task._id} index={index}>
                                {(provided) => renderTask(task, provided)}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </Box>
                        )}
                      </Droppable>
                    )}
                  </Box>
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
        onDelete={handleTaskDelete}
        darkMode={darkMode}
        boardMembers={boardMembers}
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
            onChange={(e) => setNewTaskTitle(e.target.value)} // Update new task title
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewTaskDialog(false)}>Cancel</Button>
          <Button onClick={handleNewTask}>Create</Button>
        </DialogActions>
      </Dialog>
      <ColumnSettingsDialog
        open={columnSettingsOpen}
        onClose={() => setColumnSettingsOpen(false)}
        column={selectedColumn}
        onSave={handleColumnSettingsSave}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default BoardView; // Export the BoardView component
