import React, { useState, useEffect } from 'react';
import { TIMING, EASING } from '../../styles/constants';
import './SeasonalEffects.css';

// Season types
export const SEASONS = {
  SPRING: 'spring',
  SUMMER: 'summer',
  FALL: 'fall',
  WINTER: 'winter'
};

/**
 * SeasonalEffects Component
 * 
 * Adds seasonal visual effects to the farm
 * Changes appearance based on the current season
 */
const SeasonalEffects = ({ season = SEASONS.SUMMER, isTransitioning = false }) => {
  const [particles, setParticles] = useState([]);
  
  // Generate seasonal particles when season changes
  useEffect(() => {
    generateParticles();
  }, [season]);
  
  // Generate particles appropriate for the season
  const generateParticles = () => {
    const newParticles = [];
    const particleCount = season === SEASONS.FALL || season === SEASONS.WINTER ? 40 : 20;
    
    for (let i = 0; i < particleCount; i++) {
      const id = `seasonal-particle-${i}`;
      const x = Math.random() * 100; // % position
      const y = Math.random() * 100;
      const size = Math.random() * 8 + 2; // 2-10px
      const delay = Math.random() * 10; // Staggered appearance
      
      // Different particle types based on season
      let type = '';
      let rotation = Math.random() * 360;
      let duration = Math.random() * 10 + 10;
      
      switch (season) {
        case SEASONS.SPRING:
          type = Math.random() > 0.5 ? 'petal' : 'pollen';
          break;
        case SEASONS.SUMMER:
          type = Math.random() > 0.7 ? 'butterfly' : 'dandelion';
          break;
        case SEASONS.FALL:
          type = `leaf-${Math.floor(Math.random() * 4)}`;
          break;
        case SEASONS.WINTER:
          type = 'snowflake';
          break;
        default:
          type = 'leaf-0';
      }
      
      newParticles.push({
        id,
        type,
        x,
        y,
        size,
        delay,
        rotation,
        duration
      });
    }
    
    setParticles(newParticles);
  };
  
  // Render the appropriate seasonal overlay
  const renderSeasonalOverlay = () => {
    switch (season) {
      case SEASONS.SPRING:
        return <div className="seasonal-overlay spring-overlay" />;
      case SEASONS.SUMMER:
        return <div className="seasonal-overlay summer-overlay" />;
      case SEASONS.FALL:
        return <div className="seasonal-overlay fall-overlay" />;
      case SEASONS.WINTER:
        return <div className="seasonal-overlay winter-overlay" />;
      default:
        return null;
    }
  };
  
  // Render all particles
  const renderParticles = () => {
    return particles.map(particle => {
      const style = {
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: `${particle.size}px`,
        height: `${particle.size}px`,
        transform: `rotate(${particle.rotation}deg)`,
        animationDelay: `${particle.delay}s`,
        animationDuration: `${particle.duration}s`
      };
      
      // Apply season-specific animation
      let animationClass = '';
      switch (season) {
        case SEASONS.SPRING:
          animationClass = 'float-gentle';
          break;
        case SEASONS.SUMMER:
          animationClass = particle.type === 'butterfly' ? 'butterfly-fly' : 'float-circular';
          break;
        case SEASONS.FALL:
          animationClass = 'fall-leaf';
          break;
        case SEASONS.WINTER:
          animationClass = 'snow-fall';
          break;
      }
      
      return (
        <div 
          key={particle.id} 
          className={`seasonal-particle ${particle.type} ${animationClass}`} 
          style={style}
        />
      );
    });
  };
  
  return (
    <div className={`seasonal-effects ${season} ${isTransitioning ? 'transitioning' : ''}`}>
      {renderSeasonalOverlay()}
      <div className="particles-container">
        {renderParticles()}
      </div>
    </div>
  );
};

export default SeasonalEffects;