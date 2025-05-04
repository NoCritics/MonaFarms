import React from 'react';

export const LoadingSpinner = ({ size = 40, color = '#8358FF', thickness = 4 }) => {
  return (
    <div 
      className="loading-spinner"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderWidth: `${thickness}px`,
        borderColor: `${color} transparent transparent transparent`,
      }}
    ></div>
  );
};

export const LoadingOverlay = ({ 
  isLoading, 
  text = 'Loading...', 
  opacity = 0.8, 
  spinnerSize = 60,
  spinnerColor = '#8358FF'
}) => {
  if (!isLoading) return null;
  
  return (
    <div className="loading-overlay" style={{ backgroundColor: `rgba(30, 22, 51, ${opacity})` }}>
      <div className="loading-content">
        <LoadingSpinner size={spinnerSize} color={spinnerColor} />
        {text && <div className="loading-text">{text}</div>}
      </div>
    </div>
  );
};