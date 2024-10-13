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
import { getBoards, createBoard, joinBoard, deleteBoard } from '../services/api';
import { getCurrentUser } from '../services/auth';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [boardCode, setBoardCode] = useState('');
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const fetchedRef = useRef(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState(null);
  const [confirmBoardName, setConfirmBoardName] = useState('');

  const fetchBoards = useCallback(async () => {
    try {
      const data = await getBoards();
      setBoards(data);
    } catch (error) {
      setError('Failed to fetch boards');
    }
  }, []);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (!fetchedRef.current) {
      fetchBoards();
      fetchedRef.current = true;
    }
  }, [currentUser, navigate, fetchBoards]);

  useEffect(() => {
    console.log('Boards state updated:', boards);
  }, [boards]);

  const handleCreateBoard = async () => {
    try {
      setError('');
      const newBoard = await createBoard(newBoardName);
      setBoards(prevBoards => [...prevBoards, newBoard]);
      setNewBoardName('');
      setOpenCreateDialog(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating board');
    }
  };

  const handleJoinBoard = async () => {
    try {
      setError('');
      const joinedBoard = await joinBoard(boardCode);
      setBoards(prevBoards => [...prevBoards, joinedBoard]);
      setBoardCode('');
      setOpenJoinDialog(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Error joining board');
    }
  };

  const handleDeleteBoard = async (boardId) => {
    try {
      await deleteBoard(boardId);
      setBoards(prevBoards => prevBoards.filter(board => board._id !== boardId));
      setSnackbar({
        open: true,
        message: 'Board deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error deleting board',
        severity: 'error'
      });
    }
  };

  const handleDeleteClick = (board) => {
    setBoardToDelete(board);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (confirmBoardName === boardToDelete.name) {
      try {
        await deleteBoard(boardToDelete._id);
        setBoards(prevBoards => prevBoards.filter(board => board._id !== boardToDelete._id));
        setSnackbar({
          open: true,
          message: 'Board deleted successfully',
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Error deleting board',
          severity: 'error'
        });
      }
      setDeleteDialogOpen(false);
      setBoardToDelete(null);
      setConfirmBoardName('');
    } else {
      setSnackbar({
        open: true,
        message: 'Board name does not match',
        severity: 'error'
      });
    }
  };

  console.log('Current boards state:', boards);

  if (!currentUser) {
    return <div>Loading...</div>;
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
                  View
                </Button>
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

export default Dashboard;
