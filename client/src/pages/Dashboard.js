// Import necessary libraries and components
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Snackbar,
  IconButton,
  Box
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { getBoards, createBoard, joinBoard, deleteBoard, renameBoard } from '../services/api';
import { getCurrentUser } from '../services/auth';

// Alert component for Snackbar
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Dashboard() {
  // State variables for managing boards and UI states
  const [boards, setBoards] = useState([]); // List of boards
  const [openCreateDialog, setOpenCreateDialog] = useState(false); // State for create board dialog
  const [openJoinDialog, setOpenJoinDialog] = useState(false); // State for join board dialog
  const [newBoardName, setNewBoardName] = useState(''); // New board name input
  const [boardCode, setBoardCode] = useState(''); // Board code input for joining
  const [error, setError] = useState(''); // Error message state
  const [snackbar, setSnackbar] = useState({ // Snackbar state for notifications
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate(); // Hook for navigation
  const currentUser = getCurrentUser(); // Get current user information
  const fetchedRef = useRef(false); // Ref to track if boards have been fetched
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // State for delete confirmation dialog
  const [boardToDelete, setBoardToDelete] = useState(null); // Board selected for deletion
  const [confirmBoardName, setConfirmBoardName] = useState(''); // Input for confirming board deletion
  const [renameDialogOpen, setRenameDialogOpen] = useState(false); // State for rename dialog
  const [boardToRename, setBoardToRename] = useState(null); // Board selected for renaming
  const [renameBoardName, setRenameBoardName] = useState(''); // New name for the board

  // Fetch boards from the API
  const fetchBoards = useCallback(async () => {
    try {
      const data = await getBoards(); // Fetch boards
      setBoards(data); // Update state with fetched boards
    } catch (error) {
      setError('Failed to fetch boards'); // Handle fetch error
    }
  }, []);

  // Effect to navigate or fetch boards based on user state
  useEffect(() => {
    if (!currentUser) {
      navigate('/login'); // Redirect to login if no user
    } else if (!fetchedRef.current) {
      fetchBoards(); // Fetch boards if user is present
      fetchedRef.current = true; // Set ref to true after fetching
    }
  }, [currentUser, navigate, fetchBoards]);

  // Handle creating a new board
  const handleCreateBoard = async () => {
    try {
      setError(''); // Clear previous errors
      const newBoard = await createBoard(newBoardName); // Create board
      setBoards(prevBoards => [...prevBoards, newBoard]); // Update boards state
      setNewBoardName(''); // Reset input
      setOpenCreateDialog(false); // Close dialog
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating board'); // Handle creation error
    }
  };

  // Handle joining an existing board
  const handleJoinBoard = async () => {
    try {
      setError(''); // Clear previous errors
      const joinedBoard = await joinBoard(boardCode); // Join board
      setBoards(prevBoards => [...prevBoards, joinedBoard]); // Update boards state
      setBoardCode(''); // Reset input
      setOpenJoinDialog(false); // Close dialog
    } catch (error) {
      setError(error.response?.data?.message || 'Error joining board'); // Handle joining error
    }
  };

  // Handle delete button click
  const handleDeleteClick = (board) => {
    setBoardToDelete(board); // Set board to delete
    setDeleteDialogOpen(true); // Open delete confirmation dialog
  };

  // Confirm board deletion
  const handleDeleteConfirm = async () => {
    if (confirmBoardName === boardToDelete.name) { // Check if names match
      try {
        await deleteBoard(boardToDelete._id); // Delete board
        setBoards(prevBoards => prevBoards.filter(board => board._id !== boardToDelete._id)); // Update boards state
        setSnackbar({
          open: true,
          message: 'Board deleted successfully',
          severity: 'success'
        }); // Show success message
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Error deleting board',
          severity: 'error'
        }); // Show error message
      }
      setDeleteDialogOpen(false); // Close dialog
      setBoardToDelete(null); // Reset board to delete
      setConfirmBoardName(''); // Reset confirmation input
    } else {
      setSnackbar({
        open: true,
        message: 'Board name does not match',
        severity: 'error'
      }); // Show error if names do not match
    }
  };

  // Handle rename button click
  const handleRenameClick = (board) => {
    setBoardToRename(board);
    setRenameBoardName(board.name);
    setRenameDialogOpen(true);
  };

  // Confirm board rename
  const handleRenameConfirm = async () => {
    try {
      await renameBoard(boardToRename._id, renameBoardName);
      setBoards(prev => prev.map(b => (b._id === boardToRename._id ? { ...b, name: renameBoardName } : b)));
      setSnackbar({ open: true, message: 'Board renamed successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error renaming board', severity: 'error' });
    }
    setRenameDialogOpen(false);
    setBoardToRename(null);
    setRenameBoardName('');
  };

  if (!currentUser) {
    return <div>Loading...</div>; // Show loading if no user
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Your Boards
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
            sx={{ mr: 2 }}
          >
            Create Board
          </Button>
          <Button
            variant="outlined"
            startIcon={<GroupAddIcon />}
            onClick={() => setOpenJoinDialog(true)}
          >
            Join Board
          </Button>
        </Box>
      </Box>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {boards.map(board => (
          <Box key={board._id} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' } }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  {board.name}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', alignItems: 'center', px: 2, pb: 2 }}>
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => navigate(`/board/${board._id}`)}
                >
                  View Board
                </Button>
                <Box>
                  {board.owner === currentUser?.user?.id && (
                    <IconButton
                      size="small"
                      onClick={() => handleRenameClick(board)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteClick(board)}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'error.light',
                        color: 'error.contrastText',
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Create Board Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
        <DialogTitle>Create a New Board</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a name for your new board:
          </DialogContentText>
          <TextField
            autoFocus
            margin="normal"
            id="name"
            label="Board Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateBoard}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Join Board Dialog */}
      <Dialog open={openJoinDialog} onClose={() => setOpenJoinDialog(false)}>
        <DialogTitle>Join a Board</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the code of the board you want to join:
          </DialogContentText>
          <TextField
            autoFocus
            margin="normal"
            id="code"
            label="Board Code"
            type="text"
            fullWidth
            variant="outlined"
            value={boardCode}
            onChange={(e) => setBoardCode(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJoinDialog(false)}>Cancel</Button>
          <Button onClick={handleJoinBoard}>Join</Button>
        </DialogActions>
      </Dialog>

      {/* Rename Board Dialog */}
      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
        <DialogTitle>Rename Board</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter a new name for the board:</DialogContentText>
          <TextField
            autoFocus
            margin="normal"
            id="renameBoardName"
            label="Board Name"
            type="text"
            fullWidth
            variant="outlined"
            value={renameBoardName}
            onChange={(e) => setRenameBoardName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRenameConfirm}>Rename</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Board Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To delete the board "{boardToDelete?.name}", please type the board name to confirm:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="confirmBoardName"
            label="Board Name"
            type="text"
            fullWidth
            variant="outlined"
            value={confirmBoardName}
            onChange={(e) => setConfirmBoardName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      > 
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Dashboard; // Export Dashboard component
