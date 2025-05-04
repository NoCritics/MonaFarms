import React from 'react';

// Tomato plant with growth stages
export const TomatoPlant = ({ stage = 0, size = 30 }) => {
  // Stage: 0-not planted, 1-seedling, 2-growing, 3-mature
  const stages = [
    // Empty (stage 0)
    null,
    
    // Seedling (stage 1)
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 30C20 30 20 15 20 12" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 16C16 16 18 14 20 14C22 14 24 16 24 16" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M17 20C17 20 18.5 18.5 20 19C21.5 19.5 22.5 21 22.5 21" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
    </svg>,
    
    // Growing (stage 2)
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 32C20 32 20 12 20 8" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 14C14 14 17 10 20 10C23 10 26 14 26 14" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M15 20C15 20 17.5 16.5 20 17C22.5 17.5 24.5 21 24.5 21" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 26C16 26 18 23 20 23C22 23 24 26 24 26" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
    </svg>,
    
    // Mature with tomatoes (stage 3)
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 34C20 34 20 10 20 6" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 12C12 12 16 8 20 8C24 8 28 12 28 12" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 18C14 18 17 14 20 14C23 14 26 18 26 18" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 24C16 24 18 20 20 20C22 20 24 24 24 24" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="17" cy="17" r="3" fill="#E53935"/>
      <circle cx="24" cy="22" r="3" fill="#E53935"/>
      <circle cx="15" cy="27" r="3" fill="#E53935"/>
    </svg>
  ];
  
  return stages[stage] || null;
};

// Potato plant with growth stages
export const PotatoPlant = ({ stage = 0, size = 30 }) => {
  // Stage: 0-not planted, 1-seedling, 2-growing, 3-mature
  const stages = [
    // Empty (stage 0)
    null,
    
    // Seedling (stage 1)
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 30C20 30 20 22 20 20" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 23C16 23 18 20 20 20C22 20 24 23 24 23" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M18 26C18 26 19 24 20 24C21 24 22 26 22 26" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
    </svg>,
    
    // Growing (stage 2)
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 32C16 32 16 24 16 22" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M24 32C24 32 24 24 24 22" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 32C20 32 20 20 20 18" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 25C12 25 14 22 16 22C18 22 20 25 20 25" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 25C20 25 22 22 24 22C26 22 28 25 28 25" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 29C14 29 15 27 16 27C17 27 18 29 18 29" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M22 29C22 29 23 27 24 27C25 27 26 29 26 29" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
    </svg>,
    
    // Mature potato plant (stage 3)
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 34C15 34 15 22 15 20" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 34C20 34 20 18 20 16" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M25 34C25 34 25 22 25 20" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 23C10 23 13 20 15 20C17 20 20 23 20 23" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 23C20 23 23 20 25 20C27 20 30 23 30 23" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 28C12 28 14 26 15 26C16 26 18 28 18 28" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M22 28C22 28 24 26 25 26C26 26 28 28 28 28" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="15" cy="34" r="3" fill="#C68D59"/>
      <circle cx="25" cy="34" r="3" fill="#C68D59"/>
      <circle cx="20" cy="34" r="3" fill="#C68D59"/>
    </svg>
  ];
  
  return stages[stage] || null;
};

// Strawberry plant with growth stages
export const StrawberryPlant = ({ stage = 0, size = 30 }) => {
  // Stage: 0-not planted, 1-seedling, 2-growing, 3-mature
  const stages = [
    // Empty (stage 0)
    null,
    
    // Seedling (stage 1)
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 30C20 30 20 20 20 18" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M17 20C17 20 18.5 18 20 18C21.5 18 23 20 23 20" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 24C16 24 18 22 20 22C22 22 24 24 24 24" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
    </svg>,
    
    // Growing (stage 2)
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 32C20 32 20 18 20 16" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M15 18C15 18 17.5 16 20 16C22.5 16 25 18 25 18" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 22C14 22 17 20 20 20C23 20 26 22 26 22" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M15 26C15 26 17.5 24 20 24C22.5 24 25 26 25 26" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="20" cy="28" r="2" fill="#4CAF50"/>
    </svg>,
    
    // Mature with strawberries (stage 3)
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 34C20 34 20 16 20 14" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 16C14 16 17 14 20 14C23 14 26 16 26 16" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M13 20C13 20 16.5 18 20 18C23.5 18 27 20 27 20" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 24C14 24 17 22 20 22C23 22 26 24 26 24" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M15 28C15 28 17.5 26 20 26C22.5 26 25 28 25 28" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 32C16 32 18 30 20 30C22 30 24 32 24 32" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
      <path d="M17 24L17.5 23.5M22.5 23.5L23 24" stroke="#fff" strokeWidth="0.5"/>
      <path d="M17 31L17.5 30.5M22.5 30.5L23 31" stroke="#fff" strokeWidth="0.5"/>
      <ellipse cx="15" cy="27" rx="2.5" ry="3" fill="#E91E63"/>
      <ellipse cx="25" cy="27" rx="2.5" ry="3" fill="#E91E63"/>
      <ellipse cx="20" cy="33" rx="2.5" ry="3" fill="#E91E63"/>
    </svg>
  ];
  
  return stages[stage] || null;
};

