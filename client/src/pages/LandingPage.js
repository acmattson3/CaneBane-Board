// client/src/pages/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div>
      <h1>Welcome to CaneBane</h1>
      <p>Your personal Kanban board manager</p>
      <Link to="/login">Login</Link>
    </div>
  );
}

export default LandingPage;
