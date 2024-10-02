// src/pages/BoardView.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getBoard } from '../services/api';
import Column from '../components/Column';

function BoardView() {
  const [board, setBoard] = useState(null);
  const { id } = useParams();

  const fetchBoard = useCallback(async () => {
    try {
      const data = await getBoard(id);
      setBoard(data);
    } catch (error) {
      console.error('Error fetching board:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  if (!board) return <div>Loading...</div>;

  return (
    <div>
      <h2>{board.name}</h2>
      <div style={{ display: 'flex' }}>
        {board.columns.map(column => (
          <Column key={column._id} column={column} />
        ))}
      </div>
    </div>
  );
}

export default BoardView;