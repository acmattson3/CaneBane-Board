// client/src/components/Column.js
import React from 'react';
import Card from './Card';

function Column({ column }) {
  return (
    <div>
      <h3>{column.name}</h3>
      {column.cards.map(card => (
        <Card key={card._id} card={card} />
      ))}
    </div>
  );
}

export default Column;