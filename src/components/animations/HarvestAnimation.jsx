import React, { useEffect, useState } from 'react';
import './animations.css';

export const HarvestAnimation = ({ cropType, onComplete }) => {
  const [animationStage, setAnimationStage] = useState(0);
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    // Generate particles
    const newParticles = [];
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2) * (i / particleCount);
      const speed = 1 + Math.random();
      const size = 3 + Math.random() * 7;
      
      newParticles.push({
        id: i,
        x: 50,
        y: 50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size
      });
    }
    setParticles(newParticles);
    
    // Animation timeline
    const timeline = [
      setTimeout(() => setAnimationStage(1), 100),
      setTimeout(() => setAnimationStage(2), 600),
      setTimeout(() => {
        setAnimationStage(3);
        if (onComplete) setTimeout(onComplete, 700);
      }, 1500),
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
  
  // Calculate particle positions based on animation stage
  const updatedParticles = particles.map(particle => {
    if (animationStage < 1) return particle;
    
    const x = particle.x + particle.vx * (animationStage === 1 ? 10 : 20);
    const y = particle.y + particle.vy * (animationStage === 1 ? 10 : 20) + (animationStage === 2 ? 5 : 0);
    const opacity = animationStage === 3 ? 0 : 1;
    
    return { ...particle, x, y, opacity };
  });
  
  // Get crop shape based on type
  const getCropShape = (x, y, size) => {
    switch(cropType) {
      case 0: // Potato
        return (
          <g transform={`translate(${x - size/2}, ${y - size/2})`}>
            <ellipse cx={size/2} cy={size/2} rx={size/2} ry={size/2 - 1} fill={getCropColor()} />
            <circle cx={size/2 - 2} cy={size/2 - 1} r={size/10} fill="#3E2723" opacity="0.7" />
          </g>
        );
      case 1: // Tomato
        return (
          <circle cx={x} cy={y} r={size/2} fill={getCropColor()} />
        );
      case 2: // Strawberry
        return (
          <g transform={`translate(${x - size/2}, ${y - size/2})`}>
            <path 
              d={`M${size*0.3},${size*0.3} Q${size*0.5},${size*0.1} ${size*0.7},${size*0.3} L${size*0.7},${size*0.6} Q${size*0.5},${size*0.8} ${size*0.3},${size*0.6} Z`} 
              fill={getCropColor()} 
            />
            {/* Strawberry seeds */}
            <circle cx={size*0.4} cy={size*0.3} r={size*0.05} fill="#FFEB3B" opacity="0.8" />
            <circle cx={size*0.6} cy={size*0.3} r={size*0.05} fill="#FFEB3B" opacity="0.8" />
            <circle cx={size*0.5} cy={size*0.5} r={size*0.05} fill="#FFEB3B" opacity="0.8" />
          </g>
        );
      default:
        return <circle cx={x} cy={y} r={size/2} fill={getCropColor()} />;
    }
  };
  
  return (
    <div className="animation-container">
      <svg width="100" height="100" viewBox="0 0 100 100">
        {/* Ground */}
        <rect x="20" y="80" width="60" height="20" fill="#5D4037" />
        
        {/* Initial pulse effect */}
        <circle 
          cx="50" 
          cy="50" 
          r={animationStage === 0 ? 0 : 30}
          fill="white"
          opacity={animationStage === 0 ? 1 : 0}
          style={{ transition: 'all 0.5s ease-out' }}
        />
        
        {/* Flying crop particles */}
        {updatedParticles.map(particle => (
          <g 
            key={particle.id} 
            style={{ opacity: particle.opacity }}
            className={animationStage === 1 ? "bounce-animation" : ""}
          >
            {getCropShape(particle.x, particle.y, particle.size)}
          </g>
        ))}
        
        {/* Token indicator */}
        {animationStage >= 2 && (
          <g transform="translate(35, 20)" className="bounce-animation">
            <circle cx="15" cy="15" r="15" fill="#F7B538" />
            <text 
              x="15" 
              y="20" 
              fontSize="12" 
              fontWeight="bold" 
              textAnchor="middle" 
              fill="#5D4037"
            >
              +
            </text>
          </g>
        )}
        
        {/* Hole in ground where crop was */}
        {animationStage >= 1 && (
          <ellipse 
            cx="50" 
            cy="80" 
            rx="10" 
            ry="3" 
            fill="#3E2723"
          />
        )}
      </svg>
    </div>
  );
};