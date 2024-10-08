import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Box, CircularProgress } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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

  const onDragEnd = useCallback(async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const updatedTasks = Array.from(board.tasks);
    const [reorderedTask] = updatedTasks.splice(updatedTasks.findIndex(task => task._id === draggableId), 1);
    reorderedTask.status = destination.droppableId;
    updatedTasks.splice(destination.index, 0, reorderedTask);

    setBoard(prevBoard => ({ ...prevBoard, tasks: updatedTasks }));

    try {
      await updateTask(board._id, draggableId, { status: destination.droppableId });
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert the state if the server update fails
      setBoard(prevBoard => ({ ...prevBoard }));
    }
  }, [board]);

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
      <DragDropContext onDragEnd={onDragEnd}>
        <Box display="flex" flexWrap="wrap" gap={2}>
          {columns.map(column => (
            <Box key={column.id} width={300} flexShrink={0}>
              <Paper sx={{ p: 2, minHeight: '300px' }}>
                <Typography variant="h6">{column.title}</Typography>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <Box
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      sx={{
                        background: snapshot.isDraggingOver ? 'lightblue' : 'lightgrey',
                        padding: 1,
                        minHeight: 500,
                      }}
                    >
                      {groupedTasks[column.id]?.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                userSelect: 'none',
                                padding: 2,
                                margin: '0 0 8px 0',
                                minHeight: '50px',
                                backgroundColor: snapshot.isDragging ? '#263B4A' : '#456C86',
                                color: 'white',
                                ...provided.draggableProps.style,
                              }}
                            >
                              <Typography variant="body2" gutterBottom>ID: {task._id}</Typography>
                              <Typography>{task.title}</Typography>
                            </Paper>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Paper>
            </Box>
          ))}
        </Box>
      </DragDropContext>
    </Container>
  );
}

export default BoardView;