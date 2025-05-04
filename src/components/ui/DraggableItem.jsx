import React, { useRef } from 'react';
import { useDragDrop } from './DragDropContext';

export const DraggableItem = ({ 
  children, 
  itemData, 
  itemType, 
  disabled = false,
  className = "" 
}) => {
  const { startDrag, endDrag, draggingItem } = useDragDrop();
  const itemRef = useRef(null);
  
  const handleDragStart = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    
    startDrag(itemData, itemType);
    
    // Create a custom drag image
    const dragImage = new Image();
    dragImage.src = itemType === 'seed' 
      ? `/assets/seeds-${itemData}.png` 
      : itemType === 'water' 
        ? '/assets/water-bucket.png' 
        : '/assets/fertilizer.png';
    
    try {
      e.dataTransfer.setDragImage(dragImage, 25, 25);
    } catch (error) {
      // Fallback if image not loaded
      console.log('Drag image not loaded, using default');
    }
    
    e.dataTransfer.effectAllowed = 'move';
  };
  
  return (
    <div 
      ref={itemRef}
      className={`draggable-item ${className} ${disabled ? 'disabled' : ''} ${draggingItem?.item === itemData && draggingItem?.type === itemType ? 'dragging' : ''}`}
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={endDrag}
    >
      {children}
    </div>
  );
};