// Water bucket icon
export const WaterBucket = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 10V16C7 17.1046 7.89543 18 9 18H15C16.1046 18 17 17.1046 17 16V10H7Z" fill="#7086D5"/>
    <path d="M7 8H17M7 8C5.89543 8 5 8.89543 5 10V16C5 18.2091 6.79086 20 9 20H15C17.2091 20 19 18.2091 19 16V10C19 8.89543 18.1046 8 17 8M7 8V6C7 4.89543 7.89543 4 9 4H15C16.1046 4 17 4.89543 17 6V8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 12H14" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 15H14" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Fertilizer icon
export const Fertilizer = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="6" width="14" height="14" rx="2" fill="#9C6B4D"/>
    <path d="M8 6V4H16V6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    <path d="M7 10H17" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    <path d="M7 14H17" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    <path d="M7 18H17" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="9" cy="8" r="1" fill="#fff"/>
    <circle cx="15" cy="8" r="1" fill="#fff"/>
    <circle cx="9" cy="12" r="1" fill="#fff"/>
    <circle cx="15" cy="12" r="1" fill="#fff"/>
    <circle cx="9" cy="16" r="1" fill="#fff"/>
    <circle cx="15" cy="16" r="1" fill="#fff"/>
  </svg>
);

// Seed packet icon
export const SeedPacket = ({ cropType = 0, size = 24 }) => {
  const colors = ['#C68D59', '#E53935', '#E91E63']; // potato, tomato, strawberry
  const color = colors[cropType] || colors[0];
  
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 6L8 4H16L19 6V20H5V6Z" fill={color} />
      <path d="M5 6L8 4H16L19 6V20H5V6Z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M5 6H19" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 10C12 10 10 12 10 14C10 16 11 17 12 17C13 17 14 16 14 14C14 12 12 10 12 10Z" fill="#4CAF50" stroke="#fff" strokeWidth="1"/>
      <path d="M12 8V10" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
};

// Tile/plot icon
export const TilePlot = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="1" fill="#6B4226"/>
    <rect x="3" y="3" width="18" height="18" rx="1" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M3 8H21" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
    <path d="M3 13H21" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
    <path d="M3 18H21" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
    <path d="M8 3V21" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
    <path d="M13 3V21" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
    <path d="M18 3V21" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

// Crops Token icon
export const CropsToken = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" fill="#F7B538"/>
    <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="1.5"/>
    <path d="M8 12.5C8 10.0147 9.79086 8 12 8C14.2091 8 16 10.0147 16 12.5C16 14.9853 14.2091 17 12 17" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 17C9.79086 17 8 14.9853 8 12.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 12.5H16" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Faucet icon
export const Faucet = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 10H19V14C19 15.1046 18.1046 16 17 16H7C5.89543 16 5 15.1046 5 14V10Z" fill="#7086D5"/>
    <path d="M5 10H19V14C19 15.1046 18.1046 16 17 16H7C5.89543 16 5 15.1046 5 14V10Z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M7 10V6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 6V3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M17 10V6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 16V20" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="21" r="1" fill="#7086D5" stroke="#fff"/>
  </svg>
);

// Empty plot icon
export const EmptyPlot = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="25" width="30" height="10" rx="1" fill="#6B4226"/>
    <path d="M10 25V20M15 25V22M20 25V18M25 25V22M30 25V20" stroke="#6B4226" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2"/>
  </svg>
);

// Planted plot (just soil with seed)
export const PlantedPlot = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="25" width="30" height="10" rx="1" fill="#6B4226"/>
    <circle cx="20" cy="25" r="2" fill="#964B00"/>
    <path d="M19 25H21" stroke="#fff" strokeWidth="0.5" strokeLinecap="round"/>
  </svg>
);

// Watered plot
export const WateredPlot = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="25" width="30" height="10" rx="1" fill="#8B5A3C"/>
    <ellipse cx="14" cy="29" rx="2" ry="1" fill="#6B4226" fillOpacity="0.5"/>
    <ellipse cx="22" cy="27" rx="3" ry="1" fill="#6B4226" fillOpacity="0.5"/>
    <ellipse cx="26" cy="30" rx="2" ry="1" fill="#6B4226" fillOpacity="0.5"/>
  </svg>
);

// Trophy icon for leaderboard
export const Trophy = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 21H16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 17V21" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    <path d="M7 6H4V8C4 9.65685 5.34315 11 7 11V6Z" fill="#F7B538"/>
    <path d="M17 6H20V8C20 9.65685 18.6569 11 17 11V6Z" fill="#F7B538"/>
    <path d="M7 4H17V12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12V4Z" fill="#F7B538"/>
    <path d="M7 4H17V12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12V4Z" stroke="#fff" strokeWidth="1.5"/>
    <path d="M7 6H4V8C4 9.65685 5.34315 11 7 11V6Z" stroke="#fff" strokeWidth="1.5"/>
    <path d="M17 6H20V8C20 9.65685 18.6569 11 17 11V6Z" stroke="#fff" strokeWidth="1.5"/>
  </svg>
);
