import React, { useState, useEffect } from 'react';
import { COLORS, TIME_OF_DAY, TIMING, EASING } from '../../styles/constants';
import './WeatherEffects.css';

// Weather types
const WEATHER_TYPES = {
  CLEAR: 'clear',
  RAIN: 'rain',
  CLOUDY: 'cloudy',
  FOGGY: 'foggy'
};

// Season types
const SEASONS = {
  SPRING: 'spring',
  SUMMER: 'summer',
  FALL: 'fall',
  WINTER: 'winter'
};

/**
 * WeatherEffects Component
 * 
 * Renders dynamic weather effects as an overlay for the farm
 * Simulates weather conditions and seasonal changes
 */
const WeatherEffects = ({ timeOfDay = 'day', season = SEASONS.SUMMER }) => {
  const [weather, setWeather] = useState(WEATHER_TYPES.CLEAR);
  const [intensity, setIntensity] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [particles, setParticles] = useState([]);

  // Weather change simulation
  useEffect(() => {
    // Initial weather
    generateWeather();
    
    // Weather change interval
    const weatherInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance of weather change
        generateWeather();
      }
    }, 60000 * 5); // Check every 5 minutes
    
    return () => clearInterval(weatherInterval);
  }, [season]);
  
  // Generate random weather based on season probabilities
  const generateWeather = () => {
    setIsTransitioning(true);
    
    // Weather probabilities by season
    let weatherProbabilities;
    
    switch (season) {
      case SEASONS.SPRING:
        weatherProbabilities = {
          [WEATHER_TYPES.CLEAR]: 0.5,
          [WEATHER_TYPES.RAIN]: 0.3,
          [WEATHER_TYPES.CLOUDY]: 0.15,
          [WEATHER_TYPES.FOGGY]: 0.05
        };
        break;
      case SEASONS.SUMMER:
        weatherProbabilities = {
          [WEATHER_TYPES.CLEAR]: 0.7,
          [WEATHER_TYPES.RAIN]: 0.1,
          [WEATHER_TYPES.CLOUDY]: 0.15,
          [WEATHER_TYPES.FOGGY]: 0.05
        };
        break;
      case SEASONS.FALL:
        weatherProbabilities = {
          [WEATHER_TYPES.CLEAR]: 0.4,
          [WEATHER_TYPES.RAIN]: 0.2,
          [WEATHER_TYPES.CLOUDY]: 0.3,
          [WEATHER_TYPES.FOGGY]: 0.1
        };
        break;
      case SEASONS.WINTER:
        weatherProbabilities = {
          [WEATHER_TYPES.CLEAR]: 0.6,
          [WEATHER_TYPES.RAIN]: 0.05,
          [WEATHER_TYPES.CLOUDY]: 0.25,
          [WEATHER_TYPES.FOGGY]: 0.1
        };
        break;
      default:
        weatherProbabilities = {
          [WEATHER_TYPES.CLEAR]: 0.6,
          [WEATHER_TYPES.RAIN]: 0.15,
          [WEATHER_TYPES.CLOUDY]: 0.15,
          [WEATHER_TYPES.FOGGY]: 0.1
        };
    }
    
    // Select weather based on probabilities
    const random = Math.random();
    let cumulativeProbability = 0;
    
    for (const [weatherType, probability] of Object.entries(weatherProbabilities)) {
      cumulativeProbability += probability;
      
      if (random <= cumulativeProbability) {
        const newIntensity = Math.random() * 0.6 + 0.2; // 0.2 to 0.8
        
        // Only transition if the weather is changing
        if (weather !== weatherType || Math.abs(intensity - newIntensity) > 0.3) {
          setWeather(weatherType);
          setIntensity(newIntensity);
          
          // Generate appropriate particles
          generateParticles(weatherType, newIntensity);
        }
        break;
      }
    }
    
    // End transition after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, TIMING.slow);
  };
  
  // Generate weather particles based on type and intensity
  const generateParticles = (weatherType, intensity) => {
    const count = Math.floor(intensity * 50); // Up to 50 particles
    let newParticles = [];
    
    switch (weatherType) {
      case WEATHER_TYPES.RAIN:
        for (let i = 0; i < count; i++) {
          newParticles.push({
            id: `rain-${i}`,
            type: 'rain',
            x: Math.random() * 100, // % position
            y: Math.random() * 100,
            size: Math.random() * 3 + 1, // 1-4px
            speed: Math.random() * 15 + 10, // Fall speed
            delay: Math.random() * 2 // Staggered appearance
          });
        }
        break;
      
      case WEATHER_TYPES.CLOUDY:
        for (let i = 0; i < Math.min(count / 5, 8); i++) {
          newParticles.push({
            id: `cloud-${i}`,
            type: 'cloud',
            x: Math.random() * 100,
            y: Math.random() * 30, // Higher in the sky
            size: Math.random() * 40 + 20, // Cloud size
            speed: Math.random() * 0.5 + 0.1, // Slow movement
            delay: Math.random() * 5
          });
        }
        break;
      
      case WEATHER_TYPES.FOGGY:
        for (let i = 0; i < Math.min(count / 2, 15); i++) {
          newParticles.push({
            id: `fog-${i}`,
            type: 'fog',
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 80 + 50, // Fog patch size
            speed: Math.random() * 0.3 + 0.1, // Very slow drift
            opacity: Math.random() * 0.3 + 0.1, // Semi-transparent
            delay: Math.random() * 10
          });
        }
        break;
        
      case WEATHER_TYPES.CLEAR:
        // A few gentle wind effects or sun rays can be added here
        if (timeOfDay === 'day') {
          // Sun rays
          for (let i = 0; i < 5; i++) {
            newParticles.push({
              id: `sunray-${i}`,
              type: 'sunray',
              x: Math.random() * 100,
              y: Math.random() * 20,
              size: Math.random() * 60 + 40,
              speed: 0.05,
              opacity: Math.random() * 0.2 + 0.05,
              delay: Math.random() * 8
            });
          }
        }
        break;
    }
    
    setParticles(newParticles);
  };
  
  // Render particles based on their type
  const renderParticles = () => {
    return particles.map(particle => {
      const style = {
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        animation: getParticleAnimation(particle),
        opacity: particle.opacity || 1,
        width: particle.type !== 'rain' ? `${particle.size}px` : undefined,
        height: particle.type !== 'rain' ? `${particle.size}px` : undefined
      };
      
      return (
        <div 
          key={particle.id} 
          className={`weather-particle ${particle.type}`} 
          style={style}
        />
      );
    });
  };
  
  // Generate CSS animation properties for a particle
  const getParticleAnimation = (particle) => {
    switch (particle.type) {
      case 'rain':
        return `rainFall ${particle.speed}s linear ${particle.delay}s infinite`;
      case 'cloud':
        return `cloudDrift ${particle.speed * 100}s linear ${particle.delay}s infinite`;
      case 'fog':
        return `fogFloat ${particle.speed * 120}s ease-in-out ${particle.delay}s infinite alternate`;
      case 'sunray':
        return `sunrays ${particle.speed * 120}s ease-in-out ${particle.delay}s infinite alternate`;
      default:
        return '';
    }
  };
  
  // Time of day color mapping
  const getTimeOfDayColors = () => {
    return TIME_OF_DAY[timeOfDay] || TIME_OF_DAY.day;
  };
  
  // Weather overlay styles
  const getWeatherOverlayStyle = () => {
    const timeColors = getTimeOfDayColors();
    
    // Base styles
    let style = {
      transition: `all ${TIMING.slow}ms ${EASING.easeInOut}`,
      background: 'transparent',
    };
    
    // Weather-specific styles
    switch (weather) {
      case WEATHER_TYPES.RAIN:
        style.background = `linear-gradient(180deg, 
          rgba(19, 16, 34, ${intensity * 0.5}) 0%, 
          rgba(30, 22, 51, ${intensity * 0.3}) 100%)`;
        break;
      case WEATHER_TYPES.CLOUDY:
        style.background = `linear-gradient(180deg, 
          rgba(64, 53, 100, ${intensity * 0.3}) 0%, 
          rgba(30, 22, 51, ${intensity * 0.1}) 100%)`;
        break;
      case WEATHER_TYPES.FOGGY:
        style.background = `linear-gradient(180deg, 
          rgba(58, 46, 92, ${intensity * 0.4}) 0%, 
          rgba(64, 53, 100, ${intensity * 0.6}) 100%)`;
        style.filter = `blur(${intensity * 2}px)`;
        break;
    }
    
    return style;
  };
  
  return (
    <div className={`weather-effects ${weather} ${timeOfDay} ${isTransitioning ? 'transitioning' : ''}`}>
      <div className="weather-overlay" style={getWeatherOverlayStyle()}>
        <div className="particles-container">
          {renderParticles()}
        </div>
      </div>
    </div>
  );
};

export default WeatherEffects;