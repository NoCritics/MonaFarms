import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useDragDrop } from '../ui/DragDropContext';
import { DroppableTarget } from '../ui/DroppableTarget';
import { ContextMenu } from '../ui/ContextMenu';
import { useProgress } from '../../context/ProgressContext';
import { 
  PlantAnimation, 
  WaterAnimation, 
  HarvestAnimation, 
  FertilizerAnimation 
} from '../animations';

import { 
  TomatoPlant, 
  PotatoPlant, 
  StrawberryPlant, 
  EmptyPlot,
  CornPlant,
  CarrotPlant,
  PumpkinPlant,
  WheatPlant,
  WatermelonPlant,
  CactusPlant,
  GoldenPlant,
  CrystalBerriesPlant,
  MoonflowersPlant,
  AncientGrainPlant,
  RainbowFruitPlant
} from '../../assets/FarmIcons';

import { Fertilizer, WaterBucket, SeedPacket } from '../../assets/FarmIcons';

// Define crop components map
const cropComponentMap = {
  0: PotatoPlant,      // POTATO
  1: TomatoPlant,      // TOMATO
  2: StrawberryPlant,  // STRAWBERRY
  3: CornPlant,        // CORN
  4: CarrotPlant,      // CARROT
  5: PumpkinPlant,     // PUMPKIN
  6: WheatPlant,       // WHEAT
  7: WatermelonPlant,  // WATERMELON
  8: CactusPlant,      // CACTUS
  9: GoldenPlant,      // GOLDEN_PLANT_CROP
  10: CrystalBerriesPlant, // CRYSTAL_BERRIES
  11: MoonflowersPlant,    // MOONFLOWERS
  12: AncientGrainPlant,   // ANCIENT_GRAIN
  13: RainbowFruitPlant    // RAINBOW_FRUIT
};

// Fallback to existing components for those that haven't been created yet
const getFallbackComponent = (cropId) => {
  const index = cropId % 3;
  const crops = [PotatoPlant, TomatoPlant, StrawberryPlant];
  return crops[index];
};

const getGrowthStage = (isEmpty, waterCount, isFertilized, isReady, plantedAt, maturityTime, currentTime) => {
  if (isEmpty) return 0;
  
  if (isReady) return 3;
  
  if (waterCount === 0 && !isFertilized) return 1;
  
  // Calculate growth percentage
  const timePassed = currentTime - plantedAt;
  const growthDuration = maturityTime - plantedAt;
  const percentComplete = growthDuration > 0 ? Math.min(100, (timePassed / growthDuration) * 100) : 0;
  
  if (percentComplete < 50) return 1;
  return 2;
};

