import React, { useEffect, useState } from 'react';
import './animations.css';

export const LevelUpAnimation = ({ rewards = [], onComplete }) => {
  const [animationStage, setAnimationStage] = useState(0);
  
  useEffect(() => {
    const timeline = [
      setTimeout(() => setAnimationStage(1), 300),
      setTimeout(() => setAnimationStage(2), 1000),
      setTimeout(() => {
        setAnimationStage(3);
        if (onComplete) setTimeout(onComplete, 1500);
      }, 2000)
    ];
    
    return () => timeline.forEach(timer => clearTimeout(timer));
  }, [onComplete]);
  
  // Default rewards if none provided
  const displayRewards = rewards.length > 0 ? rewards : [
    { icon: '💧', label: '+1 Water Bucket' },
    { icon: '💰', label: '+50 CROPS Tokens' },
    { icon: '🏆', label: 'New Achievement Unlocked!' }
  ];
  
  return (
    <div className="level-up-container">
      <div className={`level-up-background ${animationStage >= 1 ? 'active' : ''}`}></div>
      
      {animationStage >= 1 && (
        <div className="level-up-stars">
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`
              }}
            ></div>
          ))}
        </div>
      )}
      
      {animationStage >= 2 && (
        <div 
          className="level-up-text"
          style={{
            opacity: 0,
            animation: 'scaleUp 0.5s ease-out forwards'
          }}
        >
          LEVEL UP!
        </div>
      )}
      
      {animationStage >= 3 && (
        <div 
          className="level-up-rewards"
          style={{
            opacity: 0,
            animation: 'fadeIn 0.5s ease-out 0.5s forwards'
          }}
        >
          {displayRewards.map((reward, index) => (
            <div key={index} className="reward-item">
              {reward.icon && <span className="reward-icon">{reward.icon} </span>}
              <span>{reward.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};