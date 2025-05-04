import React, { createContext, useState, useContext } from 'react';

const DragDropContext = createContext();

export const useDragDrop = () => useContext(DragDropContext);

export const DragDropProvider = ({ children }) => {
  const [draggingItem, setDraggingItem] = useState(null);
  const [dragTarget, setDragTarget] = useState(null);
  
  const startDrag = (item, itemType) => {
    setDraggingItem({ item, type: itemType });
  };
  
  const endDrag = () => {
    setDraggingItem(null);
    setDragTarget(null);
  };
  
  const setTarget = (target) => {
    setDragTarget(target);
  };
  
  const canDrop = (targetType) => {
    if (!draggingItem) return false;
    
    // Define valid drag-drop combinations
    const validCombinations = {
      'seed': ['empty-tile'],
      'water': ['planted-tile'],
      'fertilizer': ['growing-tile']
    };
    
    return validCombinations[draggingItem.type]?.includes(targetType) || false;
  };
  
  return (
    <DragDropContext.Provider value={{ 
      draggingItem, 
      dragTarget, 
      startDrag, 
      endDrag, 
      setTarget, 
      canDrop 
    }}>
      {children}
    </DragDropContext.Provider>
  );
};