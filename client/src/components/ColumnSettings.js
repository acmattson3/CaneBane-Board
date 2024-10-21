import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

// ColumnSettings component for managing column settings in a dialog
function ColumnSettings({ open, onClose, column, onSave }) {
  // State variables for done rule and WIP limit
  const [doneRule, setDoneRule] = useState('');
  const [wipLimit, setWipLimit] = useState('');

  // Effect to set initial values based on the column prop
  useEffect(() => {
    if (column) {
      setDoneRule(column.doneRule || ''); // Set done rule from column or default to empty
      setWipLimit(column.wipLimit ? column.wipLimit.toString() : ''); // Set WIP limit from column or default to empty
    }
  }, [column]);

  // Function to handle saving the settings
  const handleSave = () => {
    const updatedData = {};
    // Check if done rule is provided
    if (doneRule !== '') {
      updatedData.doneRule = doneRule; // Add done rule to updated data
    } else {
      updatedData.doneRule = ''; // Ensure done rule is empty if not provided
    }
    // Check if WIP limit is provided
    if (wipLimit !== '') {
      const wipLimitValue = parseInt(wipLimit, 10); // Parse WIP limit to integer
      // Validate WIP limit
      if (!isNaN(wipLimitValue) && wipLimitValue >= 1) {
        updatedData.wipLimit = wipLimitValue; // Add valid WIP limit to updated data
      } else if (wipLimitValue !== null) {
        alert('WIP Limit must be at least 1.'); // Alert if WIP limit is invalid
        return; // Exit if validation fails
      }
    }
    onSave(column.id, updatedData); // Call onSave with column ID and updated data
    onClose(); // Close the dialog
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Column Settings: {column?.title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Done Rule"
          fullWidth
          multiline
          rows={4}
          value={doneRule}
          onChange={(e) => setDoneRule(e.target.value)} // Update done rule on change
        />
        {column?.allowWipLimit && ( // Conditionally render WIP limit field
          <TextField
            margin="dense"
            label="WIP Limit"
            type="number"
            fullWidth
            value={wipLimit}
            onChange={(e) => setWipLimit(e.target.value)} // Update WIP limit on change
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button> // Save settings on click
      </DialogActions>
    </Dialog>
  );
}

export default ColumnSettings; // Export the component
