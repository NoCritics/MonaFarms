import React, { useState, useEffect } from 'react';
import './notifications.css';

const achievementIcons = {
  'farming': '🌱',
  'harvesting': '🌾',
  'economy': '💰',
  'collection': '🏆',
  'social': '👥'
};

export const AchievementNotification = ({ 
  achievement, 
  onClose,
  autoCloseDelay = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    // Generate particles for the celebration effect
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 3 + Math.random() * 7,
      color: [
        '#FFD700', // Gold
        '#8358FF', // Purple
        '#F7B538', // Yellow
        '#4CAF50', // Green
        '#9C27B0'  // Deep Purple
      ][Math.floor(Math.random() * 5)]
    }));
    
    setParticles(newParticles);
    
    // Fade in the notification
    setTimeout(() => setIsVisible(true), 100);
    
    // Auto close after delay
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500); // Wait for fade out animation
    }, autoCloseDelay);
    
    return () => clearTimeout(timer);
  }, [onClose, autoCloseDelay]);
  
  return (
    <div className={`achievement-notification ${isVisible ? 'visible' : ''}`}>
      <div className="achievement-particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              animationDelay: `${Math.random() * 0.5}s`,
              ['--x']: `${(Math.random() * 2 - 1) * 100}px`,
              ['--y']: `${(Math.random() * 2 - 1) * 100}px`
            }}
          ></div>
        ))}
      </div>
      
      <div className="achievement-icon">
        {achievementIcons[achievement.category] || '🎮'}
      </div>
      
      <div className="achievement-content">
        <h3 className="achievement-title">Achievement Unlocked!</h3>
        <h4 className="achievement-name">{achievement.name}</h4>
        <p className="achievement-description">{achievement.description}</p>
        <div className="achievement-points">+{achievement.points} points</div>
      </div>
      
      <button className="achievement-close" onClick={() => {
        setIsVisible(false);
        setTimeout(onClose, 500);
      }}>×</button>
    </div>
  );
};