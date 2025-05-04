import React, { useEffect, useState } from 'react';
import './animations.css';

export const GrowthAnimation = ({ cropType, growthPercentage, onComplete }) => {
  const [animationStage, setAnimationStage] = useState(0);
  
  useEffect(() => {
    const timeline = [
      setTimeout(() => setAnimationStage(1), 300),
      setTimeout(() => {
        setAnimationStage(2);
        if (onComplete) onComplete();
      }, 2000),
    ];
    
    return () => timeline.forEach(timer => clearTimeout(timer));
  }, [onComplete]);
  
  const getCropColor = () => {
    switch(cropType) {
      case 0: return '#8B4513'; // Potato (brown)
      case 1: return '#FF6347'; // Tomato (red)
      case 2: return '#FF0080'; // Strawberry (pink)
      default: return '#4CAF50'; // Default green
    }
  };
  
  // Calculate stem height based on growth percentage
  const stemHeight = 20 + (growthPercentage / 100) * 40;
  const stemY = 80 - stemHeight;
  
  // Calculate flower/fruit size based on growth percentage
  const fruitSize = (growthPercentage / 100) * 10;
  
  return (
    <div className="animation-container">
      <svg width="100" height="100" viewBox="0 0 100 100">
        {/* Ground */}
        <rect x="20" y="80" width="60" height="20" fill="#5D4037" />
        
        {/* Plant stem with dynamic height */}
        <path 
          d={`M50,80 L50,${stemY}`} 
          stroke="#4CAF50" 
          strokeWidth="2" 
          fill="none"
          style={{
            transition: 'all 1s ease-out',
            strokeDasharray: '60',
            strokeDashoffset: animationStage >= 1 ? '0' : '60',
          }}
        />
        
        {/* Leaves that grow with the stem */}
        {growthPercentage > 30 && (
          <>
            <path 
              d={`M50,${stemY + 15} L40,${stemY + 10}`} 
              stroke="#4CAF50" 
              strokeWidth="2" 
              fill="none"
              className="grow-animation"
            />
            <path 
              d={`M50,${stemY + 25} L60,${stemY + 20}`} 
              stroke="#4CAF50" 
              strokeWidth="2" 
              fill="none"
              className="grow-animation"
            />
            <ellipse 
              cx="38" 
              cy={stemY + 8} 
              rx="5" 
              ry="3" 
              fill="#4CAF50" 
              style={{ transform: 'rotate(-20deg)' }}
              className="fade-animation"
            />
            <ellipse 
              cx="62" 
              cy={stemY + 18} 
              rx="5" 
              ry="3" 
              fill="#4CAF50" 
              style={{ transform: 'rotate(20deg)' }}
              className="fade-animation"
            />
          </>
        )}
        
        {/* Crop-specific fruit/flower element */}
        {growthPercentage > 50 && (
          <>
            {cropType === 0 && ( // Potato
              <g>
                <circle 
                  cx="50" 
                  cy="82" 
                  r={fruitSize / 2} 
                  fill={getCropColor()} 
                  className="pulse-animation"
                />
                {/* Small "eyes" on potato */}
                <circle cx="48" cy="81" r="1" fill="#3E2723" opacity="0.7" />
                <circle cx="52" cy="83" r="1" fill="#3E2723" opacity="0.7" />
              </g>
            )}
            {cropType === 1 && ( // Tomato
              <circle 
                cx="50" 
                cy={stemY + 10} 
                r={fruitSize} 
                fill={getCropColor()} 
                className="pulse-animation"
              />
            )}
            {cropType === 2 && ( // Strawberry
              <g>
                <path 
                  d={`M45,${stemY + 5} Q50,${stemY - 5} 55,${stemY + 5} L55,${stemY + 10} Q50,${stemY + 15} 45,${stemY + 10} Z`} 
                  fill={getCropColor()} 
                  className="pulse-animation"
                />
                {/* Strawberry seeds */}
                <g fill="#FFEB3B" opacity="0.8">
                  <circle cx="47" cy={stemY + 5} r="0.8" />
                  <circle cx="50" cy={stemY + 4} r="0.8" />
                  <circle cx="53" cy={stemY + 5} r="0.8" />
                  <circle cx="46" cy={stemY + 8} r="0.8" />
                  <circle cx="50" cy={stemY + 9} r="0.8" />
                  <circle cx="54" cy={stemY + 8} r="0.8" />
                </g>
              </g>
            )}
          </>
        )}
        
        {/* Shimmer effect for growing plant */}
        {animationStage >= 1 && (
          <ellipse 
            cx="50" 
            cy={stemY + 20} 
            rx="25" 
            ry="10" 
            fill="rgba(255, 255, 255, 0.2)" 
            className="pulse-animation"
          />
        )}
      </svg>
    </div>
  );
};