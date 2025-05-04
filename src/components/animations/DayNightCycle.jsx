import React, { useState, useEffect } from 'react';

// DayNightCycle component applies subtle visual changes to the app
// based on the current time of day
const DayNightCycle = () => {
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [cycleProgress, setCycleProgress] = useState(0);
  
  useEffect(() => {
    // Function to determine time of day and update variables
    const updateTimeOfDay = () => {
      const now = new Date();
      const hours = now.getHours();
      
      // Calculate the progress through the day (0-100%)
      let progress = 0;
      
      // Morning: 6-12
      if (hours >= 6 && hours < 12) {
        setTimeOfDay('morning');
        progress = ((hours - 6) / 6) * 100;
      }
      // Day: 12-18
      else if (hours >= 12 && hours < 18) {
        setTimeOfDay('day');
        progress = ((hours - 12) / 6) * 100;
      }
      // Evening: 18-22
      else if (hours >= 18 && hours < 22) {
        setTimeOfDay('evening');
        progress = ((hours - 18) / 4) * 100;
      }
      // Night: 22-6
      else {
        setTimeOfDay('night');
        // Calculate progress through the night (22-6)
        if (hours >= 22) {
          progress = ((hours - 22) / 8) * 100;
        } else {
          progress = ((hours + 2) / 8) * 100; // +2 because 24+2=26, and 26-22=4 hours into night
        }
      }
      
      setCycleProgress(progress);
    };
    
    // Update on mount
    updateTimeOfDay();
    
    // Update every minute
    const interval = setInterval(updateTimeOfDay, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Apply different CSS variable modifications based on time of day
  useEffect(() => {
    const root = document.documentElement;
    
    // Reset all modifications
    root.style.removeProperty('--color-background-overlay');
    root.style.removeProperty('--shadow-color-modifier');
    
    switch (timeOfDay) {
      case 'morning':
        // Soft warm light in morning
        root.style.setProperty('--color-background-overlay', 'rgba(255, 220, 175, 0.05)');
        root.style.setProperty('--shadow-color-modifier', '20, 10, 0');
        break;
      case 'day':
        // Bright neutral light during day
        root.style.setProperty('--color-background-overlay', 'rgba(255, 255, 255, 0.03)');
        root.style.setProperty('--shadow-color-modifier', '0, 0, 0');
        break;
      case 'evening':
        // Warm orange/purple hues in evening
        root.style.setProperty('--color-background-overlay', 'rgba(255, 180, 140, 0.07)');
        root.style.setProperty('--shadow-color-modifier', '20, 5, 0');
        break;
      case 'night':
        // Deep blue tint at night
        root.style.setProperty('--color-background-overlay', 'rgba(50, 70, 150, 0.08)');
        root.style.setProperty('--shadow-color-modifier', '0, 0, 20');
        break;
      default:
        break;
    }
  }, [timeOfDay]);
  
  // Render an indicator in the top-right corner
  const getTimeIcon = () => {
    switch (timeOfDay) {
      case 'morning':
        return '🌅';
      case 'day':
        return '☀️';
      case 'evening':
        return '🌇';
      case 'night':
        return '🌙';
      default:
        return '⏱️';
    }
  };
  
  return (
    <div className="day-night-indicator">
      <div className="time-icon tooltip" data-tooltip={`Time of day: ${timeOfDay}`}>
        {getTimeIcon()}
      </div>
    </div>
  );
};

export default DayNightCycle;