import React from 'react';
import './SkeletonLoader.css';
import { TIMING } from '../../styles/constants';

/**
 * SkeletonLoader Component
 * 
 * Displays placeholder loading state for various content types
 * Improves perceived performance by showing content layout before data loads
 */
const SkeletonLoader = ({ type = 'text', count = 1, width, height, className = '' }) => {
  // Generate the appropriate skeleton based on content type
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return renderTextSkeleton(count);
      case 'farm-tile':
        return renderFarmTileSkeleton(count);
      case 'card':
        return renderCardSkeleton();
      case 'avatar':
        return <div className="skeleton-avatar" style={{ width, height }}></div>;
      case 'button':
        return <div className="skeleton-button" style={{ width }}></div>;
      case 'image':
        return <div className="skeleton-image" style={{ width, height }}></div>;
      case 'stat':
        return renderStatSkeleton(count);
      case 'leaderboard-row':
        return renderLeaderboardRowSkeleton(count);
      case 'shop-item':
        return renderShopItemSkeleton(count);
      default:
        return <div className="skeleton-box" style={{ width, height }}></div>;
    }
  };

  // Text lines with varying widths for natural look
  const renderTextSkeleton = (lines) => {
    return Array(lines)
      .fill(0)
      .map((_, i) => {
        // Vary line widths to look more natural
        const lineWidth = i === lines - 1 ? '70%' : i % 3 === 0 ? '90%' : '100%';
        const delay = i * 0.05; // Staggered animation
        
        return (
          <div 
            key={`text-skeleton-${i}`} 
            className="skeleton-text" 
            style={{ 
              width: lineWidth,
              animationDelay: `${delay}s`
            }}
          ></div>
        );
      });
  };

  // Farm tile grid placeholders
  const renderFarmTileSkeleton = (tiles) => {
    return (
      <div className="skeleton-farm-grid">
        {Array(tiles)
          .fill(0)
          .map((_, i) => {
            const delay = (i % 6) * 0.06; // Staggered by row
            
            return (
              <div 
                key={`farm-tile-skeleton-${i}`} 
                className="skeleton-farm-tile"
                style={{ animationDelay: `${delay}s` }}
              >
                <div className="skeleton-farm-tile-inner"></div>
              </div>
            );
          })}
      </div>
    );
  };

  // Card with title and content placeholders
  const renderCardSkeleton = () => {
    return (
      <div className="skeleton-card">
        <div className="skeleton-card-header">
          <div className="skeleton-text" style={{ width: '60%' }}></div>
        </div>
        <div className="skeleton-card-body">
          {renderTextSkeleton(4)}
        </div>
      </div>
    );
  };

  // Statistics display placeholders
  const renderStatSkeleton = (count) => {
    return Array(count)
      .fill(0)
      .map((_, i) => {
        const delay = i * 0.07;
        
        return (
          <div 
            key={`stat-skeleton-${i}`}
            className="skeleton-stat"
            style={{ animationDelay: `${delay}s` }}
          >
            <div className="skeleton-stat-label"></div>
            <div className="skeleton-stat-value"></div>
          </div>
        );
      });
  };

  // Leaderboard row placeholders
  const renderLeaderboardRowSkeleton = (rows) => {
    return Array(rows)
      .fill(0)
      .map((_, i) => {
        const delay = i * 0.06;
        
        return (
          <div 
            key={`leaderboard-row-skeleton-${i}`}
            className="skeleton-leaderboard-row"
            style={{ animationDelay: `${delay}s` }}
          >
            <div className="skeleton-lb-rank"></div>
            <div className="skeleton-lb-avatar"></div>
            <div className="skeleton-lb-name"></div>
            <div className="skeleton-lb-score"></div>
          </div>
        );
      });
  };

  // Shop item placeholders
  const renderShopItemSkeleton = (items) => {
    return (
      <div className="skeleton-shop-grid">
        {Array(items)
          .fill(0)
          .map((_, i) => {
            const delay = i * 0.05;
            
            return (
              <div 
                key={`shop-item-skeleton-${i}`}
                className="skeleton-shop-item"
                style={{ animationDelay: `${delay}s` }}
              >
                <div className="skeleton-shop-icon"></div>
                <div className="skeleton-shop-title"></div>
                <div className="skeleton-shop-price"></div>
                <div className="skeleton-shop-button"></div>
              </div>
            );
          })}
      </div>
    );
  };

  return (
    <div className={`skeleton-loader ${className}`} style={{ 
      animationDuration: `${TIMING.slow}ms`
    }}>
      {renderSkeleton()}
    </div>
  );
};

export default SkeletonLoader;