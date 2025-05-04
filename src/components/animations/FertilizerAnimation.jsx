import React, { useEffect, useState } from 'react';
import './animations.css';

export const FertilizerAnimation = ({ onComplete }) => {
  const [animationStage, setAnimationStage] = useState(0);
  const [sparkles, setSparkles] = useState([]);
  
  useEffect(() => {
    // Generate sparkles
    const newSparkles = [];
    const sparkleCount = 20;
    
    for (let i = 0; i < sparkleCount; i++) {
      const x = 30 + Math.random() * 40;
      const y = 50 + Math.random() * 30;
      const delay = Math.random() * 0.5;
      const size = 1 + Math.random() * 3;
      
      newSparkles.push({
        id: i,
        x,
        y,
        delay,
        size,
        color: [
          '#8358FF', // Purple
          '#9C27B0', // Deep Purple
          '#673AB7', // Indigo
          '#F7B538', // Yellow
          '#4CAF50'  // Green
        ][Math.floor(Math.random() * 5)]
      });
    }
    setSparkles(newSparkles);
    
    const timeline = [
      setTimeout(() => setAnimationStage(1), 300),
      setTimeout(() => setAnimationStage(2), 800),
      setTimeout(() => {
        setAnimationStage(3);
        if (onComplete) setTimeout(onComplete, 700);
      }, 2000),
    ];
    
    return () => timeline.forEach(timer => clearTimeout(timer));
  }, [onComplete]);
  
  return (
    <div className="animation-container">
      <svg width="100" height="100" viewBox="0 0 100 100">
        {/* Ground */}
        <rect x="20" y="80" width="60" height="20" fill="#5D4037" />
        
        {/* Plant (simplified) */}
        <path 
          d="M50,80 L50,50 M40,65 L50,60 M60,70 L50,65" 
          stroke="#4CAF50" 
          strokeWidth="2" 
          fill="none"
        />
        
        {/* Fertilizer bag */}
        {animationStage >= 1 && (
          <g transform="translate(55, 40)" className={animationStage === 1 ? "bounce-animation" : ""}>
            <rect x="0" y="0" width="15" height="20" rx="2" fill="#9C27B0" />
            <rect x="0" y="0" width="15" height="5" rx="2" fill="#7B1FA2" />
            <text 
              x="7.5" 
              y="15" 
              fontSize="6" 
              fontWeight="bold" 
              textAnchor="middle" 
              fill="white"
            >
              F
            </text>
          </g>
        )}
        
        {/* Fertilizer particles */}
        {animationStage >= 2 && sparkles.map(sparkle => (
          <circle 
            key={sparkle.id}
            cx={sparkle.x}
            cy={sparkle.y}
            r={sparkle.size}
            fill={sparkle.color}
            opacity={animationStage === 3 ? 0 : 1}
            style={{
              animation: `sparkle ${0.8 + sparkle.delay}s ease-out`,
              transition: 'opacity 0.5s ease-out'
            }}
          />
        ))}
        
        {/* Glow effect on plant */}
        {animationStage >= 2 && (
          <>
            <path 
              d="M50,80 L50,50 M40,65 L50,60 M60,70 L50,65" 
              stroke="#8358FF"
              strokeWidth="4"
              fill="none"
              opacity="0.3"
              className="pulse-animation"
            />
            <ellipse 
              cx="50" 
              cy="65" 
              rx="15" 
              ry="25" 
              fill="url(#fertilizerGradient)"
              opacity="0.3"
              className="pulse-animation"
            />
          </>
        )}
        
        {/* Time acceleration indicator */}
        {animationStage >= 2 && (
          <g transform="translate(30, 30)" className="fade-animation">
            <circle cx="15" cy="15" r="15" fill="rgba(255, 255, 255, 0.2)" />
            <path 
              d="M10,15 L20,15 M15,10 L15,20" 
              stroke="#fff" 
              strokeWidth="2"
            />
            <path 
              d="M15,15 L10,8" 
              stroke="#fff" 
              strokeWidth="2"
            />
          </g>
        )}
        
        {/* Definitions */}
        <defs>
          <radialGradient id="fertilizerGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#8358FF" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#8358FF" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};