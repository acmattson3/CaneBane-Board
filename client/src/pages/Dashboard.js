// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
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
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { getBoards, createBoard, joinBoard } from '../services/api';

function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [boardCode, setBoardCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const data = await getBoards();
      setBoards(data);
    } catch (error) {
      console.error('Error fetching boards:', error);
    }
  };

  const handleCreateBoard = async () => {
    try {
      const newBoard = await createBoard(newBoardName);
      setBoards([...boards, newBoard]);
      setOpenCreateDialog(false);
      setNewBoardName('');
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const handleJoinBoard = async () => {
    try {
      const joinedBoard = await joinBoard(boardCode);
      setBoards([...boards, joinedBoard]);
      setOpenJoinDialog(false);
      setBoardCode('');
    } catch (error) {
      console.error('Error joining board:', error);
    }
  };

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
            margin="dense"
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
            margin="dense"
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