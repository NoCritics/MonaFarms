/**
 * Typography Constants
 * 
 * Standardizes font usage across the MonaFarms application
 */

export const FONTS = {
  // Main font families
  primary: "'Press Start 2P', system-ui, -apple-system, sans-serif",  // Pixel-style header font
  secondary: "'Inter', system-ui, -apple-system, sans-serif",         // Clean, readable content font
  monospace: "'JetBrains Mono', monospace",                           // For code and numeric values
  
  // Font weights
  weight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  
  // Font sizes (in rems)
  size: {
    xs: 0.75,      // 12px
    sm: 0.875,     // 14px
    base: 1,       // 16px
    md: 1.125,     // 18px
    lg: 1.25,      // 20px
    xl: 1.5,       // 24px
    xxl: 1.875,    // 30px
    xxxl: 2.25,    // 36px
    jumbo: 3       // 48px
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    loose: 1.8
  },
  
  // Letter spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em'
  }
};

// Font style presets
export const TEXT_STYLES = {
  // Headings
  h1: {
    fontFamily: FONTS.primary,
    fontSize: `${FONTS.size.xxxl}rem`,
    fontWeight: FONTS.weight.bold,
    lineHeight: FONTS.lineHeight.tight,
    letterSpacing: FONTS.letterSpacing.tight
  },
  h2: {
    fontFamily: FONTS.primary,
    fontSize: `${FONTS.size.xxl}rem`,
    fontWeight: FONTS.weight.bold,
    lineHeight: FONTS.lineHeight.tight,
    letterSpacing: FONTS.letterSpacing.tight
  },
  h3: {
    fontFamily: FONTS.primary,
    fontSize: `${FONTS.size.xl}rem`,
    fontWeight: FONTS.weight.bold,
    lineHeight: FONTS.lineHeight.tight,
    letterSpacing: FONTS.letterSpacing.tight
  },
  h4: {
    fontFamily: FONTS.primary,
    fontSize: `${FONTS.size.lg}rem`,
    fontWeight: FONTS.weight.bold,
    lineHeight: FONTS.lineHeight.tight,
    letterSpacing: FONTS.letterSpacing.tight
  },
  
  // Body text
  bodyLarge: {
    fontFamily: FONTS.secondary,
    fontSize: `${FONTS.size.md}rem`,
    fontWeight: FONTS.weight.regular,
    lineHeight: FONTS.lineHeight.normal,
    letterSpacing: FONTS.letterSpacing.normal
  },
  body: {
    fontFamily: FONTS.secondary,
    fontSize: `${FONTS.size.base}rem`,
    fontWeight: FONTS.weight.regular,
    lineHeight: FONTS.lineHeight.normal,
    letterSpacing: FONTS.letterSpacing.normal
  },
  bodySmall: {
    fontFamily: FONTS.secondary,
    fontSize: `${FONTS.size.sm}rem`,
    fontWeight: FONTS.weight.regular,
    lineHeight: FONTS.lineHeight.normal,
    letterSpacing: FONTS.letterSpacing.normal
  },
  
  // Special text
  caption: {
    fontFamily: FONTS.secondary,
    fontSize: `${FONTS.size.xs}rem`,
    fontWeight: FONTS.weight.medium,
    lineHeight: FONTS.lineHeight.tight,
    letterSpacing: FONTS.letterSpacing.wide
  },
  button: {
    fontFamily: FONTS.primary,
    fontSize: `${FONTS.size.sm}rem`,
    fontWeight: FONTS.weight.medium,
    lineHeight: FONTS.lineHeight.tight,
    letterSpacing: FONTS.letterSpacing.wide
  },
  label: {
    fontFamily: FONTS.secondary,
    fontSize: `${FONTS.size.sm}rem`,
    fontWeight: FONTS.weight.medium,
    lineHeight: FONTS.lineHeight.tight,
    letterSpacing: FONTS.letterSpacing.normal
  },
  stats: {
    fontFamily: FONTS.monospace,
    fontSize: `${FONTS.size.base}rem`,
    fontWeight: FONTS.weight.regular,
    lineHeight: FONTS.lineHeight.tight,
    letterSpacing: FONTS.letterSpacing.tight
  }
};
