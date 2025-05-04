import React, { useState, useEffect, useRef } from 'react';
import { TIMING, EASING, COLORS } from '../../styles/constants';
import './EnhancedLoadingScreen.css';

// Farm Scene SVG components
const SunIcon = ({ className = '' }) => (
  <div className={`loading-sun ${className}`}>
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="20" fill="#F7B538" />
      <g className="sun-rays">
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
          <line 
            key={`ray-${angle}`}
            x1="50" 
            y1="50" 
            x2={50 + 25 * Math.cos(angle * Math.PI / 180)} 
            y2={50 + 25 * Math.sin(angle * Math.PI / 180)} 
            stroke="#F7B538" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
        ))}
      </g>
    </svg>
  </div>
);

const CloudIcon = ({ className = '', delay = 0 }) => (
  <div 
    className={`loading-cloud ${className}`}
    style={{ animationDelay: `${delay}s` }}
  >
    <svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M25,50 C18,50 12,44 12,37 C12,30 18,24 25,24 C25,24 25,24 25,24 C29,16 37,10 47,10 C59,10 69,19 71,30 C71,30 72,30 73,30 C82,30 90,38 90,47 C90,56 82,60 73,60 C67,60 32,60 25,60 C15,60 5,50 5,40 C5,30 15,24 25,24" 
        fill="rgba(255, 255, 255, 0.8)"
      />
    </svg>
  </div>
);

const FarmField = () => (
  <div className="loading-farm-field">
    <svg viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
      {/* Farm field grid */}
      {Array.from({ length: 8 }).map((_, i) => (
        <rect 
          key={`field-${i}`}
          x={i * 50} 
          y="60" 
          width="45" 
          height="30" 
          rx="2"
          fill={COLORS.primary.dark}
          stroke={COLORS.primary.light}
          strokeWidth="1"
          className="loading-field-plot"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
      
      {/* Growing plants */}
      {[1, 3, 5, 7].map((i) => (
        <React.Fragment key={`plant-${i}`}>
          <line 
            x1={i * 50 + 22.5} 
            y1="60" 
            x2={i * 50 + 22.5} 
            y2="45" 
            stroke={COLORS.accent.light}
            strokeWidth="1.5"
            className="loading-plant-stem"
            style={{ animationDelay: `${i * 0.1 + 0.5}s` }}
          />
          <circle 
            cx={i * 50 + 22.5} 
            cy="42" 
            r="5" 
            fill={i % 3 === 0 ? "#E74C3C" : "#4ADE80"}
            className="loading-plant-head"
            style={{ animationDelay: `${i * 0.1 + 0.7}s` }}
          />
        </React.Fragment>
      ))}
    </svg>
  </div>
);

const ProgressBar = ({ progress }) => (
  <div className="loading-progress-container">
    <div 
      className="loading-progress-bar" 
      style={{ width: `${progress}%` }}
    ></div>
    <div className="loading-progress-text">{`${Math.floor(progress)}%`}</div>
  </div>
);

/**
 * EnhancedLoadingScreen Component
 * 
 * Animated loading screen with a farm scene and useful loading tips
 * Displays progress if provided, or simulates progress over time
 */
const EnhancedLoadingScreen = ({ 
  isLoading = true, 
  progress = null, 
  minDisplayTime = 2000,
  tips = []
}) => {
  const [isVisible, setIsVisible] = useState(isLoading);
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const startTimeRef = useRef(Date.now());
  const progressInterval = useRef(null);
  const tipInterval = useRef(null);

  // Default farming tips if none provided
  const defaultTips = [
    "Different crops have different growth times and rewards",
    "Water your crops to make them grow",
    "Fertilizer instantly matures your crops",
    "Check back daily for free tokens from the faucet",
    "Buy more tiles to expand your farm",
    "Climb the leaderboard by farming efficiently",
    "Different seasons affect crop growth"
  ];

  const displayTips = tips.length > 0 ? tips : defaultTips;
  
  // Handle min display time
  useEffect(() => {
    if (!isLoading) {
      const elapsedTime = Date.now() - startTimeRef.current;
      
      if (elapsedTime < minDisplayTime) {
        const remainingTime = minDisplayTime - elapsedTime;
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, remainingTime);
        
        return () => clearTimeout(timer);
      } else {
        setIsVisible(false);
      }
    } else {
      setIsVisible(true);
      startTimeRef.current = Date.now();
    }
  }, [isLoading, minDisplayTime]);
  
  // Simulated progress for indeterminate loading
  useEffect(() => {
    if (isVisible && progress === null) {
      // Simulate progress with non-linear curve (faster at first, slower toward end)
      progressInterval.current = setInterval(() => {
        setSimulatedProgress(prev => {
          if (prev < 90) {
            // Fast until 70%, then slows down
            const increment = prev < 70 ? 5 : 1;
            return Math.min(90, prev + increment);
          }
          return prev;
        });
      }, 200);
    }
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isVisible, progress]);
  
  // Rotate through tips
  useEffect(() => {
    if (isVisible && displayTips.length > 0) {
      tipInterval.current = setInterval(() => {
        setCurrentTip(prev => (prev + 1) % displayTips.length);
      }, 4000);
    }
    
    return () => {
      if (tipInterval.current) {
        clearInterval(tipInterval.current);
      }
    };
  }, [isVisible, displayTips.length]);
  
  // When hiding, ensure progress completes visually
  useEffect(() => {
    if (!isLoading && isVisible) {
      // Quickly finish the progress bar
      setSimulatedProgress(100);
    }
  }, [isLoading, isVisible]);
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className={`enhanced-loading-screen ${!isLoading ? 'fade-out' : ''}`}>
      <div className="loading-content">
        <div className="loading-scene">
          <div className="loading-sky">
            <SunIcon />
            <CloudIcon className="cloud-left" delay={0.5} />
            <CloudIcon className="cloud-right" delay={1.2} />
          </div>
          <FarmField />
        </div>
        
        <div className="loading-info">
          <h2 className="loading-title">MonaFarms</h2>
          <div className="loading-subtitle">Loading your farm...</div>
          
          <ProgressBar progress={progress !== null ? progress : simulatedProgress} />
          
          <div className="loading-tip">
            <div className="loading-tip-label">TIP:</div>
            <div className="loading-tip-text">{displayTips[currentTip]}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLoadingScreen;