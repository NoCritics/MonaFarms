import React from 'react';

// Import all the images from the art folder
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
import woodImage from '../art/Wood.jpg';
import fabricImage from '../art/Fabric.jpg';
import essenceExtractorImage from '../art/Essence Extractor.jpg';
import moonleafImage from '../art/Moonleaf.jpg';
import goldDustImage from '../art/Gold Dust.jpg';
import rainbowShardImage from '../art/Rainbow Shard.jpg';
import crystalEssenceImage from '../art/crrystal essence.jpg';
import timeCrystalImage from '../art/Time Crystal.jpg';
import rainCatcherImage from '../art/Rain-Catcher.jpg';
import growthLampImage from '../art/Growth Lamp.jpg';
import ancientAppleImage from '../art/Ancient Apple.jpg';
import lunarHarvesterImage from '../art/Lunar Harvester.jpg';
import monadiumSickleImage from '../art/Monadium Sickle.jpg';
import monadiumHoeImage from '../art/Monadium Hoe.jpg';
import rainbowCoreImage from '../art/Rainbow Core.jpg';
import ancientAppleSeedsImage from '../art/Ancient Apple Seeds.jpg';
import fertileMeshImage from '../art/Fertile mesh.jpg';

// Container component for consistent styling of all item images with error handling
export const ItemImageContainer = ({ src, alt, size = 24, className = '', style = {} }) => {
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

// Export individual item components
export const CropsToken = ({ size = 24, className = '', style = {} }) => (
  <ItemImageContainer 
    src={cropsTokenImage} 
    alt="CROPS Token" 
    size={size}
    className={className}
    style={style}
  />
);

export const WaterBucket = ({ size = 24, className = '', style = {} }) => (
  <ItemImageContainer 
    src={waterBucketImage} 
    alt="Water Bucket" 
    size={size}
    className={className}
    style={style}
  />
);

export const Fertilizer = ({ size = 24, className = '', style = {} }) => (
  <ItemImageContainer 
    src={fertilizerImage} 
    alt="Fertilizer" 
    size={size}
    className={className}
    style={style}
  />
);

// Seed packet component with different crop images based on type
export const SeedPacket = ({ cropType = 0, size = 24, className = '', style = {} }) => {
  // Map crop types to their images
  const cropImages = [
    potatoImage,  // 0 = Potato
    tomatoImage,  // 1 = Tomato
    strawberryImage,  // 2 = Strawberry
    cornImage,  // 3 = Corn
    carrotImage,  // 4 = Carrot
    pumpkinImage,  // 5 = Pumpkin
    wheatImage,  // 6 = Wheat
    watermelonImage,  // 7 = Watermelon
    cactusImage,  // 8 = Cactus
    goldenSeedsImage,  // 9 = Golden Seeds
    crystalBerriesImage,  // 10 = Crystal Berries
    moonflowerImage,  // 11 = Moonflower
    ancientGrainImage,  // 12 = Ancient Grain
    rainbowFruitImage,  // 13 = Rainbow Fruit
  ];
  
  // Get the correct image or default to potato if invalid type
  const imgSrc = cropImages[cropType] || potatoImage;
  const cropNames = ['Potato', 'Tomato', 'Strawberry', 'Corn', 'Carrot', 'Pumpkin', 'Wheat', 
                     'Watermelon', 'Cactus', 'Golden Seeds', 'Crystal Berries', 'Moonflower',
                     'Ancient Grain', 'Rainbow Fruit'];
  const altText = `${cropNames[cropType] || 'Unknown'} Seeds`;
  
  return (
    <ItemImageContainer 
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

// Export mapping for plant images by type
export const PlantImages = {
  0: potatoImage,
  1: tomatoImage,
  2: strawberryImage,
  3: cornImage,
  4: carrotImage,
  5: pumpkinImage,
  6: wheatImage,
  7: watermelonImage,
  8: cactusImage,
  9: goldenSeedsImage,
  10: crystalBerriesImage,
  11: moonflowerImage,
  12: ancientGrainImage,
  13: rainbowFruitImage
};

// Plant component factory
const createPlantComponent = (cropImage, { size = 30, stage = 0, className = '', style = {} }) => {
  if (stage === 0) return null; // Empty stage
  
  // Calculate the visible portion based on growth stage
  let visiblePercent;
  if (stage === 1) visiblePercent = 33; // Seedling
  else if (stage === 2) visiblePercent = 66; // Growing
  else visiblePercent = 100; // Mature
  
  return (
    <div 
      className={`plant-container ${className}`} 
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        position: 'relative',
        overflow: 'hidden',
        ...style 
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${cropImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          clipPath: `inset(${100 - visiblePercent}% 0 0 0)`,
        }}
      />
    </div>
  );
};

// Define plant components
export const PotatoPlant = (props) => createPlantComponent(PlantImages[0], props);
export const TomatoPlant = (props) => createPlantComponent(PlantImages[1], props);
export const StrawberryPlant = (props) => createPlantComponent(PlantImages[2], props);
export const CornPlant = (props) => createPlantComponent(PlantImages[3], props);
export const CarrotPlant = (props) => createPlantComponent(PlantImages[4], props);
export const PumpkinPlant = (props) => createPlantComponent(PlantImages[5], props);
export const WheatPlant = (props) => createPlantComponent(PlantImages[6], props);
export const WatermelonPlant = (props) => createPlantComponent(PlantImages[7], props);
export const CactusPlant = (props) => createPlantComponent(PlantImages[8], props);
export const GoldenPlant = (props) => createPlantComponent(PlantImages[9], props);
export const CrystalBerriesPlant = (props) => createPlantComponent(PlantImages[10], props);
export const MoonflowersPlant = (props) => createPlantComponent(PlantImages[11], props);
export const AncientGrainPlant = (props) => createPlantComponent(PlantImages[12], props);
export const RainbowFruitPlant = (props) => createPlantComponent(PlantImages[13], props);

// Special SVG-based components that don't have direct image assets
export const TilePlot = ({ size = 24, className = '', style = {} }) => (
  <div 
    className={`item-image-container ${className}`} 
    style={{ 
      width: `${size}px`, 
      height: `${size}px`, 
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#6B4226',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
      ...style 
    }}
  >
    <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="1" fill="#6B4226"/>
      <rect x="3" y="3" width="18" height="18" rx="1" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M3 8H21" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
      <path d="M3 13H21" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
      <path d="M3 18H21" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
      <path d="M8 3V21" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
      <path d="M13 3V21" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
      <path d="M18 3V21" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  </div>
);

// Trophy icon for leaderboard
export const Trophy = ({ size = 24, className = '', style = {} }) => (
  <div 
    className={`item-image-container ${className}`} 
    style={{ 
      width: `${size}px`, 
      height: `${size}px`, 
      borderRadius: '50%',
      overflow: 'hidden',
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1E1633',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
      ...style 
    }}
  >
    <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 21H16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 17V21" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 6H4V8C4 9.65685 5.34315 11 7 11V6Z" fill="#F7B538"/>
      <path d="M17 6H20V8C20 9.65685 18.6569 11 17 11V6Z" fill="#F7B538"/>
      <path d="M7 4H17V12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12V4Z" fill="#F7B538"/>
      <path d="M7 4H17V12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12V4Z" stroke="#fff" strokeWidth="1.5"/>
      <path d="M7 6H4V8C4 9.65685 5.34315 11 7 11V6Z" stroke="#fff" strokeWidth="1.5"/>
      <path d="M17 6H20V8C20 9.65685 18.6569 11 17 11V6Z" stroke="#fff" strokeWidth="1.5"/>
    </svg>
  </div>
);

// Special SVG-based components for farm plots
export const EmptyPlot = ({ size = 30, className = '', style = {} }) => (
  <div 
    className={`item-image-container ${className}`} 
    style={{ 
      width: `${size}px`, 
      height: `${size}px`, 
      borderRadius: '4px',
      overflow: 'hidden',
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      ...style 
    }}
  >
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="25" width="30" height="10" rx="1" fill="#6B4226"/>
      <path d="M10 25V20M15 25V22M20 25V18M25 25V22M30 25V20" stroke="#6B4226" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2"/>
    </svg>
  </div>
);

// Planted plot (just soil with seed)
export const PlantedPlot = ({ size = 30, className = '', style = {} }) => (
  <div 
    className={`item-image-container ${className}`} 
    style={{ 
      width: `${size}px`, 
      height: `${size}px`, 
      borderRadius: '4px',
      overflow: 'hidden',
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      ...style 
    }}
  >
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="25" width="30" height="10" rx="1" fill="#6B4226"/>
      <circle cx="20" cy="25" r="2" fill="#964B00"/>
      <path d="M19 25H21" stroke="#fff" strokeWidth="0.5" strokeLinecap="round"/>
    </svg>
  </div>
);

// Watered plot
export const WateredPlot = ({ size = 30, className = '', style = {} }) => (
  <div 
    className={`item-image-container ${className}`} 
    style={{ 
      width: `${size}px`, 
      height: `${size}px`, 
      borderRadius: '4px',
      overflow: 'hidden',
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      ...style 
    }}
  >
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="25" width="30" height="10" rx="1" fill="#8B5A3C"/>
      <ellipse cx="14" cy="29" rx="2" ry="1" fill="#6B4226" fillOpacity="0.5"/>
      <ellipse cx="22" cy="27" rx="3" ry="1" fill="#6B4226" fillOpacity="0.5"/>
      <ellipse cx="26" cy="30" rx="2" ry="1" fill="#6B4226" fillOpacity="0.5"/>
    </svg>
  </div>
);

// Add fallback SVG components for Wood, Fabric, and EssenceExtractor
export const Wood = ({ size = 24, className = '', style = {} }) => {
  // Try to use the image if available, otherwise use SVG fallback
  try {
    return (
      <ItemImageContainer 
        src={woodImage} 
        alt="Wood" 
        size={size}
        className={className}
        style={style}
      />
    );
  } catch (error) {
    // Fallback SVG for Wood
    return (
      <div 
        className={`item-image-container ${className}`} 
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#8B4513',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          ...style 
        }}
      >
        <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="8" width="14" height="8" rx="1" fill="#8B4513"/>
          <path d="M5 10L19 10" stroke="#6B4226" strokeWidth="0.5"/>
          <path d="M5 12L19 12" stroke="#6B4226" strokeWidth="0.5"/>
          <path d="M5 14L19 14" stroke="#6B4226" strokeWidth="0.5"/>
        </svg>
      </div>
    );
  }
};

export const Fabric = ({ size = 24, className = '', style = {} }) => {
  // Try to use the image if available, otherwise use SVG fallback
  try {
    return (
      <ItemImageContainer 
        src={fabricImage} 
        alt="Fabric" 
        size={size}
        className={className}
        style={style}
      />
    );
  } catch (error) {
    // Fallback SVG for Fabric
    return (
      <div 
        className={`item-image-container ${className}`} 
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#9370DB',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          ...style 
        }}
      >
        <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 6C5 5.44772 5.44772 5 6 5H18C18.5523 5 19 5.44772 19 6V18C19 18.5523 18.5523 19 18 19H6C5.44772 19 5 18.5523 5 18V6Z" fill="#9370DB"/>
          <path d="M5 12H19" stroke="#8A2BE2" strokeWidth="0.5" strokeDasharray="2 2"/>
          <path d="M12 5V19" stroke="#8A2BE2" strokeWidth="0.5" strokeDasharray="2 2"/>
          <circle cx="8.5" cy="8.5" r="1.5" fill="#B19CD9"/>
          <circle cx="15.5" cy="15.5" r="1.5" fill="#B19CD9"/>
        </svg>
      </div>
    );
  }
};

export const EssenceExtractor = ({ size = 24, className = '', style = {} }) => {
  // Try to use the image if available, otherwise use SVG fallback
  try {
    return (
      <ItemImageContainer 
        src={essenceExtractorImage} 
        alt="Essence Extractor" 
        size={size}
        className={className}
        style={style}
      />
    );
  } catch (error) {
    // Fallback SVG for Essence Extractor
    return (
      <div 
        className={`item-image-container ${className}`} 
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#4B0082',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          ...style 
        }}
      >
        <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V8" stroke="#DDA0DD" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M14 7L16 5" stroke="#DDA0DD" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M10 7L8 5" stroke="#DDA0DD" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 14.5L5 12" stroke="#DDA0DD" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M16 14.5L19 12" stroke="#DDA0DD" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="12" cy="12" r="4" fill="#8A2BE2" stroke="#DDA0DD" strokeWidth="1.5"/>
          <circle cx="12" cy="12" r="2" fill="#4B0082"/>
          <path d="M12 16V19" stroke="#DDA0DD" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    );
  }
};

