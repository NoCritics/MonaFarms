# MonaFarms Design System

## Overview

This document outlines the comprehensive design system for MonaFarms, a blockchain-based farming simulation game built on the Monad testnet. The design system provides a consistent framework for visual elements, interactions, and code patterns.

## Table of Contents

1. [Colors](#colors)
2. [Typography](#typography)
3. [Spacing and Layout](#spacing-and-layout)
4. [Animations and Timing](#animations-and-timing)
5. [Components](#components)
6. [Effects and Visual Elements](#effects-and-visual-elements)
7. [Responsive Design](#responsive-design)
8. [Performance Optimizations](#performance-optimizations)
9. [Accessibility Guidelines](#accessibility-guidelines)

## Colors

### Primary Colors

The primary color palette is inspired by Monad's purple gradient aesthetic:

- **Primary Dark:** `#131022` - Darkest background
- **Primary:** `#1E1633` - Dark background
- **Primary Medium:** `#3A2E5C` - Main background
- **Primary Light:** `#523D7F` - Container backgrounds
- **Primary Lightest:** `#6F59A3` - Lighter accents

### Accent Colors

- **Accent Main:** `#8358FF` - Primary accent/brand color
- **Accent Light:** `#9F81FC` - Lighter version for hover states
- **Accent Dark:** `#6A45D9` - Darker version for active states
- **Accent Ultra-light:** `#D4CAFF` - Very light version for backgrounds

### Highlight Colors

- **Gold:** `#F7B538` - Highlight for important actions
- **Green:** `#4ADE80` - Success color
- **Red:** `#EF4444` - Error/danger color
- **Orange:** `#F97316` - Warning color
- **Blue:** `#3B82F6` - Info color

### Text Colors

- **Text Primary:** `#FFFFFF` - Primary text on dark backgrounds
- **Text Secondary:** `#B4A7D6` - Secondary text
- **Text Tertiary:** `#8F8BA8` - Less important text
- **Text Inverse:** `#1E1633` - Text on light backgrounds

### Gradients

- **Primary Gradient:** `linear-gradient(135deg, #3A2E5C 0%, #523D7F 100%)`
- **Accent Gradient:** `linear-gradient(135deg, #6A45D9 0%, #8358FF 100%)`
- **Highlight Gradient:** `linear-gradient(135deg, #F7B538 0%, #F59E0B 100%)`
- **Card Gradient:** `linear-gradient(160deg, rgba(82, 61, 127, 0.6) 0%, rgba(58, 46, 92, 0.6) 100%)`

### Special Purpose Colors

- **Overlay:** `rgba(19, 16, 34, 0.7)`
- **Card Background:** `rgba(30, 22, 51, 0.7)`
- **Glass Background:** `rgba(30, 22, 51, 0.3)`
- **Shadow:** `rgba(0, 0, 0, 0.3)`
- **Glow:** `rgba(131, 88, 255, 0.6)`

## Typography

### Font Families

- **Primary Font:** `'Press Start 2P', system-ui, -apple-system, sans-serif` - Pixel-style font for headers and game-themed elements
- **Secondary Font:** `'Inter', system-ui, -apple-system, sans-serif` - Clean, readable font for content
- **Monospace Font:** `'JetBrains Mono', monospace` - For code and numeric values

### Font Weights

- Light: `300`
- Regular: `400`
- Medium: `500`
- Semi-bold: `600`
- Bold: `700`

### Font Sizes (in rems)

- Extra Small: `0.75rem` (12px)
- Small: `0.875rem` (14px)
- Base: `1rem` (16px)
- Medium: `1.125rem` (18px)
- Large: `1.25rem` (20px)
- Extra Large: `1.5rem` (24px)
- Double Extra Large: `1.875rem` (30px)
- Triple Extra Large: `2.25rem` (36px)
- Jumbo: `3rem` (48px)

### Line Heights

- Tight: `1.2`
- Normal: `1.5`
- Loose: `1.8`

### Text Styles

Predefined text styles for consistent typography:

- Headers (h1-h4)
- Body text (large, regular, small)
- Caption
- Button text
- Labels
- Statistics

## Spacing and Layout

### Spacing Scale (in rems)

- 3XS: `0.125rem` (2px)
- 2XS: `0.25rem` (4px)
- XS: `0.5rem` (8px)
- SM: `0.75rem` (12px)
- MD: `1rem` (16px)
- LG: `1.5rem` (24px)
- XL: `2rem` (32px)
- 2XL: `3rem` (48px)
- 3XL: `4rem` (64px)
- Section: `5rem` (80px)
- Page: `6rem` (96px)

### Border Radius

- None: `0`
- Small: `0.25rem` (4px)
- Medium: `0.5rem` (8px)
- Large: `1rem` (16px)
- Extra Large: `1.5rem` (24px)
- Pill: `9999px`
- Circle: `50%`

### Z-Index Layers

- Background: `-10`
- Default: `0`
- Foreground: `10`
- Overlay: `100`
- Modal: `1000`
- Tooltip: `1500`
- Notification: `2000`

### Breakpoints

- XS: `320px` (Extra small devices)
- SM: `576px` (Small devices)
- MD: `768px` (Medium devices)
- LG: `992px` (Large devices)
- XL: `1200px` (Extra large devices)
- 2XL: `1440px` (Ultra wide devices)

### Container Sizes

- Small: `540px`
- Medium: `720px`
- Large: `960px`
- Extra Large: `1140px`
- Double Extra Large: `1320px`
- Fluid: `100%`

### Shadows

- None: `none`
- Small: `0 1px 2px rgba(0, 0, 0, 0.1)`
- Medium: `0 4px 6px rgba(0, 0, 0, 0.1)`
- Large: `0 10px 15px rgba(0, 0, 0, 0.1)`
- Extra Large: `0 20px 25px rgba(0, 0, 0, 0.15)`
- Inner: `inset 0 2px 4px rgba(0, 0, 0, 0.1)`
- Glow: `0 0 15px rgba(131, 88, 255, 0.5)`
- Gold Glow: `0 0 15px rgba(247, 181, 56, 0.7)`

## Animations and Timing

### Duration (in milliseconds)

- Ultra Fast: `150ms` - For micro-interactions
- Fast: `300ms` - For small UI changes
- Medium: `500ms` - For standard transitions
- Slow: `800ms` - For emphasis
- Ultra Slow: `1200ms` - For dramatic effect

### Easing Functions

- Linear: `linear`
- Ease In: `cubic-bezier(0.4, 0, 1, 1)`
- Ease Out: `cubic-bezier(0, 0, 0.2, 1)`
- Ease In Out: `cubic-bezier(0.4, 0, 0.2, 1)`
- Bounce Out: `cubic-bezier(0.34, 1.56, 0.64, 1)`
- Spring Back: `cubic-bezier(0.16, 1.36, 0.5, 1)`
- Gentle Decelerate: `cubic-bezier(0, 0.55, 0.45, 1)`

### Stagger Delays

- Quick: `50ms`
- Normal: `100ms`
- Slow: `200ms`

### Animation Presets

- Fade In
- Fade Out
- Slide In Up
- Pop In
- Farming Action
- Day/Night Transition

## Components

### Core UI Components

- **Buttons:** Standard, Primary, Secondary, Success, Danger, Ghost
- **Cards:** Standard, Gradient, Highlighted, Interactive
- **Input Fields:** Text, Number, Select, Checkbox, Radio, Toggle
- **Loaders:** Spinner, Skeleton, Progress Bar
- **Tooltips:** Information, Warning, Error
- **Notifications:** Toast, Alert, Modal
- **Navigation:** Tabs, Sidebar, Navbar
- **Farm Grid:** Tiles, Plants, Growth Stages

### Specialized Components

- **ResponsiveContainer:** Layout container with breakpoint handling
- **SkeletonLoader:** Placeholder loading state
- **EnhancedLoadingScreen:** Animated loading screen with farm scene
- **OnboardingTutorial:** Step-by-step user guide
- **WeatherEffects:** Dynamic weather visualization
- **SeasonalEffects:** Seasonal visual changes

## Effects and Visual Elements

### Weather Effects

- **Clear:** Subtle sun rays and gentle wind effects
- **Rain:** Animated raindrops with darkened overlay
- **Cloudy:** Floating cloud particles with moderate dimming
- **Foggy:** Blurred background with fog particles

### Seasonal Effects

- **Spring:** Fresh green overlay with petals and pollen particles
- **Summer:** Warm overlay with butterflies and dandelion seeds
- **Fall:** Orange/red overlay with falling leaves in various colors
- **Winter:** Cool blue overlay with snowflakes

### Day/Night Cycle

- **Dawn:** Purple-pink sky with soft lighting
- **Day:** Bright blue sky with full lighting
- **Dusk:** Orange-purple sky with warm lighting
- **Night:** Dark purple sky with reduced lighting

### Growth Animations

- Planting: Seed dropping into ground
- Watering: Droplets falling with particle effects
- Growth: Progressive size changes
- Harvesting: Bouncing collection effect
- Fertilizing: Sparkle overlay

## Responsive Design

### Mobile First Approach

- Default styles target mobile devices
- Media queries expand functionality for larger screens
- Touch-friendly elements with appropriate sizes
- Simplified layouts for small screens

### Layout Patterns

- Single column on mobile
- Two columns on tablet
- Three or more columns on desktop
- Farm grid adapts tile size based on screen width

### Component Adaptations

- Sidebar collapses to bottom bar on mobile
- Tab navigation becomes scrollable on small screens
- Farm controls reposition for touch interfaces
- Modal sizing adjusts to viewport

## Performance Optimizations

### Progressive Loading

- Critical resources load first
- Non-essential assets load after app is interactive
- Images and assets load based on viewport visibility
- Animation complexity reduces on low-end devices

### Hardware Acceleration

- Transform and opacity for animations
- Will-change property for animating elements
- Backface-visibility: hidden where appropriate
- Reduced motion for users who prefer it

### Code Optimization

- Debounced window resize handling
- Throttled scroll events
- Memoized expensive calculations
- Lazy-loaded non-critical components

### Resource Management

- WebP image format with fallbacks
- SVG for game icons and UI elements
- Efficient canvas usage for complex animations
- Memory-conscious data structures

## Accessibility Guidelines

### Color Contrast

- All text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Interactive elements have sufficient contrast
- Color is not the only indicator of state or information

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Focus states are clearly visible
- Logical tab order throughout the application
- Shortcut keys for common actions

### Screen Reader Support

- Semantic HTML elements
- ARIA attributes where appropriate
- Alt text for all images
- Notifications announced to screen readers

### Reduced Motion

- Respects prefers-reduced-motion setting
- Alternative static representations for animations
- No flashing content that could trigger seizures
- Simplified transitions for accessibility needs
