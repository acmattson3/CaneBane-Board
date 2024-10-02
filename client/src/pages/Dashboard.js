// client/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBoards } from '../services/api';

function Dashboard() {
  const [boards, setBoards] = useState([]);

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

  return (
    <div>
      <h2>Your Boards</h2>
      {boards.map(board => (
        <Link key={board._id} to={`/board/${board._id}`}>
          <div>{board.name}</div>
        </Link>
      ))}
    </div>
  );
}

export default Dashboard;