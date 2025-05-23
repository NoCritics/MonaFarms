import React from 'react';

// Import images from the art folder
import potatoImage from '../art/Potato.jpg';
import tomatoImage from '../art/Tomato.jpg';
import strawberryImage from '../art/strawberry.jpg';
import waterBucketImage from '../art/water bucket.png';
import fertilizerImage from '../art/Fertilizer.jpg';
import cropsTokenImage from '../art/Crops token.png';
import cornImage from '../art/Corn.jpg';
import carrotImage from '../art/Carrot.jpg';
import pumpkinImage from '../art/Pumpkin.jpg';
import wheatImage from '../art/Wheat.jpg';
import watermelonImage from '../art/Watermelon.jpg';
import cactusImage from '../art/Cactus.jpg';
import goldenSeedsImage from '../art/golden seeds.jpg';
import crystalBerriesImage from '../art/Crystal Berries.jpg';
import moonflowerImage from '../art/Moonflower.jpg';
import ancientGrainImage from '../art/Ancient Grain.jpg';
import rainbowFruitImage from '../art/Rainbow Fruit.jpg';

// Image container component for consistent styling
const ImageContainer = ({ src, alt, size = 24, className = '', style = {} }) => {
  return (
    <div 
      className={`item-image-container ${className}`} 
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        ...style 
      }}
    >
      <img 
        src={src} 
        alt={alt} 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          borderRadius: '50%'
        }}
        onError={(e) => {
          // If image fails to load, show a colored background with first letter
          e.target.style.display = 'none';
          const container = e.target.parentElement;
          if (container) {
            container.style.backgroundColor = getRandomColor(alt);
            container.style.color = '#fff';
            container.style.display = 'flex';
            container.style.alignItems = 'center';
            container.style.justifyContent = 'center';
            container.style.fontSize = `${size/2}px`;
            container.style.fontWeight = 'bold';
            container.textContent = alt.charAt(0).toUpperCase();
          }
        }}
      />
    </div>
  );
};

// Helper function to generate a consistent color based on the item name
const getRandomColor = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 40%)`;
};

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

// Water bucket icon - UPDATED to use real image
export const WaterBucket = ({ size = 24, className = '', style = {} }) => (
  <ImageContainer 
    src={waterBucketImage} 
    alt="Water Bucket" 
    size={size}
    className={className}
    style={style}
  />
);

// Fertilizer icon - UPDATED to use real image
export const Fertilizer = ({ size = 24, className = '', style = {} }) => (
  <ImageContainer 
    src={fertilizerImage} 
    alt="Fertilizer" 
    size={size}
    className={className}
    style={style}
  />
);

// Seed packet icon - UPDATED to use real images
export const SeedPacket = ({ cropType = 0, size = 24, className = '', style = {} }) => {
  // Map crop types to their images
  const cropImages = [
    potatoImage,    // 0 = Potato
    tomatoImage,    // 1 = Tomato
    strawberryImage, // 2 = Strawberry
    cornImage,      // 3 = Corn
    carrotImage,    // 4 = Carrot
    pumpkinImage,   // 5 = Pumpkin
    wheatImage,     // 6 = Wheat
    watermelonImage, // 7 = Watermelon
    cactusImage,    // 8 = Cactus
    goldenSeedsImage, // 9 = Golden Seeds
    crystalBerriesImage, // 10 = Crystal Berries
    moonflowerImage, // 11 = Moonflower
    ancientGrainImage, // 12 = Ancient Grain
    rainbowFruitImage // 13 = Rainbow Fruit
  ];

  // Get the correct image or default to potato if invalid type
  const imgSrc = cropImages[cropType] || potatoImage;
  const cropNames = ['Potato', 'Tomato', 'Strawberry', 'Corn', 'Carrot', 'Pumpkin', 'Wheat', 
                   'Watermelon', 'Cactus', 'Golden Seeds', 'Crystal Berries', 'Moonflower',
                   'Ancient Grain', 'Rainbow Fruit'];
  const altText = `${cropNames[cropType] || 'Unknown'} Seeds`;
  
  return (
    <ImageContainer 
      src={imgSrc} 
      alt={altText} 
      size={size}
      className={`seed-packet ${className}`}
      style={{
        border: '1px solid rgba(255, 255, 255, 0.2)',
        ...style
      }}
    />
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

// Crops Token icon - UPDATED to use real image
export const CropsToken = ({ size = 24, className = '', style = {} }) => (
  <ImageContainer 
    src={cropsTokenImage} 
    alt="CROPS Token" 
    size={size}
    className={className}
    style={style}
  />
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

// Corn plant (placeholder using variation of existing plants)
export const CornPlant = ({ stage = 0, size = 30 }) => {
  return PotatoPlant({ stage, size }); // Using potato plant as fallback for now
};

// Carrot plant (placeholder using variation of existing plants)
export const CarrotPlant = ({ stage = 0, size = 30 }) => {
  return StrawberryPlant({ stage, size }); // Using strawberry plant as fallback for now
};

// Pumpkin plant (placeholder using variation of existing plants)
export const PumpkinPlant = ({ stage = 0, size = 30 }) => {
  return TomatoPlant({ stage, size }); // Using tomato plant as fallback for now
};

// Wheat plant (placeholder using variation of existing plants)
export const WheatPlant = ({ stage = 0, size = 30 }) => {
  return PotatoPlant({ stage, size }); // Using potato plant as fallback for now
};

// Watermelon plant (placeholder using variation of existing plants)
export const WatermelonPlant = ({ stage = 0, size = 30 }) => {
  return TomatoPlant({ stage, size }); // Using tomato plant as fallback for now
};

// Cactus plant (placeholder using variation of existing plants)
export const CactusPlant = ({ stage = 0, size = 30 }) => {
  return StrawberryPlant({ stage, size }); // Using strawberry plant as fallback for now
};

// Golden plant (placeholder using variation of existing plants)
export const GoldenPlant = ({ stage = 0, size = 30 }) => {
  return PotatoPlant({ stage, size }); // Using potato plant as fallback for now
};

// Crystal Berries plant (placeholder using variation of existing plants)
export const CrystalBerriesPlant = ({ stage = 0, size = 30 }) => {
  return StrawberryPlant({ stage, size }); // Using strawberry plant as fallback for now
};

// Moonflowers plant (placeholder using variation of existing plants)
export const MoonflowersPlant = ({ stage = 0, size = 30 }) => {
  return TomatoPlant({ stage, size }); // Using tomato plant as fallback for now
};

// Ancient Grain plant (placeholder using variation of existing plants)
export const AncientGrainPlant = ({ stage = 0, size = 30 }) => {
  return PotatoPlant({ stage, size }); // Using potato plant as fallback for now
};

// Rainbow Fruit plant (placeholder using variation of existing plants)
export const RainbowFruitPlant = ({ stage = 0, size = 30 }) => {
  return StrawberryPlant({ stage, size }); // Using strawberry plant as fallback for now
};
