import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import FarmManagerABI from '../../abis/FarmManager.abi.json';
import PlayerRegistryInventoryABI from '../../abis/PlayerRegistryInventory.abi.json';
import { CONTRACT_ADDRESSES } from '../../constants/contractAddresses';
import { useNotification } from '../notifications/NotificationSystem';
import FarmGrid from './FarmGrid';
import { 
  WaterBucket, 
  Fertilizer, 
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
  FertileMesh,
  ItemImages
} from '../../assets/ItemImages';
import itemRegistryService from '../../services/itemRegistryService';
import timeOracleService from '../../services/timeOracleService';
import InventoryItem from '../ui/InventoryItem';

// ItemID enum values for seeds based on GlobalEnumsAndStructs.sol
const SEED_ITEM_IDS = {
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
  GOLDEN_SEED_ITEM: 3,
  ANCIENT_APPLE_SEEDS: 21
};

// Other important item IDs
const ITEM_IDS = {
  CROPS_CURRENCY: 0,
  WATER_BUCKET: 1,
  FERTILIZER: 2,
  CRYSTAL_ESSENCE: 4,
  MOONLEAF: 5,
  ANCIENT_APPLE: 6,
  RAINBOW_SHARD: 7,
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

// CropID enum values based on GlobalEnumsAndStructs.sol
const CROP_IDS = {
  POTATO: 0,
  TOMATO: 1,
  STRAWBERRY: 2,
  CORN: 3,
  CARROT: 4,
  PUMPKIN: 5,
  WHEAT: 6,
  WATERMELON: 7,
  CACTUS: 8,
  GOLDEN_PLANT_CROP: 9,
  CRYSTAL_BERRIES: 10,
  MOONFLOWERS: 11,
  ANCIENT_GRAIN: 12,
  RAINBOW_FRUIT: 13
};

// Basic crop mapping
const basicCropInfo = {
  [CROP_IDS.POTATO]: { name: 'Potato', emoji: '🥔', seedId: SEED_ITEM_IDS.POTATO_SEED },
  [CROP_IDS.TOMATO]: { name: 'Tomato', emoji: '🍅', seedId: SEED_ITEM_IDS.TOMATO_SEED },
  [CROP_IDS.STRAWBERRY]: { name: 'Strawberry', emoji: '🍓', seedId: SEED_ITEM_IDS.STRAWBERRY_SEED },
  [CROP_IDS.CORN]: { name: 'Corn', emoji: '🌽', seedId: SEED_ITEM_IDS.CORN_SEED },
  [CROP_IDS.CARROT]: { name: 'Carrot', emoji: '🥕', seedId: SEED_ITEM_IDS.CARROT_SEED },
  [CROP_IDS.PUMPKIN]: { name: 'Pumpkin', emoji: '🎃', seedId: SEED_ITEM_IDS.PUMPKIN_SEED },
  [CROP_IDS.WHEAT]: { name: 'Wheat', emoji: '🌾', seedId: SEED_ITEM_IDS.WHEAT_SEED },
  [CROP_IDS.WATERMELON]: { name: 'Watermelon', emoji: '🍉', seedId: SEED_ITEM_IDS.WATERMELON_SEED },
  [CROP_IDS.CACTUS]: { name: 'Cactus', emoji: '🌵', seedId: SEED_ITEM_IDS.CACTUS_SEED },
  [CROP_IDS.GOLDEN_PLANT_CROP]: { name: 'Golden Plant', emoji: '✨', seedId: SEED_ITEM_IDS.GOLDEN_SEED_ITEM },
  [CROP_IDS.CRYSTAL_BERRIES]: { name: 'Crystal Berries', emoji: '💎', seedId: SEED_ITEM_IDS.CRYSTAL_BERRIES_SEED },
  [CROP_IDS.MOONFLOWERS]: { name: 'Moonflowers', emoji: '🌙', seedId: SEED_ITEM_IDS.MOONFLOWERS_SEED },
  [CROP_IDS.ANCIENT_GRAIN]: { name: 'Ancient Grain', emoji: '🌿', seedId: SEED_ITEM_IDS.ANCIENT_GRAIN_SEEDS_BUYABLE },
  [CROP_IDS.RAINBOW_FRUIT]: { name: 'Rainbow Fruit', emoji: '🌈', seedId: SEED_ITEM_IDS.RAINBOW_FRUIT_SEED }
};

const FarmManagerWrapper = () => {
    const { address } = useAccount();
    const notification = useNotification();
    const [selectedTile, setSelectedTile] = useState(0);
    const [selectedSeedId, setSelectedSeedId] = useState(SEED_ITEM_IDS.POTATO_SEED);
    const [inventory, setInventory] = useState({});
    const [tileInfo, setTileInfo] = useState(null);
    const [tileCount, setTileCount] = useState(0);
    const [growthPercentage, setGrowthPercentage] = useState(0);
    const [cropData, setCropData] = useState({});
    const [plantableSeeds, setPlantableSeeds] = useState([]);
    const [isWatering, setIsWatering] = useState(false);
    const [isHarvesting, setIsHarvesting] = useState(false);
    const [isFertilizing, setIsFertilizing] = useState(false);
    const [isPlanting, setIsPlanting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
    const [farmTiles, setFarmTiles] = useState([]);
    const [isMoonflowerHarvestWindow, setIsMoonflowerHarvestWindow] = useState(false);

    // Get player inventory from PlayerRegistryInventory
    const { data: inventoryData, refetch: refetchInventory } = useReadContract({
        address: CONTRACT_ADDRESSES.PlayerRegistryInventory,
        abi: PlayerRegistryInventoryABI,
        functionName: 'getPlayerFullInventory',
        args: [address],
        enabled: !!address,
        cacheTime: 30000, // 30 seconds cache
    });

    // Get player's farm tiles count
    const { data: playerProfile, refetch: refetchProfile } = useReadContract({
        address: CONTRACT_ADDRESSES.PlayerRegistryInventory,
        abi: PlayerRegistryInventoryABI,
        functionName: 'getPlayerProfile',
        args: [address],
        enabled: !!address,
        cacheTime: 30000, // 30 seconds cache
    });

    // Get player's plantable seeds
    const { data: plantableSeedsData, refetch: refetchPlantableSeeds } = useReadContract({
        address: CONTRACT_ADDRESSES.FarmManager,
        abi: FarmManagerABI,
        functionName: 'getPlayerPlantableSeeds',
        args: [address],
        enabled: !!address,
        cacheTime: 30000, // 30 seconds cache
    });

    // Get farm tile info
    const { data: tileInfoData, refetch: refetchTileInfo } = useReadContract({
        address: CONTRACT_ADDRESSES.FarmManager,
        abi: FarmManagerABI,
        functionName: 'getFarmTile',
        args: [address, selectedTile],
        enabled: !!address && tileCount > 0,
        cacheTime: 30000, // 30 seconds cache
    });

    // Get farm tiles data with multicall
    const { data: allTilesData, refetch: refetchAllTiles } = useReadContract({
        address: CONTRACT_ADDRESSES.FarmManager,
        abi: FarmManagerABI,
        functionName: 'getPlayerFarmTiles',
        args: [address],
        enabled: !!address && tileCount > 0,
        cacheTime: 30000, // 30 seconds cache
    });

    // Update current time less frequently (30 seconds) to reduce RPC calls
    useEffect(() => {
        // Use local time as primary source instead of making RPC calls
        const updateLocalTime = () => {
            setCurrentTime(Math.floor(Date.now() / 1000));
        };
        
        // Initialize with local time
        updateLocalTime();
        
        // Update local time frequently (every 5 seconds)
        const localTimeInterval = setInterval(updateLocalTime, 5000);
        
        return () => {
            clearInterval(localTimeInterval);
        };
    }, []);

    // Get all crop data - reduce frequency by using a ref to track initial load
    const cropDataLoaded = useRef(false);
    useEffect(() => {
        const fetchAllCropData = async () => {
            if (address && !cropDataLoaded.current) {
                try {
                    const cropIds = await itemRegistryService.getAllCropIDs();
                    const cropsDataObj = {};
                    
                    for (const cropId of cropIds) {
                        const data = await itemRegistryService.getCropData(cropId);
                        cropsDataObj[cropId] = data;
                    }
                    
                    setCropData(cropsDataObj);
                    cropDataLoaded.current = true;
                } catch (error) {
                    console.error("Error fetching crop data:", error);
                }
            }
        };
        
        fetchAllCropData();
    }, [address]);

    // Get all farm tiles
    const fetchAllFarmTiles = async () => {
        if (!address || tileCount <= 0) return;
        
        try {
            let tiles = [];
            
            // Use allTilesData if available (from contract multicall)
            if (allTilesData && allTilesData.length > 0) {
                tiles = allTilesData.map((tileData, i) => {
                    // Process tile data from blockchain
                    const plantedAt = Number(tileData.plantedAt || 0);
                    const maturityTime = Number(tileData.maturityTime || 0);
                    
                    return {
                        index: i,
                        plantedCrop: Number(tileData.plantedCrop || 0),
                        plantedAt: plantedAt,
                        lastWateredAt: Number(tileData.lastWateredAt || 0),
                        waterCount: Number(tileData.waterCount || 0),
                        isFertilized: tileData.isFertilized || false,
                        maturityTime: maturityTime,
                        isLocked: tileData.isLocked || false,
                        // Computed properties
                        isEmpty: plantedAt === 0,
                        isReady: maturityTime <= currentTime && plantedAt > 0
                    };
                });
            } 
            // Fall back to individual tile data when available
            else {
                for (let i = 0; i < tileCount; i++) {
                    // If current tile, use the already fetched data
                    if (i === selectedTile && tileInfoData) {
                        tiles.push({
                            index: i,
                            plantedCrop: Number(tileInfoData.plantedCrop),
                            plantedAt: Number(tileInfoData.plantedAt),
                            lastWateredAt: Number(tileInfoData.lastWateredAt),
                            waterCount: Number(tileInfoData.waterCount),
                            isFertilized: tileInfoData.isFertilized,
                            maturityTime: Number(tileInfoData.maturityTime),
                            isLocked: tileInfoData.isLocked,
                            // Computed properties
                            isEmpty: Number(tileInfoData.plantedAt) === 0,
                            isReady: Number(tileInfoData.maturityTime) <= currentTime && Number(tileInfoData.plantedAt) > 0
                        });
                    } 
                    // For other tiles, try to preserve existing data if available
                    else if (farmTiles[i] && farmTiles[i].plantedAt > 0) {
                        // Update time-dependent properties while keeping core data
                        const isReady = farmTiles[i].maturityTime <= currentTime && farmTiles[i].plantedAt > 0;
                        tiles.push({
                            ...farmTiles[i],
                            isReady
                        });
                    }
                    // Otherwise use placeholder
                    else {
                        tiles.push({
                            index: i,
                            plantedCrop: 0,
                            plantedAt: 0,
                            lastWateredAt: 0,
                            waterCount: 0,
                            isFertilized: false,
                            maturityTime: 0,
                            isLocked: false,
                            isEmpty: true,
                            isReady: false
                        });
                    }
                }
            }
            
            setFarmTiles(tiles);
        } catch (error) {
            console.error("Error fetching all farm tiles:", error);
        }
    };

    // Update farm tiles with optimized dependencies
    const farmTilesUpdateRef = useRef(0);
    useEffect(() => {
        // Only update every 5 seconds maximum unless allTilesData changes
        const now = Date.now();
        if (
            tileCount > 0 && 
            (
                allTilesData || // Always update if allTilesData changes
                now - farmTilesUpdateRef.current > 5000 // Otherwise limit to every 5 seconds
            )
        ) {
            farmTilesUpdateRef.current = now;
            fetchAllFarmTiles();
        }
    }, [tileCount, allTilesData, currentTime, selectedTile, tileInfoData]);
    
    useEffect(() => {
        if (playerProfile) {
            setTileCount(Number(playerProfile.farmTilesCount));
        }

        if (inventoryData) {
            const inventoryObj = {};
            inventoryData[0].forEach((id, index) => {
                inventoryObj[Number(id)] = Number(inventoryData[1][index]);
            });
            setInventory(inventoryObj);
        }

        if (plantableSeedsData) {
            const seeds = [];
            // plantableSeedsData is an array of objects, not a 2D array
            // Each object has: cropId, cropName, seedId, seedName, amountOwned
            plantableSeedsData.forEach((seedInfo) => {
                if (Number(seedInfo.amountOwned) > 0) {
                    seeds.push({
                        id: Number(seedInfo.seedId),
                        count: Number(seedInfo.amountOwned),
                        name: seedInfo.seedName || getSeedNameFromId(Number(seedInfo.seedId)),
                        cropId: Number(seedInfo.cropId)
                    });
                }
            });
            setPlantableSeeds(seeds);
            
            // Set default selected seed if available
            if (seeds.length > 0 && !plantableSeeds.some(seed => seed.id === selectedSeedId)) {
                setSelectedSeedId(seeds[0].id);
            }
        }

        if (tileInfoData) {
            const processedTileInfo = {
                plantedCrop: Number(tileInfoData.plantedCrop),
                plantedAt: Number(tileInfoData.plantedAt),
                lastWateredAt: Number(tileInfoData.lastWateredAt),
                waterCount: Number(tileInfoData.waterCount),
                isFertilized: tileInfoData.isFertilized,
                maturityTime: Number(tileInfoData.maturityTime),
                isLocked: tileInfoData.isLocked,
                isEmpty: Number(tileInfoData.plantedAt) === 0,
                isReady: Number(tileInfoData.maturityTime) <= currentTime && Number(tileInfoData.plantedAt) > 0
            };
            setTileInfo(processedTileInfo);
            
            // Check if this is a Moonflower crop
            if (processedTileInfo.plantedCrop === CROP_IDS.MOONFLOWERS && !processedTileInfo.isEmpty) {
                // Check if it's currently in harvest window
                timeOracleService.isMoonflowerHarvestWindow()
                    .then(result => setIsMoonflowerHarvestWindow(result))
                    .catch(error => console.error("Error checking Moonflower harvest window:", error));
            }
            
            // Calculate growth percentage if crop is planted
            if (!processedTileInfo.isEmpty && !processedTileInfo.isReady) {
                const plantedTime = processedTileInfo.plantedAt;
                const maturityTime = processedTileInfo.maturityTime;
                const growthDuration = maturityTime - plantedTime;
                
                if (growthDuration > 0) {
                    const timePassed = currentTime - plantedTime;
                    const percentage = Math.min(100, Math.max(0, (timePassed / growthDuration) * 100));
                    setGrowthPercentage(percentage);
                } else {
                    setGrowthPercentage(100);
                }
            } else if (processedTileInfo.isReady) {
                setGrowthPercentage(100);
            } else {
                setGrowthPercentage(0);
            }
        }
    }, [inventoryData, playerProfile, plantableSeedsData, tileInfoData, currentTime]);

    // Also update the Moonflower harvest window status every minute if we're viewing Moonflowers
    useEffect(() => {
        // Only set up the interval if we're viewing a Moonflower crop
        if (tileInfo && tileInfo.plantedCrop === CROP_IDS.MOONFLOWERS && !tileInfo.isEmpty) {
            const checkHarvestWindow = async () => {
                try {
                    const result = await timeOracleService.isMoonflowerHarvestWindow();
                    setIsMoonflowerHarvestWindow(result);
                } catch (error) {
                    console.error("Error checking Moonflower harvest window:", error);
                }
            };
            
            // Check immediately
            checkHarvestWindow();
            
            // Then check every minute
            const intervalId = setInterval(checkHarvestWindow, 60000);
            
            return () => clearInterval(intervalId);
        }
    }, [tileInfo]);

    const { writeContractAsync: writeContract } = useWriteContract();

    // Modified to use all tiles data properly
    const isRareCropAlreadyPlanted = (cropId) => {
        // If we don't have full data yet, use farmTiles as fallback
        const tilesToCheck = allTilesData || farmTiles;
        
        if (!tilesToCheck || tilesToCheck.length === 0) return false;
        
        // For Rainbow Fruit, check if any crop is planted at all
        if (cropId === CROP_IDS.RAINBOW_FRUIT) {
            return tilesToCheck.some(tile => 
                tile && !tile.isEmpty && Number(tile.plantedAt || 0) > 0
            );
        }
        
        // For other rare crops, check if the specific crop type is already planted
        return tilesToCheck.some(tile => 
            tile && !tile.isEmpty && Number(tile.plantedCrop) === cropId && Number(tile.plantedAt || 0) > 0
        );
    };
    
    // Check if a seed is a rare crop seed
    const isRareSeed = (seedId) => {
        return seedId === SEED_ITEM_IDS.CRYSTAL_BERRIES_SEED || 
               seedId === SEED_ITEM_IDS.MOONFLOWERS_SEED ||
               seedId === SEED_ITEM_IDS.ANCIENT_GRAIN_SEEDS_BUYABLE ||
               seedId === SEED_ITEM_IDS.RAINBOW_FRUIT_SEED;
    };
    
    // Get crop ID from seed ID
    const getCropIdFromSeedId = (seedId) => {
        for (const [cropId, info] of Object.entries(basicCropInfo)) {
            if (info.seedId === seedId) {
                return Number(cropId);
            }
        }
        return -1;
    };

    // Helper function to refetch data after an action with staggered timeouts to prevent RPC floods
    const refetchDataAfterAction = () => {
        setTimeout(() => refetchTileInfo(), 1000);
        setTimeout(() => refetchInventory(), 2000);
        setTimeout(() => refetchAllTiles(), 3000);
        setTimeout(() => refetchPlantableSeeds(), 4000);
    };

    const plantCrop = async () => {
        if (!address) return;
        
        const cropId = getCropIdFromSeedId(selectedSeedId);
        
        // Special handling for Rainbow Fruit
        if (selectedSeedId === SEED_ITEM_IDS.RAINBOW_FRUIT_SEED) {
            if (tileCount < 12) {
                notification.error("Rainbow Fruit requires at least 12 farm tiles.");
                return;
            }
            
            const hasCropsPlanted = farmTiles.some(tile => !tile.isEmpty);
            if (hasCropsPlanted) {
                notification.error("All farm tiles must be empty to plant Rainbow Fruit.");
                return;
            }
        }
        
        // Check for rare crop restrictions
        if (isRareSeed(selectedSeedId)) {
            const rareCropId = getCropIdFromSeedId(selectedSeedId);
            if (isRareCropAlreadyPlanted(rareCropId)) {
                notification.error(`You can only plant one ${basicCropInfo[rareCropId].name} at a time.`);
                return;
            }
        }
        
        try {
            setIsPlanting(true);
            
            await writeContract({
                address: CONTRACT_ADDRESSES.FarmManager,
                abi: FarmManagerABI,
                functionName: 'plantCrop',
                args: [selectedTile, selectedSeedId]
            });
            
            notification.success(`🌱 Planted ${getSeedNameFromId(selectedSeedId)}!`);
            
            // Stagger refetch calls to avoid RPC floods
            refetchDataAfterAction();
            
            setTimeout(() => {
                setIsPlanting(false);
            }, 2500);
        } catch (error) {
            console.error("Plant crop error:", error);
            setIsPlanting(false);
            notification.error(`Failed to plant: ${error.message}`);
        }
    };

    const waterCrop = async () => {
        if (!address) return;
        try {
            setIsWatering(true);
            
            await writeContract({
                address: CONTRACT_ADDRESSES.FarmManager,
                abi: FarmManagerABI,
                functionName: 'waterCrop',
                args: [selectedTile]
            });
            
            notification.success(`💧 Watered crop on tile ${selectedTile + 1}!`);
            
            // Stagger refetch calls to avoid RPC floods
            refetchDataAfterAction();
            
            setTimeout(() => {
                setIsWatering(false);
            }, 2500);
        } catch (error) {
            console.error("Water crop error:", error);
            setIsWatering(false);
            notification.error(`Failed to water: ${error.message}`);
        }
    };

    const harvestCrop = async () => {
        if (!address) return;
        try {
            // Check if the current crop is Moonflowers
            if (tileInfo && tileInfo.plantedCrop === CROP_IDS.MOONFLOWERS) {
                // Check if it's currently the Moonflowers harvest window
                const isHarvestWindow = await timeOracleService.isMoonflowerHarvestWindow();
                
                if (!isHarvestWindow) {
                    notification.warning("🌙 Moonflowers can only be harvested between 2-4 AM UTC!");
                    return;
                }
            }
            
            setIsHarvesting(true);
            
            await writeContract({
                address: CONTRACT_ADDRESSES.FarmManager,
                abi: FarmManagerABI,
                functionName: 'harvestCrop',
                args: [selectedTile]
            });
            
            notification.success(`🌾 Harvested crop from tile ${selectedTile + 1}!`);
            
            // Stagger refetch calls to avoid RPC floods
            refetchDataAfterAction();
            
            setTimeout(() => {
                setIsHarvesting(false);
            }, 2500);
        } catch (error) {
            console.error("Harvest crop error:", error);
            setIsHarvesting(false);
            notification.error(`Failed to harvest: ${error.message}`);
        }
    };

    const fertilizeCrop = async () => {
        if (!address) return;
        try {
            setIsFertilizing(true);
            
            await writeContract({
                address: CONTRACT_ADDRESSES.FarmManager,
                abi: FarmManagerABI,
                functionName: 'fertilizeCrop',
                args: [selectedTile]
            });
            
            notification.success(`🧪 Applied fertilizer to tile ${selectedTile + 1}!`);
            
            // Stagger refetch calls to avoid RPC floods
            refetchDataAfterAction();
            
            setTimeout(() => {
                setIsFertilizing(false);
            }, 2500);
        } catch (error) {
            console.error("Use fertilizer error:", error);
            setIsFertilizing(false);
            notification.error(`Failed to use fertilizer: ${error.message}`);
        }
    };

    // Handle tile selection from FarmGrid
    const handleTileSelect = (tileIndex) => {
        setSelectedTile(tileIndex);
    };

    // Get seed name from seed ID
    const getSeedNameFromId = (seedId) => {
        // First check if we can find the seed in our crop info
        for (const [_, info] of Object.entries(basicCropInfo)) {
            if (info.seedId === seedId) {
                return `${info.name} Seeds`;
            }
        }

        // Fallback for known seed types
        const seedNames = {
            [SEED_ITEM_IDS.POTATO_SEED]: "Potato Seeds",
            [SEED_ITEM_IDS.TOMATO_SEED]: "Tomato Seeds",
            [SEED_ITEM_IDS.STRAWBERRY_SEED]: "Strawberry Seeds",
            [SEED_ITEM_IDS.CORN_SEED]: "Corn Seeds",
            [SEED_ITEM_IDS.CARROT_SEED]: "Carrot Seeds",
            [SEED_ITEM_IDS.PUMPKIN_SEED]: "Pumpkin Seeds",
            [SEED_ITEM_IDS.WHEAT_SEED]: "Wheat Seeds",
            [SEED_ITEM_IDS.WATERMELON_SEED]: "Watermelon Seeds",
            [SEED_ITEM_IDS.CACTUS_SEED]: "Cactus Seeds",
            [SEED_ITEM_IDS.CRYSTAL_BERRIES_SEED]: "Crystal Berries Seeds",
            [SEED_ITEM_IDS.MOONFLOWERS_SEED]: "Moonflowers Seeds",
            [SEED_ITEM_IDS.ANCIENT_GRAIN_SEEDS_BUYABLE]: "Ancient Grain Seeds",
            [SEED_ITEM_IDS.RAINBOW_FRUIT_SEED]: "Rainbow Fruit Seeds",
            [SEED_ITEM_IDS.GOLDEN_SEED_ITEM]: "Golden Seeds"
        };
        
        return seedNames[seedId] || `Seed #${seedId}`;
    };

    // Get crop emoji from ID
    const getCropEmojiFromId = (cropId) => {
        return basicCropInfo[cropId]?.emoji || '🌱';
    };

    // Format time remaining until maturity
    const formatTimeRemaining = (maturityTime) => {
        const timeLeft = Math.max(0, maturityTime - currentTime);
        
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;
        
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    // Format CROPS amount for display
    const formatCrops = (amount) => {
        return (amount / (10**18)).toFixed(2);
    };

    // Add a helper function to get the appropriate icon for an item
    const getItemIcon = (itemId, size = 50) => {
        if (SEED_ITEM_IDS[Object.keys(SEED_ITEM_IDS).find(key => SEED_ITEM_IDS[key] === itemId)]) {
            // If it's a seed, return SeedPacket with the appropriate crop type
            const cropId = Object.entries(basicCropInfo).find(
                ([, value]) => value.seedId === itemId
            )?.[0] || 0;
            return <SeedPacket cropType={Number(cropId)} size={size} />;
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
            [ITEM_IDS.FERTILE_MESH]: <FertileMesh size={size} />
        };
        
        // Return the specific icon for the item ID, or fall back to a generic icon
        return itemIconMap[itemId] || <ItemImages.TilePlot size={size} />;
    };

    // Helper to get item name
    const getItemName = (itemId) => {
        // Check if it's a seed
        const seedName = Object.keys(SEED_ITEM_IDS).find(key => SEED_ITEM_IDS[key] === itemId);
        if (seedName) {
            return seedName.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');
        }

        // Check other common items
        const itemNames = {
            [ITEM_IDS.CROPS_CURRENCY]: "CROPS Token",
            [ITEM_IDS.WATER_BUCKET]: "Water Bucket",
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
            [ITEM_IDS.BLUEPRINT_MONADIUM_HOE]: "Monadium Hoe Blueprint"
        };

        return itemNames[itemId] || `Item #${itemId}`;
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
                        <button 
                            className="btn btn-sm btn-secondary" 
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? 'Hide Details' : 'Show Details'}
                        </button>
                    </div>
                    
                    <div className={`inventory-grid ${isExpanded ? 'expanded' : ''}`} style={{ paddingBottom: '3rem' }}>
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
                    
                    {isExpanded && cropData && (
                        <div className="inventory-details">
                            <div className="card p-md mt-md">
                                <h4>Crop Growth Times</h4>
                                <div className="grid grid-cols-3 gap-md mt-sm">
                                    {Object.values(basicCropInfo).slice(0, 6).map((crop, index) => {
                                        const cropDataInfo = cropData[index];
                                        return (
                                            <div key={index} className="text-center">
                                                <div className="text-xl mb-xs">{crop.emoji}</div>
                                                <div className="font-bold">{crop.name}</div>
                                                {cropDataInfo && (
                                                    <>
                                                        <div className="text-sm text-secondary">
                                                            {Math.floor(cropDataInfo.baseGrowthTimeInSeconds / 3600)} hours
                                                        </div>
                                                        <div className="text-success text-sm mt-xs">
                                                            Yield: {formatCrops(cropDataInfo.baseYield)} CROPS
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            <FarmGrid
                selectedTile={selectedTile}
                setSelectedTile={setSelectedTile}
                tileInfo={tileInfo}
                tileCount={tileCount}
                farmTiles={farmTiles}
                isWatering={isWatering}
                isHarvesting={isHarvesting}
                isFertilizing={isFertilizing}
                isPlanting={isPlanting}
                onTileSelect={handleTileSelect}
                getCropEmojiFromId={getCropEmojiFromId}
                currentTime={currentTime}
            />
            
            {tileInfo && (
                <div className="tile-details card">
                    <h3>Tile {selectedTile + 1} Details</h3>
                    
                    {!tileInfo.isEmpty ? (
                        <div>
                            <div className="flex gap-md items-center mb-md">
                                <div className="tile-crop-icon">
                                    <SeedPacket cropType={tileInfo.plantedCrop} size={36} />
                                </div>
                                <div>
                                    <div className="font-bold text-xl">
                                        {basicCropInfo[tileInfo.plantedCrop]?.name || `Crop #${tileInfo.plantedCrop}`}
                                    </div>
                                    <div className="text-secondary">
                                        Planted on {new Date(tileInfo.plantedAt * 1000).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="status-badge mb-md">
                                Status: 
                                {tileInfo.isReady ? (
                                    <span className="badge badge-success ml-sm">Ready to Harvest! 🌟</span>
                                ) : tileInfo.isFertilized ? (
                                    <span className="badge badge-primary ml-sm">Fertilized 🧪</span>
                                ) : tileInfo.waterCount > 0 ? (
                                    <span className="badge badge-primary ml-sm">Growing... 🌱</span>
                                ) : (
                                    <span className="badge badge-warning ml-sm">Needs Water 💧</span>
                                )}
                            </div>
                            
                            {tileInfo.waterCount > 0 && !tileInfo.isReady && (
                                <div className="mb-md">
                                    <div className="flex justify-between mb-xs">
                                        <div>Growth Progress:</div>
                                        <div>{Math.floor(growthPercentage)}%</div>
                                    </div>
                                    <div className="growth-progress">
                                        <div 
                                            className="growth-fill" 
                                            style={{ width: `${growthPercentage}%` }}
                                        ></div>
                                    </div>
                                    
                                    {tileInfo.maturityTime > currentTime && (
                                        <div className="text-center text-secondary mt-sm">
                                            Ready in: {formatTimeRemaining(tileInfo.maturityTime)}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <div className="crop-details mb-md">
                                <div className="grid grid-cols-3 gap-sm">
                                    <div className="detail-item">
                                        <div className="detail-label">Water Count</div>
                                        <div className="detail-value">{tileInfo.waterCount}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Fertilized</div>
                                        <div className="detail-value">{tileInfo.isFertilized ? 'Yes' : 'No'}</div>
                                    </div>
                                    <div className="detail-item">
                                        <div className="detail-label">Locked</div>
                                        <div className="detail-value">{tileInfo.isLocked ? 'Yes' : 'No'}</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Moonflower-specific harvest window information */}
                            {tileInfo.plantedCrop === CROP_IDS.MOONFLOWERS && (
                                <div className={`moonflower-info mb-md p-sm ${isMoonflowerHarvestWindow ? 'bg-success-light' : 'bg-warning-light'}`} style={{
                                    backgroundColor: isMoonflowerHarvestWindow ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
                                    borderLeft: `3px solid ${isMoonflowerHarvestWindow ? '#4CAF50' : '#FF9800'}`,
                                    borderRadius: '4px',
                                    padding: '10px'
                                }}>
                                    <p style={{ margin: '0', fontSize: '0.9rem' }}>
                                        <span className="font-bold">🌙 Moonflower Harvest Window:</span> {' '}
                                        {isMoonflowerHarvestWindow ? (
                                            <span className="text-success">OPEN NOW! (2-4 AM UTC)</span>
                                        ) : (
                                            <span>Closed. Moonflowers can only be harvested between 2-4 AM UTC.</span>
                                        )}
                                    </p>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>
                                        Current UTC time: {new Date().toUTCString().split(' ')[4]}
                                    </p>
                                </div>
                            )}
                            
                            <div className="tile-actions">
                                {!tileInfo.isReady && !tileInfo.isFertilized && tileInfo.waterCount === 0 && inventory && (inventory[ITEM_IDS.WATER_BUCKET] || 0) > 0 && (
                                    <button 
                                        className="btn btn-water"
                                        onClick={waterCrop}
                                        disabled={isWatering}
                                    >
                                        <span className="btn-icon">💧</span>
                                        Water Crop
                                    </button>
                                )}
                                
                                {tileInfo.isReady && (
                                    <button 
                                        className="btn btn-harvest"
                                        onClick={harvestCrop}
                                        disabled={isHarvesting || (tileInfo.plantedCrop === CROP_IDS.MOONFLOWERS && !isMoonflowerHarvestWindow)}
                                        title={tileInfo.plantedCrop === CROP_IDS.MOONFLOWERS && !isMoonflowerHarvestWindow ? 
                                            "Moonflowers can only be harvested between 2-4 AM UTC" : ""}
                                    >
                                        <span className="btn-icon">🌾</span>
                                        Harvest Crop
                                    </button>
                                )}
                                
                                {!tileInfo.isReady && !tileInfo.isFertilized && inventory && (inventory[ITEM_IDS.FERTILIZER] || 0) > 0 && (
                                    <button 
                                        className="btn btn-fertilize"
                                        onClick={fertilizeCrop}
                                        disabled={isFertilizing}
                                    >
                                        <span className="btn-icon">🧪</span>
                                        Use Fertilizer
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="mb-md">This tile is empty and ready for planting.</p>
                            
                            {plantableSeeds.length > 0 ? (
                                <>
                                    <div className="mb-md">
                                        <div className="font-bold mb-sm">Select Seed Type:</div>
                                        <div className="flex flex-wrap gap-sm">
                                            {plantableSeeds.map((seed) => (
                                                <button 
                                                    key={seed.id}
                                                    className={`btn ${selectedSeedId === seed.id ? 'btn-primary' : 'btn-secondary'}`}
                                                    onClick={() => setSelectedSeedId(seed.id)}
                                                >
                                                    {getCropEmojiFromId(
                                                        Object.entries(basicCropInfo).find(
                                                            ([, value]) => value.seedId === seed.id
                                                        )?.[0] || 0
                                                    )} {seed.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="seed-info bg-container p-md rounded-md mb-md">
                                        <div className="grid grid-cols-2 gap-md">
                                            <div>
                                                <div className="text-secondary">Available Seeds:</div>
                                                <div className="font-bold">
                                                    {plantableSeeds.find(seed => seed.id === selectedSeedId)?.count || 0}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-secondary">Growth Time:</div>
                                                <div className="font-bold">
                                                    {(() => {
                                                        const cropId = Object.entries(basicCropInfo).find(
                                                            ([, value]) => value.seedId === selectedSeedId
                                                        )?.[0];
                                                        return cropId && cropData[cropId] 
                                                            ? Math.floor(cropData[cropId].baseGrowthTimeInSeconds / 3600) + ' hours'
                                                            : 'Loading...';
                                                    })()}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-secondary">Yield:</div>
                                                <div className="font-bold text-success">
                                                    {(() => {
                                                        const cropId = Object.entries(basicCropInfo).find(
                                                            ([, value]) => value.seedId === selectedSeedId
                                                        )?.[0];
                                                        return cropId && cropData[cropId]
                                                            ? formatCrops(cropData[cropId].baseYield) + ' CROPS'
                                                            : 'Loading...';
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {isRareSeed(selectedSeedId) && (
                                        <div className="rare-crop-warning mt-md p-sm" style={{
                                            backgroundColor: 'rgba(255, 152, 0, 0.2)',
                                            borderLeft: '3px solid #FF9800',
                                            borderRadius: '4px',
                                            padding: '10px'
                                        }}>
                                            <p style={{ margin: '0', fontSize: '0.9rem' }}>
                                                <span className="font-bold">⚠️ Rare Crop Restriction:</span> {' '}
                                                {selectedSeedId === SEED_ITEM_IDS.RAINBOW_FRUIT_SEED ? (
                                                    <>
                                                        Rainbow Fruit requires at least 12 farm tiles and all tiles must be empty.
                                                        {tileCount < 12 && <span className="text-error block mt-xs">You need {12 - tileCount} more tiles.</span>}
                                                    </>
                                                ) : (
                                                    <>You can only plant one {getSeedNameFromId(selectedSeedId)} at a time.</>
                                                )}
                                                {isRareCropAlreadyPlanted(getCropIdFromSeedId(selectedSeedId)) && (
                                                    <span className="text-error block mt-xs">
                                                        You already have this rare crop planted.
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* Only show plant button if not a rare crop that's already planted */}
                                    {!(isRareSeed(selectedSeedId) && isRareCropAlreadyPlanted(getCropIdFromSeedId(selectedSeedId))) && (
                                        <button 
                                            className="btn btn-plant w-full mt-md"
                                            onClick={plantCrop}
                                            disabled={
                                                isPlanting || 
                                                !selectedSeedId || 
                                                (inventory[selectedSeedId] === 0) || 
                                                (selectedSeedId === SEED_ITEM_IDS.RAINBOW_FRUIT_SEED && tileCount < 12)
                                            }
                                        >
                                            <span className="btn-icon"><SeedPacket cropType={getCropIdFromSeedId(selectedSeedId)} size={28} /></span>
                                            Plant {getSeedNameFromId(selectedSeedId)}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="seed-info bg-container p-md rounded-md mb-md">
                                    <p className="text-center text-secondary">
                                        You don't have any seeds available to plant.
                                        Visit the shop to purchase seeds!
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FarmManagerWrapper;