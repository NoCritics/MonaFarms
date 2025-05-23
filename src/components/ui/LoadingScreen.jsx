import React, { useState, useEffect } from 'react';

// Define shimmer animation style
const shimmerAnimation = `
  @keyframes shimmer {
    from { left: -30%; }
    to { left: 130%; }
  }
`;

const LoadingScreen = ({ isLoading, minDisplayTime = 1500 }) => {
  const [display, setDisplay] = useState(isLoading);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  
  useEffect(() => {
    let startTime = Date.now();
    let timer;
    let progressTimer;
    
    // Show loading screen
    if (isLoading) {
    setDisplay(true);
    setFadeOut(false);
    
    // Simulate progress
    setProgress(0);
    let currentProgress = 0;
    
    // Add a small initial delay to ensure DOM is ready
    setTimeout(() => {
    // Force a small visible progress immediately
    setProgress(5);
    
    progressTimer = setInterval(() => {
      // Increment more slowly as we approach 100%
    if (currentProgress < 70) {
        currentProgress += Math.random() * 5;
      } else if (currentProgress < 90) {
        currentProgress += Math.random() * 2;
      } else if (currentProgress < 98) {
        currentProgress += Math.random() * 0.5;
        }
          
          // Clamp to 98% (final 2% when actually loaded)
          currentProgress = Math.min(98, currentProgress);
          setProgress(currentProgress);
        }, 150);
      }, 100);
    } else {
      // When loading is done, ensure we display for at least minDisplayTime
      const elapsedTime = Date.now() - startTime;
      
      if (elapsedTime < minDisplayTime) {
        // Complete the progress bar
        setProgress(100);
        
        // Wait for the remaining time before hiding
        timer = setTimeout(() => {
          setFadeOut(true);
          setTimeout(() => setDisplay(false), 500); // Match the CSS transition time
        }, minDisplayTime - elapsedTime);
      } else {
        // Elapsed time already exceeds minimum, start hiding
        setProgress(100);
        setFadeOut(true);
        setTimeout(() => setDisplay(false), 500); // Match the CSS transition time
      }
      
      if (progressTimer) {
        clearInterval(progressTimer);
      }
    }
    
    return () => {
      if (timer) clearTimeout(timer);
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [isLoading, minDisplayTime]);
  
  if (!display) return null;
  
  const loadingTips = [
    "🌱 Crops need water to grow!",
    "🍅 Tomatoes grow faster than potatoes.",
    "🧪 Fertilizer instantly matures crops!",
    "🏆 Harvest crops to climb the leaderboard!",
    "💧 Each water bucket gives you 6 charges.",
    "🌾 Different crops yield different amounts of CROPS tokens.",
    "🧑‍🌾 Buy tiles to expand your farm!",
    "🪙 Claim free CROPS tokens once per day.",
    "🔄 Transactions may take a few seconds to process.",
    "🍓 Strawberries are the fastest growing crop!",
  ];
  
  const randomTip = loadingTips[Math.floor(Math.random() * loadingTips.length)];
  
  return (
    <>
      {/* Add animation style directly to component */}
      <style dangerouslySetInnerHTML={{ __html: shimmerAnimation }} />
      <div className={`loading-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="loading-content">
        <div className="logo-container">
          <div className="logo">
            <span className="logo-text">MonaFarms</span>
            <div className="logo-icon">🌱</div>
          </div>
        </div>
        
        <div className="loading-progress-container" style={{ 
            height: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            overflow: 'hidden',
            margin: '24px 0',
            boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
            position: 'relative',
            width: '100%'
          }}>
          <div 
            className="loading-progress-bar" 
            style={{ 
              width: `${progress}%`, 
              height: '100%',
              backgroundColor: '#8358FF',
              backgroundImage: 'linear-gradient(to right, #8358FF, #F7B538)',
              position: 'relative',
              zIndex: 2,
              display: 'block',
              borderRadius: '9999px'
            }}
          >
            {/* Add shimmer effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.3), rgba(255,255,255,0))',
              transform: 'skewX(-20deg)',
              width: '30%',
              zIndex: 3,
              animation: 'shimmer 1.5s infinite linear'
            }}></div>
          </div>
        </div>
        
        <div className="loading-tip">
          <span className="tip-icon">💡</span> 
          <span className="tip-text">{randomTip}</span>
        </div>
      </div>
    </div>
    </>
  );
};

export default LoadingScreen;