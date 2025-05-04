/**
 * Animation Timing Constants
 * 
 * Standardizes animation durations across the application for consistent visual experience
 * All values are in milliseconds
 */

export const TIMING = {
  ultraFast: 150,   // For micro-interactions (button clicks, toggle switches)
  fast: 300,        // For small UI changes (fade ins/outs, small movements)
  medium: 500,      // For standard transitions (page transitions, component entries)
  slow: 800,        // For emphasis (important elements appearing, celebrations)
  ultraSlow: 1200   // For dramatic effect (level up, major achievements)
};

/**
 * Animation Easing Functions
 * 
 * Standardizes easing curves for natural motion across the application
 */
export const EASING = {
  // Standard curves
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Special curves
  bounceOut: 'cubic-bezier(0.34, 1.56, 0.64, 1)',  // Slight overshoot with bounce
  springBack: 'cubic-bezier(0.16, 1.36, 0.5, 1)',  // Elastic spring effect
  gentleDecelerate: 'cubic-bezier(0, 0.55, 0.45, 1)'  // Gentle slowdown
};

/**
 * Animation Delay Patterns
 * 
 * For staggered animations where multiple elements animate in sequence
 */
export const STAGGER = {
  quick: 50,    // For closely related items
  normal: 100,  // For standard sequence effects
  slow: 200     // For emphasized sequential reveals
};

/**
 * Standard Animation Presets
 * 
 * Ready-to-use animation configurations for common patterns
 */
export const PRESETS = {
  fadeIn: {
    duration: TIMING.medium,
    easing: EASING.easeOut,
    properties: 'opacity'
  },
  fadeOut: {
    duration: TIMING.fast,
    easing: EASING.easeIn,
    properties: 'opacity'
  },
  slideInUp: {
    duration: TIMING.medium,
    easing: EASING.easeOut,
    properties: 'transform, opacity'
  },
  popIn: {
    duration: TIMING.medium,
    easing: EASING.bounceOut,
    properties: 'transform, opacity'
  },
  farmingAction: {
    duration: TIMING.slow,
    easing: EASING.springBack,
    properties: 'transform, opacity, filter'
  },
  dayNightTransition: {
    duration: TIMING.ultraSlow,
    easing: EASING.gentleDecelerate,
    properties: 'background-color, filter, opacity'
  }
};
