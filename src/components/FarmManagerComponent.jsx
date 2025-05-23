import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import FarmManagerABI from '../abis/FarmManager.abi.json';
import PlayerRegistryInventoryABI from '../abis/PlayerRegistryInventory.abi.json';
import { CONTRACT_ADDRESSES } from '../constants/contractAddresses';
import { 
  WaterBucket, 
  Fertilizer,
  EmptyPlot,
  PlantedPlot,
  WateredPlot,
  PotatoPlant,
  TomatoPlant,
  StrawberryPlant,
  SeedPacket,
  CropsToken,
  Wood,
  Fabric,
  EssenceExtractor,
  GoldenSeeds,
  CrystalEssence,
  Moonleaf,
  AncientApple,
  RainbowShard,
  GoldDust,
  TimeCrystal,
  RainbowCore,
  ItemImages,
  FertileMesh,
  PlantImages
} from '../assets/ItemImages';
import InventoryItem from './ui/InventoryItem';

// Preload all plant images
const preloadImages = () => {
  Object.values(PlantImages).forEach((src) => {
    const img = new Image();
    img.src = src;
  });
};

// Call preload function immediately
preloadImages();

const CONTRACT_ADDRESSES = {
    farmManager: "0x5aCCeeD085c61cF12172E74969186814F2a984df",
};

// ItemID enum values 
const ITEM_IDS = {
  CROPS_CURRENCY: 0,
  WATER_BUCKET: 1,
  FERTILIZER: 2,
  GOLDEN_SEED_ITEM: 3,
  CRYSTAL_ESSENCE: 4,
  MOONLEAF: 5,
  ANCIENT_APPLE: 6,
  RAINBOW_SHARD: 7,
  POTATO_SEED: 8,
  TOMATO_SEED: 9,
  STRAWBERRY_SEED: 10,
  CORN_SEED: 11,
  CARROT_SEED: 12,
  PUMPKIN_SEED: 13,
  WHEAT_SEED: 14,
  WATERMELON_SEED: 15,
  CACTUS_SEED: 16,
  CRYSTAL_BERRIES_SEED: 17,
  MOONFLOWERS_SEED: 18,
  RAINBOW_FRUIT_SEED: 19,
  ANCIENT_GRAIN_SEEDS_BUYABLE: 20,
  ANCIENT_APPLE_SEEDS: 21,
  RAINBOW_CORE: 22,
  ESSENCE_EXTRACTOR: 23,
  WOOD: 24,
  FABRIC: 25,
  GOLD_DUST: 26,
  TIME_CRYSTAL: 27,
  FERTILE_MESH: 28,
  GROWTH_LAMP: 29,
  RAINCATCHER: 30,
  LUNAR_HARVESTER_ITEM: 31,
  MONADIUM_SICKLE_ITEM: 32,
  MONADIUM_HOE_ITEM: 33,
  BLUEPRINT_MONADIUM_SICKLE: 34,
  BLUEPRINT_MONADIUM_HOE: 35,
  FARM_TILE_ITEM: 36
};

