import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

function ColumnSettings({ open, onClose, column, onSave }) {
  const [doneRule, setDoneRule] = useState('');
  const [wipLimit, setWipLimit] = useState('');

  useEffect(() => {
    if (column) {
      setDoneRule(column.doneRule || '');
      setWipLimit(column.wipLimit ? column.wipLimit.toString() : '');
    }
  }, [column]);

  const handleSave = () => {
    const wipLimitValue = wipLimit ? parseInt(wipLimit, 10) : null;
    if (wipLimitValue < 1) {
      alert('WIP Limit must be least 1.');
      return;
    }
    onSave(column.id, {
      doneRule,
      wipLimit: wipLimitValue
    });
    onClose();
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
          onChange={(e) => setDoneRule(e.target.value)}
        />
        {column?.allowWipLimit && (
          <TextField
            margin="dense"
            label="WIP Limit"
            type="number"
            fullWidth
            value={wipLimit}
            onChange={(e) => setWipLimit(e.target.value)}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ColumnSettings;
