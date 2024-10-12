import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, useTheme } from '@mui/material';

function TaskDetailsDialog({ open, onClose, task, onUpdate, darkMode }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const theme = useTheme();

  const colorPairs = [
    { name: 'Pink', light: '#FFD1DC', dark: '#d51a79' },
    { name: 'Green', light: '#8ffaa4', dark: '#11c000' },
    { name: 'Blue', light: '#B0E0E6', dark: '#0000cd' },
    { name: 'Lavender', light: '#E6E6FA', dark: '#5d00a0' },
    { name: 'Yellow', light: '#ffeb00', dark: '#e88408' },
  ];

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      // Find the matching color pair or default to the first one
      const colorPair = colorPairs.find(cp => cp.light === task.color || cp.dark === task.color) || colorPairs[0];
      setColor(darkMode ? colorPair.dark : colorPair.light);
    }
  }, [task, darkMode]);

  const handleSave = () => {
    onUpdate({ ...task, title, description, color });
    onClose();
  };

  const getColorName = (colorValue) => {
    const colorPair = colorPairs.find(cp => cp.light === colorValue || cp.dark === colorValue);
    return colorPair ? colorPair.name : 'Unknown';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Task Details</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Task Name"
          type="text"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Description"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Select
          margin="dense"
          fullWidth
          value={color}
          onChange={(e) => setColor(e.target.value)}
          displayEmpty
        >
          {colorPairs.map((colorPair) => (
            <MenuItem 
              key={colorPair.name} 
              value={darkMode ? colorPair.dark : colorPair.light}
              style={{
                backgroundColor: darkMode ? colorPair.dark : colorPair.light,
                color: darkMode ? '#ffffff' : '#000000',
                fontWeight: 'bold'
              }}
            >
              {colorPair.name}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default TaskDetailsDialog;
