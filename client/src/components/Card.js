// client/src/components/Card.js
import React from 'react';

function Card({ card }) {
  return (
    <div>
      <h4>{card.title}</h4>
      <p>{card.description}</p>
    </div>
  );
}

export default Card;