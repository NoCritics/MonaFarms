import React from 'react';

/**
 * LoadingOverlay Component
 * Shows an overlay with a loading spinner and optional text
 * @param {boolean} isLoading - Whether the overlay should be visible
 * @param {string} text - Optional text to display below spinner
 */
export const LoadingOverlay = ({ isLoading, text = "Loading..." }) => {
  if (!isLoading) return null;
  
  return (
    <div className="loading-overlay">
      <div className="loading-overlay-content">
        <div className="loading-spinner"></div>
        {text && <div className="loading-text">{text}</div>}
      </div>
    </div>
  );
};

export default LoadingOverlay; 