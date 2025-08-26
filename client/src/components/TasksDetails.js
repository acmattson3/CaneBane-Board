import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

// TaskDetailsDialog component for displaying and editing task details
function TaskDetailsDialog({ open, onClose, task, onUpdate, onDelete, darkMode, boardMembers }) {
  // State variables for task details
  const [title, setTitle] = useState(''); // State for task title
  const [description, setDescription] = useState(''); // State for task description
  const [color, setColor] = useState(''); // State for task color
  const [assignedTo, setAssignedTo] = useState(''); // State for assigned member

  // Color pairs for task color selection
  const colorPairs = [
    { name: 'Pink', light: '#FFD1DC', dark: '#d51a79' },
    { name: 'Green', light: '#8ffaa4', dark: '#11c000' },
    { name: 'Blue', light: '#B0E0E6', dark: '#0000cd' },
    { name: 'Lavender', light: '#E6E6FA', dark: '#5d00a0' },
    { name: 'Yellow', light: '#ffeb00', dark: '#e88408' },
  ];

  // Effect to set initial values when task or darkMode changes
  useEffect(() => {
    if (task) {
      setTitle(task.title); // Set title from task
      setDescription(task.description || ''); // Set description from task or default to empty
      const colorPair = colorPairs.find(cp => cp.light === task.color || cp.dark === task.color) || colorPairs[0]; // Find color pair based on task color
      setColor(darkMode ? colorPair.dark : colorPair.light); // Set color based on dark mode
      setAssignedTo(task.assignedTo || ''); // Set assigned member from task or default to empty
    }
  }, [task, darkMode]); // Dependencies for useEffect

  // Function to handle saving the task details
  const handleSave = () => {
    onUpdate({ ...task, title, description, color, assignedTo }); // Call onUpdate with updated task details
    onClose(); // Close the dialog
  };

  // Function to handle task deletion
  const handleDelete = () => {
    onDelete(task._id); // Call onDelete with task ID
    onClose(); // Close the dialog
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth> {/* Dialog for task details */}
      <DialogTitle>Task Details</DialogTitle> {/* Title of the dialog */}
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Task Name" // Label for task name input
          type="text"
          fullWidth
          value={title} // Controlled input for title
          onChange={(e) => setTitle(e.target.value)} // Update title state on change
        />
        <TextField
          margin="dense"
          label="Description" // Label for description input
          type="text"
          fullWidth
          multiline
          rows={4}
          value={description} // Controlled input for description
          onChange={(e) => setDescription(e.target.value)} // Update description state on change
        />
        <Select
          margin="dense"
          fullWidth
          value={color} // Controlled input for color
          onChange={(e) => setColor(e.target.value)} // Update color state on change
          displayEmpty
        >
          {colorPairs.map((colorPair) => ( // Map through color pairs for selection
            <MenuItem 
              key={colorPair.name} 
              value={darkMode ? colorPair.dark : colorPair.light} // Set value based on dark mode
              style={{
                backgroundColor: darkMode ? colorPair.dark : colorPair.light, // Set background color
                color: darkMode ? '#ffffff' : '#000000', // Set text color
                fontWeight: 'bold' // Bold text
              }}
            >
              {colorPair.name} {/* Display color name */}
            </MenuItem>
          ))}
        </Select>
        <FormControl fullWidth margin="dense"> {/* FormControl for assigning members */}
          <InputLabel>Assign To</InputLabel> {/* Label for assign to dropdown */}
          <Select
            value={assignedTo} // Controlled input for assigned member
            onChange={(e) => setAssignedTo(e.target.value)} // Update assigned member state on change
            label="Assign To"
          >
            <MenuItem value="">
              <em>Unassigned</em> {/* Option for unassigned */}
            </MenuItem>
            {boardMembers.map((member) => ( // Map through board members for selection
              <MenuItem key={member._id} value={member._id}>
                {member.displayName || member.email} {/* Display member display name or email */}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button> {/* Cancel button */}
        <Button onClick={handleSave}>Save</Button> {/* Save button */}
        <Button 
          onClick={handleDelete} 
          color="error" 
          startIcon={<DeleteIcon />} // Delete icon
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TaskDetailsDialog; // Export the TaskDetailsDialog component
