import React, { useState, useEffect, useRef } from 'react';
import { TIMING, EASING } from '../../styles/constants';
import './OnboardingTutorial.css';

// Tutorial step icons
const StepIcon = ({ icon, active }) => {
  return (
    <div className={`tutorial-step-icon ${active ? 'active' : ''}`}>
      {icon}
    </div>
  );
};

/**
 * OnboardingTutorial Component
 * 
 * Step-by-step interactive tutorial for new users
 * Guides users through the game mechanics and interface
 */
const OnboardingTutorial = ({ 
  isOpen = false, 
  onClose, 
  onComplete,
  startAtStep = 0
}) => {
  const [currentStep, setCurrentStep] = useState(startAtStep);
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);
  const tutorialRef = useRef(null);
  const highlightRef = useRef(null);
  
  // Tutorial steps configuration
  const tutorialSteps = [
    {
      title: "Welcome to MonaFarms! 🌱",
      content: "Let's get started with a quick tour of your new farm. This tutorial will walk you through the basics of farming on the Monad blockchain.",
      icon: "👋",
      highlight: null,
      position: 'center',
      isIntro: true
    },
    {
      title: "Register Your Farm",
      content: "First, create your farmer profile by entering a unique nickname. This will register you on the blockchain and give you your first seeds and water buckets.",
      icon: "👤",
      highlight: '.nav-tab:nth-child(4)', // Player tab
      position: 'bottom'
    },
    {
      title: "Claim Daily Tokens",
      content: "Every 24 hours, you can claim free CROPS tokens from the faucet. These tokens are used to buy seeds, water buckets, fertilizer, and expand your farm.",
      icon: "💰",
      highlight: '.nav-tab:nth-child(3)', // Token tab
      position: 'bottom'
    },
    {
      title: "Plant Your First Crop",
      content: "Go to your farm, select an empty tile, and plant a seed. Different crops have different growth times and rewards.",
      icon: "🌱",
      highlight: '.nav-tab:nth-child(1)', // Farm tab
      position: 'bottom'
    },
    {
      title: "Water Your Crops",
      content: "After planting, you need to water your crops. Each crop needs to be watered once to grow. Each water bucket gives you multiple watering charges.",
      icon: "💧",
      highlight: '.farm-grid .farm-tile:first-child',
      position: 'right'
    },
    {
      title: "Harvest When Ready",
      content: "Once a crop is fully grown, you can harvest it to earn CROPS tokens. Different crops have different growth times and yields.",
      icon: "🌾",
      highlight: '.farm-grid .farm-tile:first-child',
      position: 'right'
    },
    {
      title: "Visit the Shop",
      content: "Use your earned tokens to buy more seeds, water buckets, fertilizer, and expand your farm by purchasing additional tiles.",
      icon: "🛒",
      highlight: '.nav-tab:nth-child(2)', // Shop tab
      position: 'bottom'
    },
    {
      title: "Climb the Leaderboard",
      content: "Compete with other farmers to earn points and climb the leaderboard. Plant, water, and harvest crops to earn points!",
      icon: "🏆",
      highlight: '.nav-tab:nth-child(5)', // Leaderboard tab
      position: 'bottom'
    },
    {
      title: "You're All Set!",
      content: "That's it! You're ready to start farming. Remember, you can always revisit this tutorial from the help menu if you need a refresher.",
      icon: "✨",
      highlight: null,
      position: 'center',
      isOutro: true
    }
  ];
  
  // Track visibility changes
  useEffect(() => {
    if (isOpen && !isVisible) {
      setIsVisible(true);
    } else if (!isOpen && isVisible) {
      handleClose();
    }
  }, [isOpen]);
  
  // Position highlight element
  useEffect(() => {
    if (!isVisible || !tutorialSteps[currentStep].highlight) {
      return;
    }
    
    const positionHighlight = () => {
      const highlightElement = document.querySelector(tutorialSteps[currentStep].highlight);
      
      if (!highlightElement || !highlightRef.current) {
        return;
      }
      
      const rect = highlightElement.getBoundingClientRect();
      
      // Apply position to highlight element
      highlightRef.current.style.top = `${rect.top}px`;
      highlightRef.current.style.left = `${rect.left}px`;
      highlightRef.current.style.width = `${rect.width}px`;
      highlightRef.current.style.height = `${rect.height}px`;
      highlightRef.current.style.opacity = '1';
      
      // Position tutorial card relative to highlighted element
      if (tutorialRef.current) {
        const tutorialRect = tutorialRef.current.getBoundingClientRect();
        const position = tutorialSteps[currentStep].position;
        
        let top, left;
        
        switch (position) {
          case 'top':
            top = rect.top - tutorialRect.height - 20;
            left = rect.left + (rect.width / 2) - (tutorialRect.width / 2);
            break;
          case 'right':
            top = rect.top + (rect.height / 2) - (tutorialRect.height / 2);
            left = rect.right + 20;
            break;
          case 'bottom':
            top = rect.bottom + 20;
            left = rect.left + (rect.width / 2) - (tutorialRect.width / 2);
            break;
          case 'left':
            top = rect.top + (rect.height / 2) - (tutorialRect.height / 2);
            left = rect.left - tutorialRect.width - 20;
            break;
          case 'center':
          default:
            top = window.innerHeight / 2 - tutorialRect.height / 2;
            left = window.innerWidth / 2 - tutorialRect.width / 2;
        }
        
        // Keep within viewport bounds
        if (left < 20) left = 20;
        if (left + tutorialRect.width > window.innerWidth - 20) {
          left = window.innerWidth - tutorialRect.width - 20;
        }
        
        if (top < 20) top = 20;
        if (top + tutorialRect.height > window.innerHeight - 20) {
          top = window.innerHeight - tutorialRect.height - 20;
        }
        
        tutorialRef.current.style.top = `${top}px`;
        tutorialRef.current.style.left = `${left}px`;
      }
    };
    
    // Position after a short delay to ensure DOM is ready
    setTimeout(positionHighlight, 100);
    
    // Reposition on window resize
    window.addEventListener('resize', positionHighlight);
    
    return () => {
      window.removeEventListener('resize', positionHighlight);
    };
  }, [currentStep, isVisible]);
  
  // Handle next step
  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, TIMING.fast);
    } else {
      handleComplete();
    }
  };
  
  // Handle previous step
  const handlePrev = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, TIMING.fast);
    }
  };
  
  // Handle tutorial completion
  const handleComplete = () => {
    setIsVisible(false);
    
    // Call onComplete after transition
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, TIMING.medium);
  };
  
  // Handle close
  const handleClose = () => {
    setIsVisible(false);
    
    // Call onClose after transition
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, TIMING.medium);
  };
  
  // Skip to next unskippable step
  const handleSkip = () => {
    // Find next intro/outro step
    let nextStep = tutorialSteps.findIndex(
      (step, index) => index > currentStep && (step.isIntro || step.isOutro)
    );
    
    // If no more intro/outro steps, go to last step
    if (nextStep === -1) {
      nextStep = tutorialSteps.length - 1;
    }
    
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentStep(nextStep);
      setIsAnimating(false);
    }, TIMING.fast);
  };
  
  // If not visible, don't render
  if (!isVisible) {
    return null;
  }
  
  const currentTutorialStep = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;
  
  return (
    <div className="tutorial-overlay">
      {/* Highlighted element overlay */}
      {currentTutorialStep.highlight && (
        <div 
          ref={highlightRef}
          className="tutorial-highlight"
        />
      )}
      
      {/* Tutorial card */}
      <div 
        ref={tutorialRef}
        className={`tutorial-card ${isAnimating ? 'animating' : ''} position-${currentTutorialStep.position}`}
      >
        <button className="tutorial-close-btn" onClick={handleClose}>×</button>
        
        {/* Progress indicator */}
        <div className="tutorial-progress">
          {tutorialSteps.map((step, index) => (
            <div 
              key={index}
              className={`tutorial-progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              onClick={() => setCurrentStep(index)}
            />
          ))}
        </div>
        
        {/* Icon */}
        <StepIcon 
          icon={currentTutorialStep.icon} 
          active={true}
        />
        
        {/* Content */}
        <div className="tutorial-content">
          <h3 className="tutorial-title">{currentTutorialStep.title}</h3>
          <p className="tutorial-text">{currentTutorialStep.content}</p>
        </div>
        
        {/* Controls */}
        <div className="tutorial-controls">
          {!isFirstStep && !currentTutorialStep.isIntro && !currentTutorialStep.isOutro && (
            <button 
              className="tutorial-btn tutorial-btn-skip"
              onClick={handleSkip}
            >
              Skip
            </button>
          )}
          
          <div className="tutorial-nav-buttons">
            {!isFirstStep && (
              <button 
                className="tutorial-btn tutorial-btn-prev"
                onClick={handlePrev}
              >
                Back
              </button>
            )}
            
            <button 
              className="tutorial-btn tutorial-btn-next"
              onClick={handleNext}
            >
              {isLastStep ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial;