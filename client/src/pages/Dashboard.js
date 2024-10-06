import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { getBoards, createBoard, joinBoard } from '../services/api';
import { getCurrentUser } from '../services/auth';

function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [boardCode, setBoardCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const fetchedRef = useRef(false);

  const fetchBoards = useCallback(async () => {
    try {
      console.log('Fetching boards...');
      const data = await getBoards();
      console.log('Fetched boards:', data);
      setBoards(data);
    } catch (error) {
      console.error('Error fetching boards:', error);
      setError('Failed to fetch boards');
    }
  }, []);

  useEffect(() => {
    console.log('Dashboard useEffect running');
    if (!currentUser) {
      console.log('No current user, navigating to login');
      navigate('/login');
    } else if (!fetchedRef.current) {
      console.log('Current user found, fetching boards');
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
      console.log('Creating new board with name:', newBoardName);
      const newBoard = await createBoard(newBoardName);
      console.log('New board created:', newBoard);
      setBoards(prevBoards => {
        const updatedBoards = [...prevBoards, newBoard];
        console.log('Updated boards:', updatedBoards);
        return updatedBoards;
      });
      setNewBoardName('');
      setOpenCreateDialog(false);
    } catch (error) {
      console.error('Error creating board:', error);
      setError(error.response?.data?.message || 'Error creating board');
    }
  };

  const handleJoinBoard = async () => {
    try {
      setError('');
      console.log('Joining board with code:', boardCode);
      const joinedBoard = await joinBoard(boardCode);
      console.log('Joined board:', joinedBoard);
      setBoards(prevBoards => [...prevBoards, joinedBoard]);
      setBoardCode('');
      setOpenJoinDialog(false);
    } catch (error) {
      console.error('Error joining board:', error);
      setError(error.response?.data?.message || 'Error joining board');
    }
  };

  console.log('Current boards state:', boards);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Grid item>
          <Typography variant="h4" component="h1">
            Your Boards
          </Typography>
        </Grid>
        <Grid item>
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
        </Grid>
      </Grid>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Grid container spacing={3}>
        {boards.map(board => (
          <Grid item xs={12} sm={6} md={4} key={board._id}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2">
                  {board.name}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate(`/board/${board._id}`)}>
                  View Board
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

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
    </Container>
  );
}

export default Dashboard;