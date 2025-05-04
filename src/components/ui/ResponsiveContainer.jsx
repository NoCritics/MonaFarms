import React, { useState, useEffect, useRef } from 'react';
import { debounce } from '../../utils/performance';
import { BREAKPOINTS } from '../../styles/constants';
import './ResponsiveContainer.css';

/**
 * ResponsiveContainer Component
 * 
 * A container that responds to viewport changes and optimizes rendering
 * Reduces layout shifts and minimizes repaints by using hardware acceleration
 */
const ResponsiveContainer = ({ 
  children, 
  className = '', 
  breakpoints = {}, 
  minHeight = 0,
  debounceTime = 100,
  preventLayoutShift = true,
  enableHardwareAcceleration = true,
  fallbackWidthPercentage = 90,
  center = true
}) => {
  const containerRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [containerHeight, setContainerHeight] = useState(minHeight);
  const [isResizing, setIsResizing] = useState(false);
  
  // Combine default breakpoints with custom ones
  const combinedBreakpoints = {
    xs: BREAKPOINTS.xs,
    sm: BREAKPOINTS.sm,
    md: BREAKPOINTS.md,
    lg: BREAKPOINTS.lg,
    xl: BREAKPOINTS.xl,
    xxl: BREAKPOINTS.xxl,
    ...breakpoints
  };
  
  // Get current breakpoint based on window width
  const getCurrentBreakpoint = () => {
    const sortedBreakpoints = Object.entries(combinedBreakpoints)
      .sort(([, a], [, b]) => a - b);
    
    for (let i = sortedBreakpoints.length - 1; i >= 0; i--) {
      if (windowWidth >= sortedBreakpoints[i][1]) {
        return sortedBreakpoints[i][0];
      }
    }
    
    return sortedBreakpoints[0][0];
  };
  
  // Calculate container width based on breakpoint
  const getContainerWidth = () => {
    const breakpoint = getCurrentBreakpoint();
    
    switch (breakpoint) {
      case 'xs':
        return `${fallbackWidthPercentage}%`;
      case 'sm':
        return `${Math.min(540, fallbackWidthPercentage)}px`;
      case 'md':
        return `${Math.min(720, fallbackWidthPercentage)}px`;
      case 'lg':
        return `${Math.min(960, fallbackWidthPercentage)}px`;
      case 'xl':
        return `${Math.min(1140, fallbackWidthPercentage)}px`;
      case 'xxl':
        return `${Math.min(1320, fallbackWidthPercentage)}px`;
      default:
        return `${fallbackWidthPercentage}%`;
    }
  };
  
  // Handle window resize
  useEffect(() => {
    const handleResize = debounce(() => {
      setIsResizing(true);
      
      // Update window width immediately
      setWindowWidth(window.innerWidth);
      
      // Measure container height to prevent layout shift
      if (preventLayoutShift && containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight);
      }
      
      // Reset resizing flag after all measurements are complete
      setTimeout(() => {
        setIsResizing(false);
      }, 50);
    }, debounceTime);
    
    window.addEventListener('resize', handleResize);
    
    // Initial height measurement
    if (preventLayoutShift && containerRef.current) {
      setContainerHeight(containerRef.current.offsetHeight);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [debounceTime, preventLayoutShift]);
  
  // Apply different styles based on component state
  const containerStyles = {
    width: getContainerWidth(),
    ...(center ? { margin: '0 auto' } : {}),
    ...(enableHardwareAcceleration ? { 
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
      willChange: isResizing ? 'width' : 'auto'
    } : {}),
    ...(preventLayoutShift && isResizing ? { 
      minHeight: `${containerHeight}px`,
      transition: 'none'
    } : {})
  };
  
  return (
    <div 
      ref={containerRef}
      className={`responsive-container ${className} breakpoint-${getCurrentBreakpoint()}`}
      style={containerStyles}
      data-breakpoint={getCurrentBreakpoint()}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;