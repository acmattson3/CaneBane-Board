import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const Board = ({ columns }) => {
  const onDragEnd = (result) => {
    // handle drag logic here
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {columns.map((column, index) => (
        <Droppable key={index} droppableId={column.id}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <h2>{column.name}</h2>
              {column.tasks.map((task, taskIndex) => (
                <Draggable key={task.id} draggableId={task.id} index={taskIndex}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <p>{task.name}</p>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </DragDropContext>
  );
};

export default Board;
