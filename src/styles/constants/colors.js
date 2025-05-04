/**
 * Color Palette Constants
 * 
 * Standardizes colors across the MonaFarms application for consistent visual identity
 * Inspired by Monad's purple gradient aesthetic
 */

export const COLORS = {
  // Primary colors
  primary: {
    darkest: '#131022',     // Darkest background
    dark: '#1E1633',        // Dark background
    main: '#3A2E5C',        // Main background
    light: '#523D7F',       // Container backgrounds
    lightest: '#6F59A3'     // Lighter accents
  },
  
  // Accent colors
  accent: {
    main: '#8358FF',        // Primary accent/brand color
    light: '#9F81FC',       // Lighter version for hover states
    dark: '#6A45D9',        // Darker version for active states
    ultraLight: '#D4CAFF'   // Very light version for backgrounds
  },
  
  // Highlight/action colors
  highlight: {
    gold: '#F7B538',        // Gold highlight for important actions
    green: '#4ADE80',       // Success color
    red: '#EF4444',         // Error/danger color
    orange: '#F97316',      // Warning color
    blue: '#3B82F6'         // Info color
  },
  
  // Text colors
  text: {
    primary: '#FFFFFF',     // Primary text on dark backgrounds
    secondary: '#B4A7D6',   // Secondary text
    tertiary: '#8F8BA8',    // Less important text
    inverse: '#1E1633'      // Text on light backgrounds
  },
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #3A2E5C 0%, #523D7F 100%)',
    accent: 'linear-gradient(135deg, #6A45D9 0%, #8358FF 100%)',
    highlight: 'linear-gradient(135deg, #F7B538 0%, #F59E0B 100%)',
    card: 'linear-gradient(160deg, rgba(82, 61, 127, 0.6) 0%, rgba(58, 46, 92, 0.6) 100%)',
    darkOverlay: 'linear-gradient(0deg, rgba(19, 16, 34, 0.8) 0%, rgba(19, 16, 34, 0.4) 100%)'
  },
  
  // Special purpose
  special: {
    overlay: 'rgba(19, 16, 34, 0.7)',
    cardBg: 'rgba(30, 22, 51, 0.7)',
    glassBg: 'rgba(30, 22, 51, 0.3)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    glow: 'rgba(131, 88, 255, 0.6)'
  }
};

// Day/Night cycle colors
export const TIME_OF_DAY = {
  dawn: {
    sky: '#614B94',
    accent: '#FF9E6C',
    shadow: 'rgba(30, 22, 51, 0.6)'
  },
  day: {
    sky: '#7E74B0',
    accent: '#FFFFFF',
    shadow: 'rgba(19, 16, 34, 0.4)'
  },
  dusk: {
    sky: '#4A3578',
    accent: '#FF7373',
    shadow: 'rgba(19, 16, 34, 0.7)'
  },
  night: {
    sky: '#1E1633',
    accent: '#8F8BA8',
    shadow: 'rgba(0, 0, 0, 0.8)'
  }
};

// Crop type related colors
export const CROP_COLORS = {
  potato: {
    primary: '#B58969',
    secondary: '#8C6D53',
    accent: '#E5DBC5'
  },
  tomato: {
    primary: '#E74C3C',
    secondary: '#C0392B',
    accent: '#F3C1BB'
  },
  strawberry: {
    primary: '#E74C7B',
    secondary: '#C0392B',
    accent: '#F5CAD3'
  }
};

// Badge and achievement colors
export const BADGE_COLORS = {
  bronze: {
    primary: '#CD7F32',
    secondary: '#A45E23',
    glow: 'rgba(205, 127, 50, 0.6)'
  },
  silver: {
    primary: '#C0C0C0',
    secondary: '#919191',
    glow: 'rgba(192, 192, 192, 0.6)'
  },
  gold: {
    primary: '#FFD700',
    secondary: '#FFC000',
    glow: 'rgba(255, 215, 0, 0.8)'
  },
  platinum: {
    primary: '#E5E4E2',
    secondary: '#A9A8A6',
    glow: 'rgba(229, 228, 226, 0.8)'
  },
  diamond: {
    primary: '#B9F2FF',
    secondary: '#85D6EA',
    glow: 'rgba(185, 242, 255, 0.8)'
  }
};
