// src/components/Column.js
import React from 'react';
import { Paper, Typography, Box, IconButton, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Droppable } from 'react-beautiful-dnd';

// Column component to represent a task column
function Column({ column, tasks, onColumnSettingsClick, onTaskClick, isWipLimitExceeded }) {
  return (
    <Paper sx={{ width: 300, m: 1, p: 2, height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header section of the column */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          {column.title} {/* Display the title of the column */}
        </Typography>
        <Tooltip title="Column Settings">
          <IconButton onClick={() => onColumnSettingsClick(column)} size="small">
            <HelpOutlineIcon fontSize="small" /> {/* Icon for column settings */}
          </IconButton>
        </Tooltip>
      </Box>
      {/* Display WIP limit if it exists */}
      {column.wipLimit && (
        <Typography variant="caption" sx={{ mb: 1 }}>
          WIP Limit: {isWipLimitExceeded() ? 'Exceeded' : `${tasks?.length || 0}/${column.wipLimit}`} {/* Show WIP status */}
        </Typography>
      )}
      {/* Display done rule if it exists */}
      {column.doneRule && (
        <Typography variant="caption" sx={{ mb: 1 }}>
          Done Rule: {column.doneRule} {/* Show the done rule for the column */}
        </Typography>
      )}
      {/* ... rest of the component */}
    </Paper>
  );
}

export default Column; // Export the Column component