// Create proper item components for missing items
export const Moonleaf = ({ size = 24, className = '', style = {} }) => (
  <ItemImageContainer 
    src={moonleafImage} 
    alt="Moonleaf" 
    size={size}
    className={className}
    style={style}
  />
);

export const GoldDust = ({ size = 24, className = '', style = {} }) => (
  <ItemImageContainer 
    src={goldDustImage} 
    alt="Gold Dust" 
    size={size}
    className={className}
    style={style}
  />
);

export const GoldenSeeds = ({ size = 24, className = '', style = {} }) => (
  <ItemImageContainer 
    src={goldenSeedsImage} 
    alt="Golden Seeds" 
    size={size}
    className={className}
    style={style}
  />
);

export const RainbowShard = ({ size = 24, className = '', style = {} }) => (
  <ItemImageContainer 
    src={rainbowShardImage} 
    alt="Rainbow Shard" 
    size={size}
    className={className}
    style={style}
  />
);

export const CrystalEssence = ({ size = 24, className = '', style = {} }) => (
  <ItemImageContainer 
    src={crystalEssenceImage} 
    alt="Crystal Essence" 
    size={size}
    className={className}
    style={style}
  />
);

export const TimeCrystal = ({ size = 24, className = '', style = {} }) => (
  <ItemImageContainer 
    src={timeCrystalImage} 
    alt="Time Crystal" 
    size={size}
    className={className}
    style={style}
  />
);

