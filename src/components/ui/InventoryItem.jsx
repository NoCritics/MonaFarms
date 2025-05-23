import React from 'react';
import './InventoryItem.css';

const InventoryItem = ({ 
  icon, 
  count, 
  label, 
  onClick, 
  isSelected = false,
  className = '',
  style = {}
}) => {
  return (
    <div 
      className={`inventory-item-card ${isSelected ? 'selected' : ''} ${className}`}
      onClick={onClick}
      style={style}
    >
      <div className="inventory-item-icon-wrapper">
        {icon}
      </div>
      <div className="inventory-item-count">
        {count}
      </div>
      <div className="inventory-item-label">
        {label}
      </div>
    </div>
  );
};

export default InventoryItem;
