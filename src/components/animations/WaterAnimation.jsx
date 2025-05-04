import React, { useEffect, useState } from 'react';
import './animations.css';

export const WaterAnimation = ({ onComplete }) => {
  const [animationStage, setAnimationStage] = useState(0);
  
  useEffect(() => {
    const timeline = [
      setTimeout(() => setAnimationStage(1), 200),
      setTimeout(() => setAnimationStage(2), 600),
      setTimeout(() => {
        setAnimationStage(3);
        if (onComplete) setTimeout(onComplete, 700);
      }, 1500),
    ];
    
    return () => timeline.forEach(timer => clearTimeout(timer));
  }, [onComplete]);
  
  // Create water droplets
  const droplets = [];
  if (animationStage >= 1) {
    const dropletCount = 10;
    for (let i = 0; i < dropletCount; i++) {
      // Random positions for water droplets
      const x = 30 + Math.random() * 40;
      const y = 20 + Math.random() * 30;
      const delay = Math.random() * 0.5;
      droplets.push({ id: i, x, y, delay });
    }
  }
  
  return (
    <div className="animation-container">
      <svg width="100" height="100" viewBox="0 0 100 100">
        {/* Bucket at top */}
        {animationStage >= 1 && (
          <g transform="translate(35, 10)">
            <path 
              d="M0,0 L30,0 L25,30 L5,30 Z" 
              fill="#7B68EE" 
              stroke="#483D8B" 
              strokeWidth="2"
            />
            <rect x="10" y="-10" width="10" height="10" rx="2" fill="#483D8B" />
          </g>
        )}
        
        {/* Water droplets */}
        {animationStage >= 1 && droplets.map(droplet => (
          <path 
            key={droplet.id}
            d={`M${droplet.x},${droplet.y} q2,-5 5,0 t-5,10 t-5,-10 q3,-5 5,0`}
            fill="#40A4DF"
            style={{
              opacity: animationStage >= 3 ? 0 : 1,
              transform: `translateY(${animationStage === 1 ? 0 : 40}px)`,
              transition: `transform 1s ease-in ${droplet.delay}s, opacity 0.5s ease-out ${animationStage >= 3 ? '0s' : '999s'}`,
            }}
          />
        ))}
        
        {/* Ground with water shimmer effect */}
        <rect x="20" y="80" width="60" height="20" fill="#5D4037" />
        
        {animationStage >= 2 && (
          <rect 
            x="25" 
            y="80" 
            width="50" 
            height="3" 
            fill="#40A4DF"
            opacity="0.7"
            className="pulse-animation"
          />
        )}
      </svg>
    </div>
  );
};