const FarmGrid = ({
  selectedTile,
  setSelectedTile,
  tileInfo,
  tileCount,
  farmTiles,
  isWatering,
  isHarvesting,
  isFertilizing,
  isPlanting,
  onTileSelect,
  getCropEmojiFromId,
  currentTime
}) => {
  const { address } = useAccount();
  const [showAnimation, setShowAnimation] = useState(null);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, tileIndex: -1 });
  const { updateStats } = useProgress();
  
  // Track tile with ongoing animation
  const [animatingTile, setAnimatingTile] = useState(-1);
  
  // Clear context menu when selected tile changes
  useEffect(() => {
    setContextMenu(prev => ({ ...prev, show: false }));
  }, [selectedTile]);
  
  // Event handler for right-click on tiles
  const handleContextMenu = (e, tileIndex) => {
    e.preventDefault();
    
    // Set the selected tile first
    setSelectedTile(tileIndex);
    
    // Then open context menu
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      tileIndex
    });
  };
  
  // Set up the drag-and-drop handler
  const handleDrop = (item, targetTileIndex) => {
    console.log(`Dropped ${item} on tile ${targetTileIndex}`);
    // The specific actions would be implemented here
    // This would trigger the same actions as the buttons in FarmManagerComponent
  };
  
  // Generate tile target type for drag-and-drop
  const getTileTargetType = (tileIndex) => {
    const tile = farmTiles.find(t => t.index === tileIndex);
    
    if (tile) {
      if (tile.isEmpty) {
        return 'empty-tile';
      } else if (tile.waterCount === 0) {
        return 'planted-tile';
      } else if (!tile.isReady) {
        return 'growing-tile';
      } else {
        return 'ready-tile';
      }
    }
    
    return 'unknown-tile';
  };
  
  // Get context menu actions based on tile state
  const getContextMenuActions = (tileIndex) => {
    const actions = [];
    const tile = farmTiles.find(t => t.index === tileIndex);
    
    if (tile) {
      if (tile.isEmpty) {
        actions.push({
          icon: <SeedPacket cropType={0} size={16} />,
          label: 'Plant',
          onClick: () => {} // This would trigger the plant action
        });
      } else if (tile.waterCount === 0 && !tile.isFertilized) {
        actions.push({
          icon: <WaterBucket size={16} />,
          label: 'Water',
          onClick: () => {} // This would trigger the water action
        });
      } else if (tile.isReady) {
        actions.push({
          icon: '✓',
          label: 'Harvest',
          onClick: () => {} // This would trigger the harvest action
        });
      } else if (!tile.isFertilized) {
        actions.push({
          icon: <Fertilizer size={16} />,
          label: 'Fertilize',
          onClick: () => {} // This would trigger the fertilize action
        });
      }
    }
    
    return actions;
  };
  
  // Animation completion handlers
  const handleAnimationComplete = () => {
    setShowAnimation(null);
    setAnimatingTile(-1);
    
    // Update player stats based on the action
    if (isWatering) {
      updateStats(prev => ({ 
        waterBucketsUsed: prev.waterBucketsUsed + 1 
      }));
    } else if (isHarvesting && tileInfo) {
      updateStats(prev => ({ 
        cropsHarvested: prev.cropsHarvested + 1,
        ...(tileInfo.plantedCrop === 0 ? { potatoesHarvested: prev.potatoesHarvested + 1 } : {}),
        ...(tileInfo.plantedCrop === 1 ? { tomatoesHarvested: prev.tomatoesHarvested + 1 } : {}),
        ...(tileInfo.plantedCrop === 2 ? { strawberriesHarvested: prev.strawberriesHarvested + 1 } : {})
      }));
    }
  };
  
  // Update animation state when action states change
  useEffect(() => {
    if (isWatering && animatingTile === -1) {
      setShowAnimation('watering');
      setAnimatingTile(selectedTile);
    } else if (isHarvesting && animatingTile === -1) {
      setShowAnimation('harvesting');
      setAnimatingTile(selectedTile);
    } else if (isFertilizing && animatingTile === -1) {
      setShowAnimation('fertilizing');
      setAnimatingTile(selectedTile);
    } else if (isPlanting && animatingTile === -1) {
      setShowAnimation('planting');
      setAnimatingTile(selectedTile);
    }
  }, [isWatering, isHarvesting, isFertilizing, isPlanting, selectedTile, animatingTile]);
  
  if (tileCount === 0) {
    return (
      <div className="farm-grid-container">
        <h3>My Farm</h3>
        <div className="text-center p-lg">
          <p className="mb-md">You don't have any farm tiles yet. Visit the shop to buy your first tile!</p>
          <div className="empty-farm-illustration">
            <EmptyPlot size={100} />
            <div className="mt-md text-secondary">No tiles available</div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="farm-grid-container">
      <h3>My Farm ({tileCount} Tiles)</h3>
      
      <div className="farm-grid">
        {Array.from({ length: tileCount }, (_, i) => {
          const isSelected = selectedTile === i;
          const isTileAnimating = animatingTile === i;
          const tileTargetType = getTileTargetType(i);
          
          // Get tile info either from farmTiles or tileInfo if this is the selected tile
          const tile = farmTiles.find(t => t.index === i) || 
                     (isSelected && tileInfo ? {
                        index: i,
                        plantedCrop: tileInfo.plantedCrop,
                        plantedAt: tileInfo.plantedAt,
                        waterCount: tileInfo.waterCount,
                        isFertilized: tileInfo.isFertilized,
                        maturityTime: tileInfo.maturityTime,
                        isEmpty: tileInfo.isEmpty,
                        isReady: tileInfo.isReady
                     } : null);
          
          return (
            <DroppableTarget
              key={i}
              targetType={tileTargetType}
              targetData={i}
              onDrop={handleDrop}
              className={`farm-tile ${isSelected ? 'selected' : ''} ${isTileAnimating && isWatering ? 'watering' : ''} ${isTileAnimating && isHarvesting ? 'harvesting' : ''} ${isTileAnimating && isFertilizing ? 'fertilizing' : ''} ${isTileAnimating && isPlanting ? 'planting' : ''}`}
            >
              <div 
                className="farm-tile-inner"
                onClick={() => onTileSelect(i)}
                onContextMenu={(e) => handleContextMenu(e, i)}
              >
                <div className="farm-tile-number">{i + 1}</div>
                
                {tile && !tile.isEmpty ? (
                  <>
                    {(() => {
                      const stage = getGrowthStage(
                        tile.isEmpty,
                        tile.waterCount,
                        tile.isFertilized,
                        tile.isReady,
                        tile.plantedAt,
                        tile.maturityTime,
                        currentTime
                      );
                      
                      const cropId = tile.plantedCrop;
                      const CropComponent = cropComponentMap[cropId] || getFallbackComponent(cropId);
                      return <CropComponent stage={stage} size={40} />;
                    })()}
                    
                    <div 
                      className={`farm-tile-status ${tile.isReady ? 'ready' : (tile.waterCount > 0 || tile.isFertilized) ? 'growing' : 'planted'}`}
                    >
                      {tile.isReady ? 
                        '✓' : 
                        <SeedPacket cropType={tile.plantedCrop} size={16} />}
                      {!tile.isReady && (tile.waterCount > 0 || tile.isFertilized) && 
                        <div className="status-indicator">
                          {tile.isFertilized ? 
                            <div className="indicator fertilizer-indicator"></div> : 
                            <div className="indicator water-indicator"></div>}
                        </div>
                      }
                    </div>
                  </>
                ) : (
                  <EmptyPlot size={40} />
                )}
                
                {/* Animation overlay */}
                {showAnimation && isTileAnimating && (
                  <div className="animation-overlay">
                    {showAnimation === 'watering' && (
                      <WaterAnimation onComplete={handleAnimationComplete} />
                    )}
                    {showAnimation === 'harvesting' && (
                      <HarvestAnimation 
                        cropType={tile?.plantedCrop || 0} 
                        onComplete={handleAnimationComplete} 
                      />
                    )}
                    {showAnimation === 'fertilizing' && (
                      <FertilizerAnimation onComplete={handleAnimationComplete} />
                    )}
                    {showAnimation === 'planting' && (
                      <PlantAnimation onComplete={handleAnimationComplete} />
                    )}
                  </div>
                )}
              </div>
            </DroppableTarget>
          );
        })}
      </div>
      
      {/* Context Menu */}
      <ContextMenu 
        isOpen={contextMenu.show} 
        position={{ x: contextMenu.x, y: contextMenu.y }} 
        actions={getContextMenuActions(contextMenu.tileIndex)}
        onClose={() => setContextMenu({ ...contextMenu, show: false })}
      />
    </div>
  );
};

export default FarmGrid;