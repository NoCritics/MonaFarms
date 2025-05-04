/**
 * Layout and Spacing Constants
 * 
 * Standardizes spacing and layout across the MonaFarms application
 */

// Base unit in pixels
const BASE_UNIT = 4;

// Spacing scale in rems (assuming 16px base font size)
export const SPACING = {
  // Core spacing
  xxxs: 0.125,  // 2px - Micro spacing
  xxs: 0.25,    // 4px - Minimal spacing
  xs: 0.5,      // 8px - Extra small spacing
  sm: 0.75,     // 12px - Small spacing
  md: 1,        // 16px - Medium spacing (default)
  lg: 1.5,      // 24px - Large spacing
  xl: 2,        // 32px - Extra large spacing
  xxl: 3,       // 48px - Double extra large spacing
  xxxl: 4,      // 64px - Maximum standard spacing
  
  // Special semantic spacing
  section: 5,   // 80px - Section separations
  page: 6,      // 96px - Page-level spacing
  
  // Convert px value to rem
  pxToRem: (px) => `${px / 16}rem`
};

// Standard border radiuses
export const BORDER_RADIUS = {
  none: 0,
  sm: '0.25rem',    // 4px
  md: '0.5rem',     // 8px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  pill: '9999px',   // Fully rounded
  circle: '50%'     // Perfect circle
};

// Z-index layers
export const Z_INDEX = {
  background: -10,
  default: 0,
  foreground: 10,
  overlay: 100,
  modal: 1000,
  tooltip: 1500,
  notification: 2000
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  xs: 320,   // Extra small devices
  sm: 576,   // Small devices
  md: 768,   // Medium devices
  lg: 992,   // Large devices
  xl: 1200,  // Extra large devices
  xxl: 1440  // Ultra wide devices
};

// Standard container sizes
export const CONTAINERS = {
  sm: '540px',
  md: '720px',
  lg: '960px',
  xl: '1140px',
  xxl: '1320px',
  fluid: '100%'
};

// Shadow styles
export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  
  // Special shadows
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
  glow: '0 0 15px rgba(131, 88, 255, 0.5)',
  goldGlow: '0 0 15px rgba(247, 181, 56, 0.7)'
};

// Grid configuration
export const GRID = {
  columns: 12,
  gutter: {
    xs: SPACING.xs,
    sm: SPACING.sm,
    md: SPACING.md,
    lg: SPACING.lg
  }
};

// Farm tile sizes
export const FARM_TILES = {
  xs: '60px',
  sm: '80px',
  md: '100px',
  lg: '120px',
  xl: '140px',
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px'
  }
};

// Base transitions
export const TRANSITIONS = {
  default: 'all 0.3s ease',
  fast: 'all 0.15s ease',
  slow: 'all 0.5s ease'
};
