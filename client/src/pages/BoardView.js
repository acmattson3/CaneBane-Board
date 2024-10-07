import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Grid, Paper } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getBoard } from '../services/api';

const columns = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'todo', title: 'To Do' },
  { id: 'inprogress', title: 'In Progress' },
  { id: 'done', title: 'Done' }
];

function BoardView() {
  const [tasks, setTasks] = useState({});
  const { id } = useParams();

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const data = await getBoard(id);
        console.log('Fetched board data:', data);
        const groupedTasks = groupTasksByStatus(data.tasks || []);
        console.log('Grouped tasks:', groupedTasks);
        setTasks(groupedTasks);
      } catch (error) {
        console.error('Error fetching board:', error);
      }
    };
    fetchBoard();
  }, [id]);

  const groupTasksByStatus = (tasksToGroup) => {
    return columns.reduce((acc, column) => {
      acc[column.id] = tasksToGroup.filter(task => task.status.toLowerCase() === column.id);
      return acc;
    }, {});
  };

  const onDragEnd = (result) => {
    console.log('Drag ended:', result);
    const { source, destination, draggableId } = result;
    if (!destination) return;
  
    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;
  
    const newTasks = { ...tasks };
    const [movedTask] = newTasks[sourceColumn].splice(source.index, 1);
    newTasks[destColumn].splice(destination.index, 0, movedTask);
  
    setTasks(newTasks);
    console.log('Task moved:', draggableId, 'From:', sourceColumn, 'To:', destColumn);
  
    // If you want to update the task status on the server, you could do it here:
    // updateTaskStatus(draggableId, destColumn);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Kanban Board</Typography>
      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={2}>
          {columns.map(column => (
            <Grid item xs={3} key={column.id}>
              <Paper sx={{ p: 2, minHeight: '300px' }}>
                <Typography variant="h6">{column.title}</Typography>
                <Droppable droppableId={column.id} key={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{
                        background: snapshot.isDraggingOver ? 'lightblue' : 'lightgrey',
                        padding: 4,
                        minHeight: 500,
                      }}
                    >
                      {(tasks[column.id] || []).map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                p: 1,
                                mb: 1,
                                backgroundColor: snapshot.isDragging ? '#263B4A' : task.color || '#456C86',
                                color: 'white',
                              }}
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
    </Container>
  );
}

export default BoardView;