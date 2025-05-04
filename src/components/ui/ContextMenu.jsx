import React, { useState, useEffect, useRef } from 'react';
import './ContextMenu.css';

export const ContextMenu = ({ 
  isOpen, 
  onClose, 
  position = { x: 0, y: 0 }, 
  actions = [] 
}) => {
  const menuRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Adjust position if menu would go off screen
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      if (position.x + rect.width > viewportWidth) {
        menuRef.current.style.left = `${viewportWidth - rect.width - 10}px`;
      }
      
      if (position.y + rect.height > viewportHeight) {
        menuRef.current.style.top = `${viewportHeight - rect.height - 10}px`;
      }
    }
  }, [isOpen, position]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="context-menu"
      ref={menuRef}
      style={{ 
        top: `${position.y}px`, 
        left: `${position.x}px`,
        animation: 'menuFadeIn 0.2s ease-out forwards'
      }}
    >
      {actions.map((action, index) => (
        <div 
          key={index}
          className={`context-menu-item ${action.disabled ? 'disabled' : ''}`}
          onClick={() => {
            if (!action.disabled) {
              action.onClick();
              onClose();
            }
          }}
        >
          {action.icon && <span className="menu-icon">{action.icon}</span>}
          <span className="menu-label">{action.label}</span>
        </div>
      ))}
    </div>
  );
};