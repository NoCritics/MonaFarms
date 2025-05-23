import React, { useState } from 'react';
import { DraggableItem } from './DraggableItem';

// Enhanced Shop Item with 3D-like hover effects and improved visuals
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
  className = "",
  playerTier,
  requiredTier
}) => {
  const [hovering, setHovering] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  
  const handlePurchase = async () => {
    if (disabled || !meetsTierRequirement) return;
    
    setPurchasing(true);
    try {
      await onPurchase();
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setPurchasing(false);
    }
  };
  
  const tierNames = {
    0: 'Beginner',
    1: 'Intermediate',
    2: 'Expert',
    3: 'Master',
    4: 'Legendary',
    5: 'Epochal'
  };

  // Check if player's tier meets the required tier
  const meetsTierRequirement = (playerTier >= requiredTier);
  
  // Only show tier requirement if requiredTier is > 0
  const showTierRequirement = requiredTier > 0;
  
  // Item is disabled if it's explicitly disabled or player doesn't meet tier requirement
  const isDisabled = disabled || !meetsTierRequirement;

  // Format price to be more readable
  const formattedPrice = typeof price === 'number' 
    ? price.toLocaleString() 
    : price?.toString() || '0';

  return (
    <div
      className={`shop-item ${className} ${isDisabled ? 'disabled' : ''} ${!meetsTierRequirement ? 'tier-locked' : ''} ${purchasing ? 'purchasing' : ''}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        transform: hovering && !isDisabled ? 'translateY(-5px) rotateX(5deg)' : 'translateY(0) rotateX(0)',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: hovering && !isDisabled ? '0 10px 20px rgba(0, 0, 0, 0.4), 0 6px 6px rgba(0, 0, 0, 0.3)' : '0 4px 8px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {!meetsTierRequirement && (
        <div className="tier-lock-overlay" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          flexDirection: 'column',
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{fontSize: '24px'}}>🔒</div>
          <div style={{
            color: '#FF9800',
            fontWeight: 'bold',
            textAlign: 'center',
            padding: '0 10px'
          }}>
            Requires {tierNames[requiredTier] || `Tier ${requiredTier}`}
          </div>
        </div>
      )}

      <DraggableItem
        itemData={itemData}
        itemType={itemType}
        disabled={count === 0 || isDisabled}
        className="shop-item-draggable"
      >
        <div className="shop-item-icon" style={{
          transform: hovering && !isDisabled ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.3s ease',
          background: `radial-gradient(circle at center, ${itemType === 'seed' ? 'rgba(76, 175, 80, 0.2)' : 
                                                         itemType === 'water' ? 'rgba(33, 150, 243, 0.2)' : 
                                                         itemType === 'fertilizer' ? 'rgba(156, 39, 176, 0.2)' : 
                                                         'rgba(131, 88, 255, 0.2)'}, transparent)`,
          borderRadius: '12px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: !meetsTierRequirement ? 'grayscale(0.7)' : 'none'
        }}>{icon}</div>
      </DraggableItem>
      
      <div className="shop-item-content">
        <div className="shop-item-title" style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          color: isDisabled ? 'rgba(247, 181, 56, 0.7)' : '#F7B538',
          textShadow: hovering && !isDisabled ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
          transition: 'all 0.3s ease'
        }}>{title}</div>
        <div className="shop-item-description" style={{
          fontSize: '0.9rem',
          color: isDisabled ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.7)',
          marginBottom: '1rem',
          lineHeight: '1.4'
        }}>{description}</div>
        
        {showTierRequirement && (
          <div 
            className="shop-item-tier-requirement"
            style={{
              fontSize: '0.8rem',
              color: meetsTierRequirement ? 'var(--color-success, #4CAF50)' : 'var(--color-warning, #FF9800)',
              marginBottom: '0.75rem',
              fontWeight: 'bold'
            }}
          >
            Requires: {tierNames[requiredTier] || `Tier ${requiredTier}`}
            {meetsTierRequirement ? ' ✓' : ' ✗'}
          </div>
        )}
        
        <div className="shop-item-footer">
          <div className="shop-item-count">
            Available: <span className={count === 0 ? 'text-error' : 'text-success'}>{count}</span>
          </div>
          
          <div className="shop-item-price">
            <span className="price-icon">💰</span> {formattedPrice}
          </div>
        </div>
      </div>
      
      <button
        className="shop-item-buy-btn"
        disabled={isDisabled || purchasing}
        onClick={handlePurchase}
        style={{
          background: isDisabled ? 'rgba(131, 88, 255, 0.3)' : 
                     purchasing ? 'linear-gradient(45deg, #6F48E8, #8358FF)' : 
                     hovering ? 'linear-gradient(45deg, #8358FF, #9670FF)' : 
                     'linear-gradient(45deg, #6F48E8, #8358FF)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '0.5rem 1rem',
          fontWeight: 'bold',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          boxShadow: hovering && !isDisabled ? '0 4px 8px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)',
          transform: hovering && !isDisabled && !purchasing ? 'translateY(-2px)' : 'translateY(0)',
          width: '100%',
          marginTop: '1rem',
          zIndex: 11
        }}
      >
        {purchasing ? (
          <>
            <div className="spinner" style={{
              width: '16px',
              height: '16px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '50%',
              borderTopColor: 'white',
              animation: 'spin 1s linear infinite'
            }}></div>
            Buying...
          </>
        ) : (
          <>
            <span className="btn-icon">🛒</span>
            {!meetsTierRequirement ? 'Tier Locked' : 'Buy'}
          </>
        )}
      </button>
      
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .shop-item.tier-locked {
          opacity: 0.9;
          position: relative;
        }
        .shop-item.disabled .shop-item-title,
        .shop-item.tier-locked .shop-item-title {
           color: rgba(247, 181, 53, 0.7); /* Dim title if locked/disabled */
        }
      `}</style>
      
      {hovering && !isDisabled && (
        <div className="shop-item-hover-effect" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at center, rgba(131, 88, 255, 0.2) 0%, rgba(131, 88, 255, 0) 70%)`,
          pointerEvents: 'none',
          opacity: 1,
          animation: 'pulse-hover 2s infinite'
        }}></div>
      )}
      
      {purchasing && (
        <div className="shop-item-purchasing-animation" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(131, 88, 255, 0.1)',
          pointerEvents: 'none'
        }}>
          <div className="sparkles" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 3%),
              radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 3%),
              radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 3%),
              radial-gradient(circle at 80% 10%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 3%),
              radial-gradient(circle at 90% 90%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 3%),
              radial-gradient(circle at 10% 60%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 3%)
            `,
            animation: 'sparkle-animation 2s infinite'
          }}></div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes pulse-hover {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        @keyframes sparkle-animation {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
};