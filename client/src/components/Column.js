// src/components/Column.js
import React from 'react';
import { Paper, Typography, Box, IconButton, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Droppable, Draggable } from 'react-beautiful-dnd';

function Column({ column, tasks, onColumnSettingsClick, onTaskClick, isWipLimitExceeded }) {
  const renderTask = (task, index) => (
    <Draggable key={task._id} draggableId={task._id} index={index}>
      {(provided) => (
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
            '&:hover': {
              boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            },
          }}
          onClick={() => onTaskClick(task)}
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
      )}
    </Draggable>
  );

  return (
    <Paper sx={{ width: 300, m: 1, p: 2, height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          {column.title}
        </Typography>
        <Tooltip title="Column Settings">
          <IconButton onClick={() => onColumnSettingsClick(column)} size="small">
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      {column.wipLimit && (
        <Typography variant="caption" sx={{ mb: 1 }}>
          WIP Limit: {isWipLimitExceeded ? 'Exceeded' : `${tasks?.length || 0}/${column.wipLimit}`}
        </Typography>
      )}
      {column.hasSubsections ? (
        <Box display="flex" flexGrow={1}>
          <Box width="calc(50% - 4px)" pr={1} display="flex" flexDirection="column">
            <Typography variant="subtitle2" align="center">Done</Typography>
            <Droppable droppableId={`${column.id}-done`}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} style={{ flexGrow: 1, overflowY: 'auto' }}>
                  {(tasks?.done || []).map((task, index) => renderTask(task, index))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Box>
          <Box width="calc(50% - 4px)" pl={1} display="flex" flexDirection="column">
            <Typography variant="subtitle2" align="center">Active</Typography>
            <Droppable droppableId={`${column.id}-active`}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} style={{ flexGrow: 1, overflowY: 'auto' }}>
                  {(tasks?.active || []).map((task, index) => renderTask(task, index))}
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
              {(tasks || []).map((task, index) => renderTask(task, index))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}
    </Paper>
  );
}

export default Column;