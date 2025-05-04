import React from 'react';
import { useDragDrop } from './DragDropContext';

export const DroppableTarget = ({
  children,
  targetType,
  targetData,
  onDrop,
  className = ""
}) => {
  const { draggingItem, setTarget, canDrop, dragTarget } = useDragDrop();
  
  const handleDragOver = (e) => {
    if (canDrop(targetType)) {
      e.preventDefault();
      setTarget(targetData);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    
    if (canDrop(targetType) && draggingItem) {
      onDrop(draggingItem.item, targetData);
    }
  };
  
  const isTargeted = dragTarget === targetData && canDrop(targetType);
  
  return (
    <div
      className={`droppable-target ${className} ${isTargeted ? 'drop-target-active' : ''}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
};