import React, { useState } from 'react';
import { DraggableItem } from './DraggableItem';

export const ShopItem = ({
  title,
  description,
  price,
  icon,
  count,
  onPurchase,
  disabled = false,
  itemType,
  itemData,
  className = ""
}) => {
  const [hovering, setHovering] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  
  const handlePurchase = async () => {
    if (disabled) return;
    
    setPurchasing(true);
    try {
      await onPurchase();
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setPurchasing(false);
    }
  };
  
  return (
    <div
      className={`shop-item ${className} ${disabled ? 'disabled' : ''} ${purchasing ? 'purchasing' : ''}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <DraggableItem
        itemData={itemData}
        itemType={itemType}
        disabled={count === 0 || disabled}
        className="shop-item-draggable"
      >
        <div className="shop-item-icon">{icon}</div>
      </DraggableItem>
      
      <div className="shop-item-content">
        <div className="shop-item-title">{title}</div>
        <div className="shop-item-description">{description}</div>
        
        <div className="shop-item-footer">
          <div className="shop-item-count">
            Available: <span className={count === 0 ? 'text-error' : 'text-success'}>{count}</span>
          </div>
          
          <div className="shop-item-price">
            <span className="price-icon">💰</span> {price}
          </div>
        </div>
      </div>
      
      <button
        className="shop-item-buy-btn"
        disabled={disabled || purchasing}
        onClick={handlePurchase}
      >
        {purchasing ? 'Buying...' : (
          <>
            <span className="btn-icon">🛒</span>
            Buy
          </>
        )}
      </button>
      
      {hovering && !disabled && (
        <div className="shop-item-hover-effect"></div>
      )}
      
      {purchasing && (
        <div className="shop-item-purchasing-animation">
          <div className="sparkles"></div>
        </div>
      )}
    </div>
  );
};