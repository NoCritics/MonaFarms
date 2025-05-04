import React, { useState, useEffect } from 'react';
import OnboardingTutorial from './OnboardingTutorial';

// Local storage keys
const STORAGE_KEYS = {
  TUTORIAL_COMPLETED: 'monafarms_tutorial_completed',
  TUTORIAL_STEP: 'monafarms_tutorial_step',
  TUTORIAL_DISMISSED: 'monafarms_tutorial_dismissed',
  LAST_SEEN_VERSION: 'monafarms_version_seen'
};

/**
 * OnboardingController Component
 * 
 * Manages the display and state of onboarding tutorials
 * Controls when tutorials are shown to new and returning users
 */
const OnboardingController = ({ 
  children,
  currentVersion = '1.0.0',
  forceShow = false, 
  showForNewUsers = true,
  showUpdates = true,
  updateTutorialSteps = []
}) => {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [tutorialStartStep, setTutorialStartStep] = useState(0);
  const [isUpdateTutorialOpen, setIsUpdateTutorialOpen] = useState(false);

  // Check if tutorial should be shown on mount
  useEffect(() => {
    const checkTutorialStatus = () => {
      // If force show is enabled, always show tutorial
      if (forceShow) {
        openTutorial();
        return;
      }
      
      // Check if this is a new user
      const tutorialCompleted = localStorage.getItem(STORAGE_KEYS.TUTORIAL_COMPLETED);
      const tutorialDismissed = localStorage.getItem(STORAGE_KEYS.TUTORIAL_DISMISSED);
      
      if (!tutorialCompleted && !tutorialDismissed && showForNewUsers) {
        // This is a new user, show the tutorial
        openTutorial();
        return;
      }
      
      // Check if there's an app update to show
      if (showUpdates && updateTutorialSteps.length > 0) {
        const lastSeenVersion = localStorage.getItem(STORAGE_KEYS.LAST_SEEN_VERSION);
        
        if (!lastSeenVersion || lastSeenVersion !== currentVersion) {
          // User hasn't seen this version yet, show update tutorial
          openUpdateTutorial();
          return;
        }
      }
    };
    
    // Short delay before checking to ensure app is fully loaded
    const timer = setTimeout(checkTutorialStatus, 2000);
    
    return () => clearTimeout(timer);
  }, [forceShow, showForNewUsers, showUpdates, currentVersion]);
  
  // Open the main tutorial
  const openTutorial = (startStep = 0) => {
    // Get last viewed step if available
    const savedStep = localStorage.getItem(STORAGE_KEYS.TUTORIAL_STEP);
    const initialStep = startStep > 0 ? startStep : (savedStep ? parseInt(savedStep, 10) : 0);
    
    setTutorialStartStep(initialStep);
    setIsTutorialOpen(true);
  };
  
  // Open the update tutorial
  const openUpdateTutorial = () => {
    setIsUpdateTutorialOpen(true);
  };
  
  // Handle tutorial close
  const handleTutorialClose = () => {
    setIsTutorialOpen(false);
    
    // Mark as dismissed but not completed
    localStorage.setItem(STORAGE_KEYS.TUTORIAL_DISMISSED, 'true');
  };
  
  // Handle tutorial completion
  const handleTutorialComplete = () => {
    setIsTutorialOpen(false);
    
    // Mark as completed
    localStorage.setItem(STORAGE_KEYS.TUTORIAL_COMPLETED, 'true');
    localStorage.setItem(STORAGE_KEYS.TUTORIAL_DISMISSED, 'true');
    localStorage.removeItem(STORAGE_KEYS.TUTORIAL_STEP);
  };
  
  // Handle update tutorial completion
  const handleUpdateTutorialComplete = () => {
    setIsUpdateTutorialOpen(false);
    
    // Update last seen version
    localStorage.setItem(STORAGE_KEYS.LAST_SEEN_VERSION, currentVersion);
  };
  
  // Save current tutorial step
  const saveTutorialStep = (step) => {
    localStorage.setItem(STORAGE_KEYS.TUTORIAL_STEP, step.toString());
  };
  
  // Reset tutorial status (for testing or if user wants to see it again)
  const resetTutorialStatus = () => {
    localStorage.removeItem(STORAGE_KEYS.TUTORIAL_COMPLETED);
    localStorage.removeItem(STORAGE_KEYS.TUTORIAL_DISMISSED);
    localStorage.removeItem(STORAGE_KEYS.TUTORIAL_STEP);
    localStorage.removeItem(STORAGE_KEYS.LAST_SEEN_VERSION);
  };
  
  // Context value with tutorial controls
  const tutorialContextValue = {
    openTutorial,
    resetTutorialStatus,
    hasCompletedTutorial: localStorage.getItem(STORAGE_KEYS.TUTORIAL_COMPLETED) === 'true'
  };
  
  return (
    <>
      {/* Wrap children with context provider */}
      <div className="onboarding-controller">
        {React.Children.map(children, child => {
          // Pass context to children if they accept props
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { tutorialContext: tutorialContextValue });
          }
          return child;
        })}
      </div>
      
      {/* Main tutorial */}
      <OnboardingTutorial 
        isOpen={isTutorialOpen}
        startAtStep={tutorialStartStep}
        onClose={handleTutorialClose}
        onComplete={handleTutorialComplete}
        onStepChange={saveTutorialStep}
      />
      
      {/* Update tutorial (if applicable) */}
      {updateTutorialSteps.length > 0 && (
        <OnboardingTutorial 
          isOpen={isUpdateTutorialOpen}
          startAtStep={0}
          tutorialSteps={updateTutorialSteps}
          onClose={handleUpdateTutorialComplete}
          onComplete={handleUpdateTutorialComplete}
        />
      )}
    </>
  );
};

export default OnboardingController;