const cropTypes = [
  { name: 'Potato', component: PotatoPlant },
  { name: 'Tomato', component: TomatoPlant },
  { name: 'Strawberry', component: StrawberryPlant }
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

const FarmManagerComponent = () => {
    const { address } = useAccount();
    const [selectedTile, setSelectedTile] = useState(0);
    const [cropType, setCropType] = useState(0);
    const [inventory, setInventory] = useState(null);
    const [tileInfo, setTileInfo] = useState(null);
    const [tileCount, setTileCount] = useState(0);
    const [growthPercentage, setGrowthPercentage] = useState(0);
    const [cropConfigs, setCropConfigs] = useState([]);
    const [isWatering, setIsWatering] = useState(false);
    const [isHarvesting, setIsHarvesting] = useState(false);
    const [isFertilizing, setIsFertilizing] = useState(false);
    const [timeOracle, setTimeOracle] = useState(null);
    const waterAnimationRef = useRef(null);
    const [lastAction, setLastAction] = useState('');
    const [lastActionTime, setLastActionTime] = useState(0);
    const [tileInfoMap, setTileInfoMap] = useState({});  // Store data for all tiles

    const { data: inventoryData, refetch: refetchInventory } = useReadContract({
        address: CONTRACT_ADDRESSES.farmManager,
        abi: FarmManagerABI,
        functionName: 'getPlayerPlantableSeeds',
        args: [address],
        enabled: !!address,
    });

    const { data: tileCountData, refetch: refetchTileCount } = useReadContract({
        address: CONTRACT_ADDRESSES.farmManager,
        abi: FarmManagerABI,
        functionName: 'playerRegistry',
        args: [],
        enabled: !!address,
    });

    const { data: tileInfoData, refetch: refetchTileInfo } = useReadContract({
        address: CONTRACT_ADDRESSES.farmManager,
        abi: FarmManagerABI,
        functionName: 'getFarmTile',
        args: [address, selectedTile],
        enabled: !!address && tileCount > 0,
    });

    // Get timeOracle address
    const { data: timeOracleAddress } = useReadContract({
        address: CONTRACT_ADDRESSES.farmManager,
        abi: FarmManagerABI,
        functionName: 'timeOracle',
        args: [],
        enabled: !!address,
    });

    // Add a utility function to get current timestamp
    const getCurrentTimestamp = () => {
        return Math.floor(Date.now() / 1000);
    };

    useEffect(() => {
        if (timeOracleAddress) {
            // We would normally initialize the timeOracle contract here
            // For now, let's use a simplified version with just getCurrentTimestamp
            setTimeOracle({
                getCurrentTimestamp
            });
        }
    }, [timeOracleAddress]);

    // Get crop config for growth times and yields
    const getCropConfig = async (cropId) => {
      try {
        const { data: itemRegistryAddress } = await useReadContract.fetch({
          address: CONTRACT_ADDRESSES.farmManager,
          abi: FarmManagerABI,
          functionName: 'itemRegistry',
          args: [],
        });

        // We'll need to get the crop data directly from ItemRegistry
        // For now, use fallback values since we don't have ItemRegistry ABI
        return {
          growthTime: cropId === 0 ? 10800 : cropId === 1 ? 7200 : 3600, // 3h, 2h, 1h
          yield: cropId === 0 ? 10 : cropId === 1 ? 15 : 20,
          waterNeeded: 1,
          enabled: true
        };
      } catch (error) {
        console.error("Error fetching crop config:", error);
        return {
          growthTime: cropId === 0 ? 10800 : cropId === 1 ? 7200 : 3600, // 3h, 2h, 1h
          yield: cropId === 0 ? 10 : cropId === 1 ? 15 : 20,
          waterNeeded: 1,
          enabled: true
        };
      }
    };

    // Fetch all crop configs initially
    useEffect(() => {
      const fetchCropConfigs = async () => {
        const configs = [];
        
        for (let i = 0; i < 3; i++) {
          try {
            const config = await getCropConfig(i);
            configs.push(config);
          } catch (error) {
            console.error(`Error fetching config for crop type ${i}:`, error);
            // Use fallback values
            configs.push({
              growthTime: i === 0 ? 10800 : i === 1 ? 7200 : 3600, // 3h, 2h, 1h
              yield: i === 0 ? 10 : i === 1 ? 15 : 20,
              waterNeeded: 1,
              enabled: true
            });
          }
        }
        
        setCropConfigs(configs);
      };
      
      if (address) {
        fetchCropConfigs();
      }
    }, [address]);

    // Add helper functions to get item icons and names
    const getItemIcon = (itemId, size = 50) => {
        // For seed items
        if (itemId >= ITEM_IDS.POTATO_SEED && itemId <= ITEM_IDS.RAINBOW_FRUIT_SEED) {
            const cropType = itemId - ITEM_IDS.POTATO_SEED;
            return <SeedPacket cropType={cropType} size={size} />;
        }
        
        // Map item IDs to their corresponding image components
        const itemIconMap = {
            [ITEM_IDS.CROPS_CURRENCY]: <CropsToken size={size} />,
            [ITEM_IDS.WATER_BUCKET]: <WaterBucket size={size} />,
            [ITEM_IDS.FERTILIZER]: <Fertilizer size={size} />,
            [ITEM_IDS.GOLDEN_SEED_ITEM]: <GoldenSeeds size={size} />,
            [ITEM_IDS.CRYSTAL_ESSENCE]: <CrystalEssence size={size} />,
            [ITEM_IDS.MOONLEAF]: <Moonleaf size={size} />,
            [ITEM_IDS.ANCIENT_APPLE]: <AncientApple size={size} />,
            [ITEM_IDS.RAINBOW_SHARD]: <RainbowShard size={size} />,
            [ITEM_IDS.RAINBOW_CORE]: <RainbowCore size={size} />,
            [ITEM_IDS.ESSENCE_EXTRACTOR]: <EssenceExtractor size={size} />,
            [ITEM_IDS.WOOD]: <Wood size={size} />,
            [ITEM_IDS.FABRIC]: <Fabric size={size} />,
            [ITEM_IDS.GOLD_DUST]: <GoldDust size={size} />,
            [ITEM_IDS.TIME_CRYSTAL]: <TimeCrystal size={size} />,
            [ITEM_IDS.FERTILE_MESH]: <FertileMesh size={size} />,
            [ITEM_IDS.ANCIENT_APPLE_SEEDS]: <SeedPacket cropType={12} size={size} />,
            [ITEM_IDS.ANCIENT_GRAIN_SEEDS_BUYABLE]: <SeedPacket cropType={12} size={size} />
        };
        
        // Return the specific icon for the item ID, or fall back to a generic icon
        return itemIconMap[itemId] || <ItemImages.TilePlot size={size} />;
    };

    // Helper to get item name
    const getItemName = (itemId) => {
        // For seed items
        if (itemId >= ITEM_IDS.POTATO_SEED && itemId <= ITEM_IDS.RAINBOW_FRUIT_SEED) {
            const cropNames = [
                "Potato", "Tomato", "Strawberry", "Corn", "Carrot", "Pumpkin", 
                "Wheat", "Watermelon", "Cactus", "Crystal Berries", "Moonflowers", 
                "Rainbow Fruit"
            ];
            const index = itemId - ITEM_IDS.POTATO_SEED;
            if (index >= 0 && index < cropNames.length) {
                return `${cropNames[index]} Seeds`;
            }
        }

        const itemNames = {
            [ITEM_IDS.CROPS_CURRENCY]: "CROPS Token",
            [ITEM_IDS.WATER_BUCKET]: "Water Charges",
            [ITEM_IDS.FERTILIZER]: "Fertilizer",
            [ITEM_IDS.GOLDEN_SEED_ITEM]: "Golden Seeds",
            [ITEM_IDS.CRYSTAL_ESSENCE]: "Crystal Essence",
            [ITEM_IDS.MOONLEAF]: "Moonleaf",
            [ITEM_IDS.ANCIENT_APPLE]: "Ancient Apple",
            [ITEM_IDS.RAINBOW_SHARD]: "Rainbow Shard",
            [ITEM_IDS.RAINBOW_CORE]: "Rainbow Core",
            [ITEM_IDS.ESSENCE_EXTRACTOR]: "Essence Extractor",
            [ITEM_IDS.WOOD]: "Wood",
            [ITEM_IDS.FABRIC]: "Fabric",
            [ITEM_IDS.GOLD_DUST]: "Gold Dust",
            [ITEM_IDS.TIME_CRYSTAL]: "Time Crystal",
            [ITEM_IDS.FERTILE_MESH]: "Fertile Mesh",
            [ITEM_IDS.GROWTH_LAMP]: "Growth Lamp",
            [ITEM_IDS.RAINCATCHER]: "Raincatcher",
            [ITEM_IDS.LUNAR_HARVESTER_ITEM]: "Lunar Harvester",
            [ITEM_IDS.MONADIUM_SICKLE_ITEM]: "Monadium Sickle",
            [ITEM_IDS.MONADIUM_HOE_ITEM]: "Monadium Hoe",
            [ITEM_IDS.BLUEPRINT_MONADIUM_SICKLE]: "Monadium Sickle Blueprint",
            [ITEM_IDS.BLUEPRINT_MONADIUM_HOE]: "Monadium Hoe Blueprint",
            [ITEM_IDS.ANCIENT_APPLE_SEEDS]: "Ancient Apple Seeds",
            [ITEM_IDS.ANCIENT_GRAIN_SEEDS_BUYABLE]: "Ancient Grain Seeds"
        };

        return itemNames[itemId] || `Item #${itemId}`;
    };

    // Update the inventory data processing in useEffect
    useEffect(() => {
        if (inventoryData) {
            const fullInventory = {};
            
            // Process inventory data from the contract
            // In a real implementation, we'd extract this from inventoryData directly
            // For now, we'll add a debug code that populates with sample inventory data
            inventoryData.forEach(seed => {
                if (seed.cropId === 0) { // Potato
                    fullInventory[ITEM_IDS.POTATO_SEED] = Number(seed.amountOwned);
                } else if (seed.cropId === 1) { // Tomato
                    fullInventory[ITEM_IDS.TOMATO_SEED] = Number(seed.amountOwned);
                } else if (seed.cropId === 2) { // Strawberry
                    fullInventory[ITEM_IDS.STRAWBERRY_SEED] = Number(seed.amountOwned);
                }
            });
            
            // Add water and fertilizer with default values (in real implementation, these would come from inventory data)
            fullInventory[ITEM_IDS.WATER_BUCKET] = 10;
            fullInventory[ITEM_IDS.FERTILIZER] = 5;
            
            // Add some sample data for other resources (in real implementation, these would come from inventory data)
            fullInventory[ITEM_IDS.CROPS_CURRENCY] = 1000;
            fullInventory[ITEM_IDS.WOOD] = 5;
            fullInventory[ITEM_IDS.FABRIC] = 3;
            fullInventory[ITEM_IDS.CRYSTAL_ESSENCE] = 2;
            
            setInventory(fullInventory);
        }

        if (tileCountData) {
            // We need to call another function to get player farm tiles count
            // For now, use a placeholder value
            setTileCount(6); // Placeholder
        }

        if (tileInfoData) {
            const tileInfoObj = {
                exists: tileInfoData.plantedAt !== 0,
                cropType: Number(tileInfoData.plantedCrop),
                plantedTime: Number(tileInfoData.plantedAt),
                isWatered: tileInfoData.waterCount > 0,
                cropExists: tileInfoData.plantedAt !== 0,
                isReady: timeOracle.getCurrentTimestamp ? timeOracle.getCurrentTimestamp() >= tileInfoData.maturityTime : false
            };
            
            setTileInfo(tileInfoObj);
            
            // Add to the tile info map
            setTileInfoMap(prevMap => ({
                ...prevMap,
                [selectedTile]: tileInfoObj
            }));
            
            // Calculate growth percentage
            if (tileInfoObj.cropExists && tileInfoObj.isWatered && !tileInfoObj.isReady) {
                const currentTime = Math.floor(Date.now() / 1000);
                const plantedTime = tileInfoObj.plantedTime;
                const cropConfig = cropConfigs[tileInfoObj.cropType];
                
                if (cropConfig) {
                    const growthTime = cropConfig.growthTime;
                    const timePassed = currentTime - plantedTime;
                    const percentage = Math.min(100, Math.max(0, (timePassed / growthTime) * 100));
                    setGrowthPercentage(percentage);
                }
            } else if (tileInfoObj.isReady) {
                setGrowthPercentage(100);
            } else if (!tileInfoObj.isWatered && tileInfoObj.cropExists) {
                setGrowthPercentage(0);
            }
        }
    }, [inventoryData, tileCountData, tileInfoData, cropConfigs, timeOracle]);

    // Set up interval to update growth percentage
    useEffect(() => {
        let interval;
        
        if (tileInfo && tileInfo.cropExists && tileInfo.isWatered && !tileInfo.isReady) {
            interval = setInterval(() => {
                const currentTime = Math.floor(Date.now() / 1000);
                const plantedTime = tileInfo.plantedTime;
                const cropConfig = cropConfigs[tileInfo.cropType];
                
                if (cropConfig) {
                    const growthTime = cropConfig.growthTime;
                    const timePassed = currentTime - plantedTime;
                    const percentage = Math.min(100, Math.max(0, (timePassed / growthTime) * 100));
                    
                    setGrowthPercentage(percentage);
                    
                    // Refetch if the crop should be ready now
                    if (percentage >= 100) {
                        refetchTileInfo();
                        clearInterval(interval);
                    }
                }
            }, 1000);
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [tileInfo, cropConfigs, refetchTileInfo]);

    const { writeContractAsync: writeContract, isPending: isWriting } = useWriteContract();

    const plantCrop = async () => {
        if (!address) return;
        try {
            // Convert crop type to seed ItemID
            // For now, hardcode some ItemID enum values that correspond to the seed types
            const seedItemIds = [
                1, // ItemID.POTATO_SEEDS - using a sample value
                2, // ItemID.TOMATO_SEEDS - using a sample value
                3  // ItemID.STRAWBERRY_SEEDS - using a sample value
            ];
            
            const seedItemId = seedItemIds[cropType];
            
            await writeContract({
                address: CONTRACT_ADDRESSES.farmManager,
                abi: FarmManagerABI,
                functionName: 'plantCrop',
                args: [selectedTile, seedItemId]
            });
            setLastAction('planted');
            setLastActionTime(Date.now());
            setTimeout(() => {
                refetchInventory();
                refetchTileInfo();
            }, 2500);
        } catch (error) {
            console.error("Plant crop error:", error);
            alert("Action failed: " + error.message);
        }
    };

    const waterCrop = async () => {
        if (!address) return;
        try {
            setIsWatering(true);
            
            await writeContract({
                address: CONTRACT_ADDRESSES.farmManager,
                abi: FarmManagerABI,
                functionName: 'waterCrop',
                args: [selectedTile]
            });
            
            // Animation and feedback for watering
            setLastAction('watered');
            setLastActionTime(Date.now());
            
            setTimeout(() => {
                setIsWatering(false);
                refetchInventory();
                refetchTileInfo();
            }, 2500);
        } catch (error) {
            console.error("Water crop error:", error);
            setIsWatering(false);
            alert("Action failed: " + error.message);
        }
    };

    const harvestCrop = async () => {
        if (!address) return;
        try {
            setIsHarvesting(true);
            
            await writeContract({
                address: CONTRACT_ADDRESSES.farmManager,
                abi: FarmManagerABI,
                functionName: 'harvestCrop',
                args: [selectedTile]
            });
            
            // Animation and feedback for harvest
            setLastAction('harvested');
            setLastActionTime(Date.now());
            
            setTimeout(() => {
                setIsHarvesting(false);
                refetchInventory();
                refetchTileInfo();
            }, 2500);
        } catch (error) {
            console.error("Harvest crop error:", error);
            setIsHarvesting(false);
            alert("Action failed: " + error.message);
        }
    };

    const useFertilizer = async () => {
        if (!address) return;
        try {
            setIsFertilizing(true);
            
            await writeContract({
                address: CONTRACT_ADDRESSES.farmManager,
                abi: FarmManagerABI,
                functionName: 'fertilizeCrop',
                args: [selectedTile]
            });
            
            // Animation and feedback for fertilizing
            setLastAction('fertilized');
            setLastActionTime(Date.now());
            
            setTimeout(() => {
                setIsFertilizing(false);
                refetchInventory();
                refetchTileInfo();
            }, 2500);
        } catch (error) {
            console.error("Use fertilizer error:", error);
            setIsFertilizing(false);
            alert("Action failed: " + error.message);
        }
    };

    if (!address) return (
        <div className="card animate-fade-in">
            <h2>Farm Manager</h2>
            <p className="text-center text-secondary">Please connect your wallet to manage your farm.</p>
        </div>
    );

    return (
        <div className="farm-container animate-fade-in">
            <h2>Farm Manager</h2>
            
            {inventory && (
                <div className="inventory-section">
                    <div className="section-header">
                        <h3>Inventory</h3>
                        <button className="btn btn-secondary">Show Details</button>
                    </div>
                    <div className="inventory-grid" style={{ paddingBottom: '3rem' }}>
                        {/* Display all inventory items except for farm tiles */}
                        {Object.entries(inventory).map(([itemId, count]) => {
                            // Skip farm tiles
                            if (Number(itemId) === ITEM_IDS.FARM_TILE_ITEM) return null;
                            // Skip items with zero count
                            if (count === 0) return null;

                            return (
                                <InventoryItem
                                    key={itemId}
                                    icon={getItemIcon(Number(itemId))}
                                    count={count}
                                    label={getItemName(Number(itemId))}
                                />
                            );
                        })}
                        
                        {/* Show message if inventory is empty */}
                        {Object.keys(inventory).length === 0 && (
                            <div className="empty-inventory-message">
                                <p>Your inventory is empty. Visit the shop to purchase items!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            <div className="farm-grid-container">
                <h3>My Farm {tileCount > 0 ? `(${tileCount} Tiles)` : ''}</h3>
                
                {tileCount > 0 ? (
                    <div>
                        <div className="farm-grid">
                            {Array.from({ length: tileCount }, (_, i) => {
                                const isTileSelected = selectedTile === i;
                                const cachedTileInfo = tileInfoMap[i];
                                
                                return (
                                    <div
                                        key={i}
                                        className={`farm-tile ${isTileSelected ? 'selected' : ''} ${isWatering && isTileSelected ? 'watering' : ''} ${isHarvesting && isTileSelected ? 'harvesting' : ''} ${isFertilizing && isTileSelected ? 'fertilizing' : ''}`}
                                        onClick={() => setSelectedTile(i)}
                                    >
                                        <div className="farm-tile-number">{i + 1}</div>
                                        
                                        {cachedTileInfo && cachedTileInfo.cropExists && (
                                            <>
                                                {(() => {
                                                    const cropConfig = cropConfigs[cachedTileInfo.cropType];
                                                    const growthTime = cropConfig ? cropConfig.growthTime : 3600;
                                                    const stage = getGrowthStage(
                                                        cachedTileInfo.cropExists,
                                                        cachedTileInfo.isWatered,
                                                        cachedTileInfo.isReady,
                                                        cachedTileInfo.plantedTime,
                                                        growthTime
                                                    );
                                                    
                                                    const CropComponent = cropTypes[cachedTileInfo.cropType]?.component || EmptyPlot;
                                                    return <CropComponent stage={stage} size={60} />;
                                                })()}
                                                
                                                <div 
                                                    className={`farm-tile-status ${cachedTileInfo.isReady ? 'ready' : cachedTileInfo.isWatered ? 'growing' : 'empty'}`}
                                                ></div>
                                            </>
                                        )}
                                        
                                        {(!cachedTileInfo || !cachedTileInfo.cropExists) && (
                                            <EmptyPlot size={60} />
                                        )}
                                        
                                        {isWatering && isTileSelected && (
                                            <div className="water-animation" ref={waterAnimationRef}>
                                                <WaterBucket size={36} />
                                            </div>
                                        )}
                                        
                                        {isHarvesting && isTileSelected && (
                                            <div className="harvest-animation"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        
                        {tileInfo && tileInfo.exists && (
                            <div className="tile-details mt-lg">
                                <h3>Tile {selectedTile + 1} Details</h3>
                                
                                {tileInfo.cropExists ? (
                                    <div>
                                        <p>
                                            <span className={`font-bold crop-${cropTypes[tileInfo.cropType].name.toLowerCase()}`}>
                                                {cropTypes[tileInfo.cropType].component({size: 36, stage: 3})} {cropTypes[tileInfo.cropType].name}
                                            </span> planted on this tile.
                                        </p>
                                        
                                        <p>Status: {tileInfo.isReady ? 'Ready to Harvest! 🌟' : tileInfo.isWatered ? 'Growing... 🌱' : 'Needs Water'} 
                                            {!tileInfo.isWatered && <WaterBucket size={28} />}
                                        </p>
                                        
                                        {tileInfo.isWatered && !tileInfo.isReady && (
                                            <div>
                                                <p>Growth Progress:</p>
                                                <div className="growth-progress">
                                                    <div 
                                                        className="growth-fill" 
                                                        style={{ width: `${growthPercentage}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-secondary text-right">{Math.floor(growthPercentage)}%</p>
                                            </div>
                                        )}
                                        
                                        <div className="tile-actions">
                                            {!tileInfo.isWatered && inventory && inventory[ITEM_IDS.WATER_BUCKET] > 0 && (
                                                <button 
                                                    className="btn btn-water"
                                                    onClick={waterCrop}
                                                    disabled={isWriting || isWatering}
                                                >
                                                    <span className="btn-icon"><WaterBucket size={28} /></span>
                                                    Water Crop
                                                </button>
                                            )}
                                            
                                            {tileInfo.isReady && (
                                                <button 
                                                    className="btn btn-harvest"
                                                    onClick={harvestCrop}
                                                    disabled={isWriting || isHarvesting}
                                                >
                                                    <span className="btn-icon">
                                                        {cropTypes[tileInfo.cropType].component({size: 28, stage: 3})}
                                                    </span>
                                                    Harvest Crop
                                                </button>
                                            )}
                                            
                                            {!tileInfo.isReady && inventory && inventory[ITEM_IDS.FERTILIZER] > 0 && (
                                                <button 
                                                    className="btn btn-fertilize"
                                                    onClick={useFertilizer}
                                                    disabled={isWriting || isFertilizing}
                                                >
                                                    <span className="btn-icon"><Fertilizer size={28} /></span>
                                                    Use Fertilizer
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p>This tile is empty and ready for planting.</p>
                                        
                                        <div className="form-group mt-md">
                                            <label className="form-label">Select Seed Type:</label>
                                            <div className="flex gap-sm mb-md">
                                                <button 
                                                    className={`btn ${cropType === 0 ? 'btn-primary' : 'btn-secondary'}`}
                                                    onClick={() => setCropType(0)}
                                                >
                                                    <SeedPacket cropType={0} size={28} /> Potato
                                                </button>
                                                <button 
                                                    className={`btn ${cropType === 1 ? 'btn-primary' : 'btn-secondary'}`}
                                                    onClick={() => setCropType(1)}
                                                >
                                                    <SeedPacket cropType={1} size={28} /> Tomato
                                                </button>
                                                <button 
                                                    className={`btn ${cropType === 2 ? 'btn-primary' : 'btn-secondary'}`}
                                                    onClick={() => setCropType(2)}
                                                >
                                                    <SeedPacket cropType={2} size={28} /> Strawberry
                                                </button>
                                            </div>
                                            
                                            <div className="seed-info">
                                                <p>Available Seeds: {
                                                    cropType === 0 ? inventory?.potatoSeeds || 0 :
                                                    cropType === 1 ? inventory?.tomatoSeeds || 0 :
                                                    inventory?.strawberrySeeds || 0
                                                }</p>
                                                <p>Growth Time: {
                                                    cropConfigs[cropType] ? 
                                                    Math.floor(cropConfigs[cropType].growthTime / 3600) + ' hours' : 
                                                    'Loading...'
                                                }</p>
                                            </div>
                                            
                                            <button 
                                                className="btn btn-plant w-full mt-md"
                                                onClick={plantCrop}
                                                disabled={
                                                    isWriting || 
                                                    (cropType === 0 && (!inventory || inventory.potatoSeeds === 0)) || 
                                                    (cropType === 1 && (!inventory || inventory.tomatoSeeds === 0)) || 
                                                    (cropType === 2 && (!inventory || inventory.strawberrySeeds === 0))
                                                }
                                            >
                                                <span className="btn-icon"><SeedPacket cropType={cropType} size={28} /></span>
                                                Plant {cropTypes[cropType].name} Seeds
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center p-lg">
                        <p className="mb-md">You don't have any farm tiles yet. Visit the shop to buy your first tile!</p>
                    </div>
                )}
            </div>
            
            {lastAction && Date.now() - lastActionTime < 3000 && (
                <div className="fixed bottom-4 right-4 bg-container p-md rounded-md shadow-md animate-slide-up">
                    <p>You successfully {lastAction} your crop! ✅</p>
                </div>
            )}
        </div>
    );
};

export default FarmManagerComponent;