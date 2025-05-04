/**
 * Constants Index
 * 
 * Exports all design system constants for easy importing
 */

export * from './animations';
export * from './colors';
export * from './typography';
export * from './layout';

// Export common combinations for convenience
export const theme = {
  colors: require('./colors'),
  animations: require('./animations'),
  typography: require('./typography'),
  layout: require('./layout')
};

export default theme;
