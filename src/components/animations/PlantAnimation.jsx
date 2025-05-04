import React, { useEffect, useState } from 'react';
import './animations.css';

export const PlantAnimation = ({ seedType, onComplete }) => {
  const [animationStage, setAnimationStage] = useState(0);
  
  useEffect(() => {
    const timeline = [
      setTimeout(() => setAnimationStage(1), 300),
      setTimeout(() => setAnimationStage(2), 800),
      setTimeout(() => setAnimationStage(3), 1300),
      setTimeout(() => {
        setAnimationStage(4);
        if (onComplete) onComplete();
      }, 2000),
    ];
    
    return () => timeline.forEach(timer => clearTimeout(timer));
  }, [onComplete]);

  const getSeedColor = () => {
    switch(seedType) {
      case 0: return '#8B4513'; // Potato (brown)
      case 1: return '#FF6347'; // Tomato (red)
      case 2: return '#FF0080'; // Strawberry (pink)
      default: return '#8B4513';
    }
  };
  
  return (
    <div className="animation-container">
      <svg width="100" height="100" viewBox="0 0 100 100">
        {/* Ground */}
        <rect x="20" y="80" width="60" height="20" fill="#5D4037" />
        
        {/* Seed dropping animation */}
        {animationStage >= 1 && (
          <circle 
            cx="50" 
            cy={animationStage === 1 ? "30" : animationStage === 2 ? "60" : "75"} 
            r="5" 
            fill={getSeedColor()} 
            className={animationStage === 3 ? "pulse-animation" : ""}
          />
        )}
        
        {/* Soil covering */}
        {animationStage >= 3 && (
          <path 
            d="M35,75 Q50,65 65,75" 
            fill="none" 
            stroke="#3E2723" 
            strokeWidth="3" 
            className={animationStage === 3 ? "draw-animation" : ""}
          />
        )}
        
        {/* Sprout */}
        {animationStage >= 4 && (
          <path 
            d="M50,75 L50,60 M45,65 L50,60 L55,65" 
            fill="none" 
            stroke="#4CAF50" 
            strokeWidth="2" 
            className="grow-animation"
          />
        )}
      </svg>
    </div>
  );
};