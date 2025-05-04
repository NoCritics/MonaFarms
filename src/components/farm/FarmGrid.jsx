import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useReadContract } from 'wagmi';
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
} from '../../assets/FarmIcons';

const CONTRACT_ADDRESSES = {
  farmManager: "0x5aCCeeD085c61cF12172E74969186814F2a984df",
};

const cropTypes = [
  { name: 'Potato', emoji: '🥔', component: PotatoPlant },
  { name: 'Tomato', emoji: '🍅', component: TomatoPlant },
  { name: 'Strawberry', emoji: '🍓', component: StrawberryPlant }
];

const getGrowthStage = (isPlanted, isWatered, isReady, plantedTime, growthTime) => {
  if (!isPlanted) return 0;
  
  if (isReady) return 3;
  
  if (!isWatered) return 1;
  
  // Calculate growth percentage
  const currentTime = Math.floor(Date.now() / 1000);
  const timePassed = currentTime - plantedTime;
  const percentComplete = Math.min(100, (timePassed / growthTime) * 100);
  
  if (percentComplete < 50) return 1;
  return 2;
};

const FarmGrid = ({
  selectedTile,
  setSelectedTile,
  tileInfo,
  tileCount,
  cropConfigs,
  isWatering,
  isHarvesting,
  isFertilizing,
  onTileSelect
}) => {
  const { address } = useAccount();
  const [showAnimation, setShowAnimation] = useState(null);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, tileIndex: -1 });
  const { updateStats } = useProgress();
  
  // Track tile with ongoing animation
  const [animatingTile, setAnimatingTile] = useState(-1);
  
  // State to store all tiles info
  const [allTilesInfo, setAllTilesInfo] = useState({});
  
  // Fetch info for all tiles
  const fetchAllTilesInfo = async () => {
    if (!address || tileCount <= 0) return;
    
    const tilesData = {};
    
    for (let i = 0; i < tileCount; i++) {
      try {
        const tileData = await useReadContract.fetch({
          address: CONTRACT_ADDRESSES.farmManager,
          abi: [
            {
              "inputs": [
                {"internalType": "address", "name": "playerAddress", "type": "address"},
                {"internalType": "uint8", "name": "tileIndex", "type": "uint8"}
              ],
              "name": "getTileInfo",
              "outputs": [
                {"internalType": "bool", "name": "exists", "type": "bool"},
                {"internalType": "uint8", "name": "cropType", "type": "uint8"},
                {"internalType": "uint256", "name": "plantedTime", "type": "uint256"},
                {"internalType": "bool", "name": "isWatered", "type": "bool"},
                {"internalType": "bool", "name": "cropExists", "type": "bool"},
                {"internalType": "bool", "name": "isReady", "type": "bool"}
              ],
              "stateMutability": "view",
              "type": "function"
            }
          ],
          functionName: 'getTileInfo',
          args: [address, i],
        });
        
        if (tileData) {
          tilesData[i] = {
            exists: tileData[0],
            cropType: Number(tileData[1]),
            plantedTime: Number(tileData[2]),
            isWatered: tileData[3],
            cropExists: tileData[4],
            isReady: tileData[5]
          };
        }
      } catch (error) {
        console.error(`Error fetching info for tile ${i}:`, error);
      }
    }
    
    setAllTilesInfo(tilesData);
  };
  
  // Initial fetch of all tiles info
  useEffect(() => {
    if (address && tileCount > 0) {
      fetchAllTilesInfo();
    }
  }, [address, tileCount]);
  
  // Update all tiles info when selected tile info changes
  useEffect(() => {
    if (tileInfo && selectedTile >= 0) {
      setAllTilesInfo(prev => ({
        ...prev,
        [selectedTile]: tileInfo
      }));
    }
  }, [tileInfo, selectedTile]);
  
  // Refetch all tiles info after actions
  useEffect(() => {
    if (!isWatering && !isHarvesting && !isFertilizing && animatingTile === -1) {
      // Action completed, refresh all tiles
      const timer = setTimeout(() => {
        fetchAllTilesInfo();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isWatering, isHarvesting, isFertilizing, animatingTile]);
  
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
  
  // Clear context menu when selected tile changes
  useEffect(() => {
    setContextMenu(prev => ({ ...prev, show: false }));
  }, [selectedTile]);
  
  // Set up the drag-and-drop handler
  const handleDrop = (item, targetTileIndex) => {
    console.log(`Dropped ${item} on tile ${targetTileIndex}`);
    // The specific actions would be implemented here
    // This would trigger the same actions as the buttons in FarmManagerComponent
  };
  
  // Generate tile target type for drag-and-drop
  const getTileTargetType = (tileIndex) => {
    const currentTileInfo = allTilesInfo[tileIndex] || (tileIndex === selectedTile ? tileInfo : null);
    
    if (currentTileInfo && currentTileInfo.exists) {
      if (!currentTileInfo.cropExists) {
        return 'empty-tile';
      } else if (!currentTileInfo.isWatered) {
        return 'planted-tile';
      } else if (!currentTileInfo.isReady) {
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
    const currentTileInfo = allTilesInfo[tileIndex] || (tileIndex === selectedTile ? tileInfo : null);
    
    if (currentTileInfo && currentTileInfo.exists) {
      if (!currentTileInfo.cropExists) {
        actions.push({
          icon: '🌱',
          label: 'Plant',
          onClick: () => {} // This would trigger the plant action
        });
      } else if (!currentTileInfo.isWatered) {
        actions.push({
          icon: '💧',
          label: 'Water',
          onClick: () => {} // This would trigger the water action
        });
      } else if (currentTileInfo.isReady) {
        actions.push({
          icon: '🌾',
          label: 'Harvest',
          onClick: () => {} // This would trigger the harvest action
        });
      } else {
        actions.push({
          icon: '🧪',
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
    } else if (isHarvesting) {
      updateStats(prev => ({ 
        cropsHarvested: prev.cropsHarvested + 1,
        ...(tileInfo?.cropType === 0 ? { potatoesHarvested: prev.potatoesHarvested + 1 } : {}),
        ...(tileInfo?.cropType === 1 ? { tomatoesHarvested: prev.tomatoesHarvested + 1 } : {}),
        ...(tileInfo?.cropType === 2 ? { strawberriesHarvested: prev.strawberriesHarvested + 1 } : {})
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
    }
  }, [isWatering, isHarvesting, isFertilizing, selectedTile, animatingTile]);
  
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
          
          // Get tile info either from allTilesInfo or tileInfo if this is the selected tile
          const currentTileInfo = allTilesInfo[i] || (isSelected ? tileInfo : null);
          
          return (
            <DroppableTarget
              key={i}
              targetType={tileTargetType}
              targetData={i}
              onDrop={handleDrop}
              className={`farm-tile ${isSelected ? 'selected' : ''} ${isTileAnimating && isWatering ? 'watering' : ''} ${isTileAnimating && isHarvesting ? 'harvesting' : ''} ${isTileAnimating && isFertilizing ? 'fertilizing' : ''}`}
            >
              <div 
                className="farm-tile-inner"
                onClick={() => onTileSelect(i)}
                onContextMenu={(e) => handleContextMenu(e, i)}
              >
                <div className="farm-tile-number">{i + 1}</div>
                
                {currentTileInfo && currentTileInfo.cropExists && (
                  <>
                    {(() => {
                      const cropConfig = cropConfigs[currentTileInfo.cropType];
                      const growthTime = cropConfig ? cropConfig.growthTime : 3600;
                      const stage = getGrowthStage(
                        currentTileInfo.cropExists,
                        currentTileInfo.isWatered,
                        currentTileInfo.isReady,
                        currentTileInfo.plantedTime,
                        growthTime
                      );
                      
                      const CropComponent = cropTypes[currentTileInfo.cropType].component;
                      return <CropComponent stage={stage} size={40} />;
                    })()}
                    
                    <div 
                      className={`farm-tile-status ${currentTileInfo.isReady ? 'ready' : currentTileInfo.isWatered ? 'growing' : 'empty'}`}
                    ></div>
                  </>
                )}
                
                {(!currentTileInfo || !currentTileInfo.cropExists) && (
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
                        cropType={currentTileInfo?.cropType || 0} 
                        onComplete={handleAnimationComplete} 
                      />
                    )}
                    {showAnimation === 'fertilizing' && (
                      <FertilizerAnimation onComplete={handleAnimationComplete} />
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