export const Raincatcher = ({ size = 24, className = '', style = {} }) => (
  <ItemImageContainer 
    src={rainCatcherImage} 
    alt="Raincatcher" 
    size={size}
    className={className}
    style={style}
  />
);

export const GrowthLamp = ({ size = 24, className = '', style = {} }) => (
  <ItemImageContainer 
    src={growthLampImage} 
    alt="Growth Lamp" 
    size={size}
    className={className}
    style={style}
  />
);

export const AncientApple = ({ size = 24, className = '', style = {} }) => (
  <ItemImageContainer 
    src={ancientAppleImage} 
    alt="Ancient Apple" 
    size={size}
    className={className}
    style={style}
  />
);

export const LunarHarvester = ({ size = 24, className = '', style = {} }) => (
  <ItemImageContainer 
    src={lunarHarvesterImage} 
    alt="Lunar Harvester" 
    size={size}
    className={className}
    style={style}
  />
);

export const MonadiumSickle = ({ size = 24, className = '', style = {} }) => (
  <ItemImageContainer 
    src={monadiumSickleImage} 
    alt="Monadium Sickle" 
    size={size}
    className={className}
    style={style}
  />
);

export const MonadiumHoe = ({ size = 24, className = '', style = {} }) => (
  <ItemImageContainer 
    src={monadiumHoeImage} 
    alt="Monadium Hoe" 
    size={size}
    className={className}
    style={style}
  />
);

// Add new components for Rainbow Core and Ancient Apple Seeds
export const RainbowCore = ({ size = 24, className = '', style = {} }) => (
  <ItemImageContainer 
    src={rainbowCoreImage} 
    alt="Rainbow Core" 
    size={size}
    className={className}
    style={style}
  />
);

export const AncientAppleSeeds = ({ size = 24, className = '', style = {} }) => (
  <ItemImageContainer 
    src={ancientAppleSeedsImage} 
    alt="Ancient Apple Seeds" 
    size={size}
    className={className}
    style={style}
  />
);

// Add FertileMesh component
export const FertileMesh = ({ size = 24, className = '', style = {} }) => (
  <ItemImageContainer 
    src={fertileMeshImage} 
    alt="Fertile Mesh" 
    size={size}
    className={className}
    style={style}
  />
);

// Export item mapping for lookup by ID
export const ItemImages = {
  crops: cropsTokenImage,
  water: waterBucketImage,
  fertilizer: fertilizerImage,
  potato: potatoImage,
  tomato: tomatoImage,
  strawberry: strawberryImage,
  corn: cornImage,
  carrot: carrotImage,
  pumpkin: pumpkinImage,
  wheat: wheatImage,
  watermelon: watermelonImage,
  cactus: cactusImage,
  goldenSeeds: goldenSeedsImage,
  crystalBerries: crystalBerriesImage,
  moonflower: moonflowerImage,
  ancientGrain: ancientGrainImage,
  rainbowFruit: rainbowFruitImage,
  TilePlot: TilePlot,
  Trophy: Trophy,
  EmptyPlot: EmptyPlot,
  PlantedPlot: PlantedPlot,
  WateredPlot: WateredPlot,
  PotatoPlant: PotatoPlant,
  TomatoPlant: TomatoPlant,
  StrawberryPlant: StrawberryPlant,
  CornPlant: CornPlant,
  CarrotPlant: CarrotPlant,
  PumpkinPlant: PumpkinPlant,
  WheatPlant: WheatPlant,
  WatermelonPlant: WatermelonPlant,
  CactusPlant: CactusPlant,
  GoldenPlant: GoldenPlant,
  CrystalBerriesPlant: CrystalBerriesPlant,
  MoonflowersPlant: MoonflowersPlant,
  AncientGrainPlant: AncientGrainPlant,
  RainbowFruitPlant: RainbowFruitPlant,
  Wood: Wood,
  Fabric: Fabric,
  EssenceExtractor: EssenceExtractor,
  FertileMesh: FertileMesh,
  moonleaf: moonleafImage,
  goldDust: goldDustImage,
  rainbowShard: rainbowShardImage,
  crystalEssence: crystalEssenceImage,
  timeCrystal: timeCrystalImage,
  raincatcher: rainCatcherImage,
  growthLamp: growthLampImage,
  ancientApple: ancientAppleImage,
  lunarHarvester: lunarHarvesterImage,
  monadiumSickle: monadiumSickleImage,
  monadiumHoe: monadiumHoeImage,
  rainbowCore: rainbowCoreImage,
  ancientAppleSeeds: ancientAppleSeedsImage,
  fertileMesh: fertileMeshImage
};

export default ItemImages; 