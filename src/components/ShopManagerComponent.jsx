import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatEther, parseEther } from 'viem';
import { useProgress } from '../context/ProgressContext';
import { useNotification } from './notifications/NotificationSystem';
import { ShopItem } from './ui/ShopItem';
import { LoadingOverlay } from './ui/LoadingOverlay';
import { CONTRACT_ADDRESSES } from '../constants/contractAddresses';
import { CHAIN_ID } from '../constants/networkConfig';
import PlayerRegistryInventoryABI from '../abis/PlayerRegistryInventory.abi.json';
import ShopManagerABI from '../abis/ShopManager.abi.json';
import CROPS_TokenABI from '../abis/CROPS_Token.abi.json';
import ItemRegistryABI from '../abis/ItemRegistry.abi.json';
import TimeOracleABI from '../abis/TimeOracle.abi.json';
import { 
  SeedPacket, 
  WaterBucket, 
  Fertilizer, 
  CropsToken as CropsTokenIcon,
  Wood,
  Fabric,
  EssenceExtractor,
  FertileMesh,
  ItemImages
} from '../assets/ItemImages';
import timeOracleService from '../services/timeOracleService';
import itemRegistryService from '../services/itemRegistryService';

import '../styles/shop.css';

// ItemID enum values for seeds based on GlobalEnumsAndStructs.sol
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
  FARM_TILE_ITEM: 36,
  ANCIENT_GRAIN_SEEDS_BUYABLE: 20
};

// Explicit list of seed ItemIDs
const SEED_ITEM_IDS = [
    ITEM_IDS.POTATO_SEED, ITEM_IDS.TOMATO_SEED, ITEM_IDS.STRAWBERRY_SEED,
    ITEM_IDS.CORN_SEED, ITEM_IDS.CARROT_SEED, ITEM_IDS.PUMPKIN_SEED,
    ITEM_IDS.WHEAT_SEED, ITEM_IDS.WATERMELON_SEED, ITEM_IDS.CACTUS_SEED,
    ITEM_IDS.CRYSTAL_BERRIES_SEED, ITEM_IDS.MOONFLOWERS_SEED, ITEM_IDS.GOLDEN_SEED_ITEM,
    ITEM_IDS.RAINBOW_FRUIT_SEED, ITEM_IDS.ANCIENT_GRAIN_SEEDS_BUYABLE, ITEM_IDS.ANCIENT_APPLE_SEEDS
];

// Explicit list of tool/material ItemIDs
const TOOL_MATERIAL_ITEM_IDS = [
    ITEM_IDS.WATER_BUCKET, ITEM_IDS.FERTILIZER, ITEM_IDS.ESSENCE_EXTRACTOR,
    ITEM_IDS.WOOD, ITEM_IDS.FABRIC,
    ITEM_IDS.LUNAR_HARVESTER_ITEM, ITEM_IDS.MONADIUM_SICKLE_ITEM, ITEM_IDS.MONADIUM_HOE_ITEM
];

// ItemType enum
const ITEM_TYPES = {
  GENERAL: 0,
  SEED: 1,
  FARMHAND: 2,
  BLUEPRINT: 3,
  FARM_ENHANCEMENT: 4
};

// Add this function before the ShopManagerComponent definition to identify rare crops
const isRareCrop = (itemId) => {
    return itemId === ITEM_IDS.CRYSTAL_BERRIES_SEED || 
           itemId === ITEM_IDS.MOONFLOWERS_SEED || 
           itemId === ITEM_IDS.RAINBOW_FRUIT_SEED ||
           itemId === ITEM_IDS.ANCIENT_GRAIN_SEEDS_BUYABLE;
};

const ShopManagerComponent = () => {
    const { address, isConnected } = useAccount();
    const notification = useNotification();
    const { updateStats } = useProgress();
    
    const [activeCategory, setActiveCategory] = useState('all');
    const [seedAmount, setSeedAmount] = useState(1);
    const [prices, setPrices] = useState({});
    const [tileCount, setTileCount] = useState(0);
    const [balance, setBalance] = useState(0);
    const [fertilizerCooldown, setFertilizerCooldown] = useState(0);
    const [countdownInterval, setCountdownInterval] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [buyableItems, setBuyableItems] = useState([]);
    const [inventory, setInventory] = useState({});
    const [itemNames, setItemNames] = useState({});
    const [loadingText, setLoadingText] = useState("Loading Shop...");
    const [playerTier, setPlayerTier] = useState(0);
    const [tokenAllowance, setTokenAllowance] = useState(0);
    const [tokenDecimals, setTokenDecimals] = useState(18);

    // Get token decimals
    const { data: decimalsData } = useReadContract({
        address: CONTRACT_ADDRESSES.CROPS_Token,
        abi: CROPS_TokenABI,
        functionName: 'decimals',
        enabled: !!address,
    });

    // Set token decimals when data is received
    useEffect(() => {
        if (decimalsData !== undefined) {
            setTokenDecimals(Number(decimalsData));
        }
    }, [decimalsData]);

    // Get player's CROPS token balance
    const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
        address: CONTRACT_ADDRESSES.CROPS_Token,
        abi: CROPS_TokenABI,
        functionName: 'balanceOf',
        args: [address],
        enabled: !!address,
    });

    // Get token allowance for ShopManager contract
    const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
        address: CONTRACT_ADDRESSES.CROPS_Token,
        abi: CROPS_TokenABI,
        functionName: 'allowance',
        args: [address, CONTRACT_ADDRESSES.ShopManager],
        enabled: !!address,
    });

    // Get player profile info (including farm tile count)
    const { data: playerProfile, refetch: refetchProfile } = useReadContract({
        address: CONTRACT_ADDRESSES.PlayerRegistryInventory,
        abi: PlayerRegistryInventoryABI,
        functionName: 'getPlayerProfile',
        args: [address],
        enabled: !!address,
    });
    
    // Get player's inventory
    const { data: inventoryData, refetch: refetchInventory } = useReadContract({
        address: CONTRACT_ADDRESSES.PlayerRegistryInventory,
        abi: PlayerRegistryInventoryABI,
        functionName: 'getPlayerFullInventory',
        args: [address],
        enabled: !!address,
    });

    // Get fertilizer cooldown status from TimeOracle
    const { data: fertilizerCooldownData, refetch: refetchFertilizerCooldown } = useReadContract({
        address: CONTRACT_ADDRESSES.TimeOracle,
        abi: TimeOracleABI,
        functionName: 'getTimeToCooldownEnd',
        args: [address, 1], // 1 is the fertilizer cooldown type
        enabled: !!address,
    });

    // Get all buyable items from ItemRegistry
    useEffect(() => {
        let isMounted = true;
        const fetchBuyableItems = async () => {
            if (!address) return;
            
            try {
                setLoadingText("Loading Shop Items...");
                setIsLoading(true);
                console.log("Fetching buyable items...");
                
                // Get all item IDs first
                const itemIDs = await itemRegistryService.getAllItemIDs();
                console.log("Item IDs:", itemIDs);
                
                if (!isMounted) return;
                
                // Add basic crops that might be missing (override contract settings)
                // These should always be available in the shop regardless of contract settings
                const essentialCrops = [
                    ITEM_IDS.POTATO_SEED,
                    ITEM_IDS.TOMATO_SEED,
                    ITEM_IDS.STRAWBERRY_SEED,
                    ITEM_IDS.RAINBOW_FRUIT_SEED, // Ensure Rainbow Fruit is included (ID 19)
                    ITEM_IDS.ANCIENT_GRAIN_SEEDS_BUYABLE // Ensure Ancient Grain is included
                ];
                
                // Explicitly excluded items that should not be in the shop
                const excludedItems = [
                    ITEM_IDS.ANCIENT_APPLE_SEEDS // Exclude Ancient Apple Seeds as they are not purchasable
                ];
                
                // Get data for individual items
                const items = [];
                for (const id of itemIDs) {
                    // Skip excluded items
                    if (excludedItems.includes(id)) {
                        console.log(`Skipping excluded item ID ${id}`);
                        continue;
                    }
                    
                    try {
                        const itemData = await itemRegistryService.getItemData(id);
                        console.log(`Item ${id} data:`, itemData);
                        
                        // Add essential crop seeds regardless of isBuyable flag
                        if (essentialCrops.includes(id)) {
                            // Make a copy of the data with isBuyable set to true
                            const modifiedData = {
                                ...itemData,
                                isBuyable: true,
                                // Set prices for starter seeds if they're 0
                                purchasePrice: itemData.purchasePrice || 20, // Default price if not set
                                // Set tier requirements for special seeds
                                tierRequirement: id === ITEM_IDS.CRYSTAL_BERRIES_SEED ? 0 : // BEGINNER tier (0)
                                                id === ITEM_IDS.MOONFLOWERS_SEED ? 0 : // BEGINNER tier (0)
                                                id === ITEM_IDS.RAINBOW_FRUIT_SEED ? 2 : // EXPERT tier (2)
                                                id === ITEM_IDS.ANCIENT_GRAIN_SEEDS_BUYABLE ? 1 : // INTERMEDIATE tier (1)
                                                itemData.tierRequirement || 0 // Default to beginner tier for basic crops
                            };
                            items.push({
                                id,
                                ...modifiedData
                            });
                        }
                        // Add other buyable items normally
                        else if (itemData.isBuyable) {
                            // Override specific items' tierRequirement for rare crops
                            if (isRareCrop(id)) {
                                const tierReq = id === ITEM_IDS.CRYSTAL_BERRIES_SEED ? 0 : // BEGINNER tier (0)
                                               id === ITEM_IDS.MOONFLOWERS_SEED ? 0 : // BEGINNER tier (0)
                                               id === ITEM_IDS.RAINBOW_FRUIT_SEED ? 2 : // EXPERT tier (2)
                                               id === ITEM_IDS.ANCIENT_GRAIN_SEEDS_BUYABLE ? 1 : // INTERMEDIATE tier (1)
                                               itemData.tierRequirement || 0;
                                items.push({
                                    id,
                                    ...itemData,
                                    tierRequirement: tierReq
                                });
                            } else {
                                items.push({
                                    id,
                                    ...itemData
                                });
                            }
                        }
                    } catch (itemError) {
                        console.error(`Error fetching data for item ${id}:`, itemError);
                        
                        // If this is one of our essential items, add a fallback entry
                        if (essentialCrops.includes(id)) {
                            let fallbackName = `Item ${id}`;
                            let fallbackPrice = 20;
                            
                            if (id === ITEM_IDS.POTATO_SEED) {
                                fallbackName = "Potato Seed";
                            } else if (id === ITEM_IDS.TOMATO_SEED) {
                                fallbackName = "Tomato Seed";
                            } else if (id === ITEM_IDS.STRAWBERRY_SEED) {
                                fallbackName = "Strawberry Seed";
                            } else if (id === ITEM_IDS.RAINBOW_FRUIT_SEED) {
                                fallbackName = "Rainbow Fruit Seed";
                                fallbackPrice = 500;
                            } else if (id === ITEM_IDS.ANCIENT_GRAIN_SEEDS_BUYABLE) {
                                fallbackName = "Ancient Grain Seeds";
                                fallbackPrice = 250;
                            }
                            
                            items.push({
                                id,
                                itemName: fallbackName,
                                purchasePrice: fallbackPrice,
                                isBuyable: true,
                                tierRequirement: 0,
                                charges: 0
                            });
                        }
                    }
                }
                
                // Manual addition of Rainbow Fruit if it's not already included
                // This ensures it's always in the shop
                if (!items.some(item => item.id === ITEM_IDS.RAINBOW_FRUIT_SEED)) {
                    console.log("Adding Rainbow Fruit Seed manually as it wasn't found in contract data");
                    items.push({
                        id: ITEM_IDS.RAINBOW_FRUIT_SEED,
                        itemName: "Rainbow Fruit Seed",
                        purchasePrice: 500,
                        isBuyable: true,
                        tierRequirement: 0,
                        charges: 0
                    });
                }
                
                // Create a map of item IDs to names for easy reference
                const namesMap = {};
                items.forEach(item => {
                    namesMap[item.id] = item.itemName;
                });
                
                if (isMounted) {
                    console.log("Setting buyable items:", items);
                    setItemNames(namesMap);
                    // Sort items by tier requirement and then by price
                    const sortedItems = items.sort((a, b) => {
                        if (a.tierRequirement !== b.tierRequirement) {
                            return a.tierRequirement - b.tierRequirement;
                        }
                        return a.purchasePrice - b.purchasePrice;
                    });
                    setBuyableItems(sortedItems);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error fetching buyable items:', error);
                if (isMounted) {
                    notification.error('Failed to load shop items');
                    setIsLoading(false);
                }
            }
        };
        
        fetchBuyableItems();
        
        return () => {
            isMounted = false;
        };
    }, [address]); // Only depend on address
    
    // Update state from contract data
    useEffect(() => {
        if (tokenBalance) {
            setBalance(Number(formatEther(tokenBalance)));
        }
        
        if (playerProfile) {
            setTileCount(Number(playerProfile.farmTilesCount));
            setPlayerTier(Number(playerProfile.currentTier));
            console.log("Player tier:", Number(playerProfile.currentTier));
        }
        
        if (inventoryData) {
            const inventoryObj = {};
            // Process inventory data from the contract
            inventoryData[0].forEach((id, index) => {
                // Convert BigInt values to numbers for proper display
                const itemId = Number(id);
                const quantity = Number(inventoryData[1][index]);
                inventoryObj[itemId] = quantity;
            });
            console.log("Inventory data:", inventoryObj);
            setInventory(inventoryObj);
        }
        
        if (fertilizerCooldownData) {
            const time = Number(fertilizerCooldownData);
            setFertilizerCooldown(time);
            
            // Clear any existing interval
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
            
            // Only set up interval if there's time remaining
            if (time > 0) {
                const interval = setInterval(() => {
                    setFertilizerCooldown(prevTime => {
                        if (prevTime <= 1) {
                            clearInterval(interval);
                            refetchFertilizerCooldown();
                            return 0;
                        }
                        return prevTime - 1;
                    });
                }, 1000);
                
                setCountdownInterval(interval);
            }
        }
        
        return () => {
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
        };
    }, [tokenBalance, playerProfile, inventoryData, fertilizerCooldownData, refetchFertilizerCooldown, countdownInterval]);

    // Update token decimals and allowance when data is received
    useEffect(() => {
        if (allowanceData) {
            setTokenAllowance(Number(formatEther(allowanceData)));
        }
    }, [allowanceData]);

    // Set up write contract function
    const { writeContractAsync: writeContract } = useWriteContract();

    // Check if enough allowance is given for purchase
    const checkAndApproveTokens = async (price) => {
        // Convert price to correct decimal units (default to 18 if not set)
        const priceInTokenUnits = parseFloat(price) * (10 ** tokenDecimals);
        
        // Check if current allowance is sufficient
        if (tokenAllowance < price) {
            setLoadingText("Approving CROPS tokens...");
            
            try {
                // Approve a large amount to avoid frequent approvals
                const approvalAmount = parseEther("1000000"); // 1 million CROPS with 18 decimals
                
                await writeContract({
                    address: CONTRACT_ADDRESSES.CROPS_Token,
                    abi: CROPS_TokenABI,
                    functionName: 'approve',
                    args: [CONTRACT_ADDRESSES.ShopManager, approvalAmount]
                });
                
                notification.success("✅ Approved CROPS tokens for spending!");
                await refetchAllowance();
                return true;
            } catch (error) {
                console.error("Token approval error:", error);
                notification.error(`Failed to approve tokens: ${error.message}`);
                return false;
            }
        }
        
        return true; // Already has sufficient allowance
    };

    // Buy item function using the ShopManager contract
    const buyItem = async (itemId, amount = 1) => {
        if (!address) return;
        setLoadingText("Processing Purchase...");
        setIsLoading(true);
        try {
            // Find the item to get its name and price
            const item = buyableItems.find(i => i.id === itemId);
            const price = item.purchasePrice * amount / (10**18);
            
            // Check and approve tokens if needed
            const isApproved = await checkAndApproveTokens(price);
            if (!isApproved) {
                setIsLoading(false);
                return;
            }
            
            await writeContract({
                address: CONTRACT_ADDRESSES.ShopManager,
                abi: ShopManagerABI,
                functionName: 'purchaseItem',
                args: [itemId, amount]
            });
            
            const itemName = item ? item.itemName : `Item #${itemId}`;
            notification.success(`🛒 Purchased ${amount} ${itemName}!`);
            
            // Update stats for tracking
            if (item) {
                updateStats({
                    totalTokensSpent: (item.purchasePrice * amount) / (10**18)
                });
            }
            
            setTimeout(() => {
                refetchBalance();
                refetchInventory();
                refetchAllowance();
                if (itemId === ITEM_IDS.FERTILIZER) {
                    refetchFertilizerCooldown();
                }
                setIsLoading(false);
            }, 2500);
        } catch (error) {
            console.error("Purchase error:", error);
            notification.error(`Failed to purchase: ${error.message}`);
            setIsLoading(false);
        }
    };

    // Buy farm tile function
    const buyFarmTile = async () => {
        if (!address) return;
        setLoadingText("Processing Purchase...");
        setIsLoading(true);
        try {
            // Calculate the price for the next tile
            const price = 250;
            
            // Check and approve tokens if needed
            const isApproved = await checkAndApproveTokens(price);
            if (!isApproved) {
                setIsLoading(false);
                return;
            }
            
            await writeContract({
                address: CONTRACT_ADDRESSES.ShopManager,
                abi: ShopManagerABI,
                functionName: 'purchaseFarmTile'
            });
            
            notification.success('🧑‍🌾 Purchased New Farm Tile!');
            
            // Update player stats
            updateStats({
                totalTokensSpent: price,
                tilesOwned: tileCount + 1
            });
            
            setTimeout(() => {
                refetchBalance();
                refetchProfile();
                refetchAllowance();
                setIsLoading(false);
            }, 2500);
        } catch (error) {
            console.error("Buy tile error:", error);
            notification.error(`Failed to purchase: ${error.message}`);
            setIsLoading(false);
        }
    };

    // Format time for cooldown display
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Filter items by category
    const getItemsForCategory = (category) => {
        if (!buyableItems || buyableItems.length === 0) return [];
        
        if (category === 'all') {
            // Filter out FARM_TILE_ITEM from 'all' as it's handled separately
            return buyableItems.filter(item => item.id !== ITEM_IDS.FARM_TILE_ITEM);
        }
        
        if (category === 'seeds') {
            return buyableItems.filter(item => SEED_ITEM_IDS.includes(item.id));
        }
        
        if (category === 'tools') {
            return buyableItems.filter(item => 
                TOOL_MATERIAL_ITEM_IDS.includes(item.id) || 
                (item.itemType === ITEM_TYPES.FARM_ENHANCEMENT && item.id !== ITEM_IDS.FARM_TILE_ITEM)
            );
        }
        // FARM_TILE_ITEM is handled by the 'expansion' category section directly
        return [];
    };

    // Get the appropriate icon for an item
    const getItemIcon = (item) => {
        const iconSize = 40;
        
        // Map item IDs to their corresponding image components
        const itemIconMap = {
            [ITEM_IDS.WATER_BUCKET]: <WaterBucket size={iconSize} />,
            [ITEM_IDS.FERTILIZER]: <Fertilizer size={iconSize} />,
            [ITEM_IDS.POTATO_SEED]: <SeedPacket cropType={0} size={iconSize} />,
            [ITEM_IDS.TOMATO_SEED]: <SeedPacket cropType={1} size={iconSize} />,
            [ITEM_IDS.STRAWBERRY_SEED]: <SeedPacket cropType={2} size={iconSize} />,
            [ITEM_IDS.CORN_SEED]: <SeedPacket cropType={3} size={iconSize} />,
            [ITEM_IDS.CARROT_SEED]: <SeedPacket cropType={4} size={iconSize} />,
            [ITEM_IDS.PUMPKIN_SEED]: <SeedPacket cropType={5} size={iconSize} />,
            [ITEM_IDS.WHEAT_SEED]: <SeedPacket cropType={6} size={iconSize} />,
            [ITEM_IDS.WATERMELON_SEED]: <SeedPacket cropType={7} size={iconSize} />,
            [ITEM_IDS.CACTUS_SEED]: <SeedPacket cropType={8} size={iconSize} />,
            [ITEM_IDS.GOLDEN_SEED_ITEM]: <SeedPacket cropType={9} size={iconSize} />,
            [ITEM_IDS.CRYSTAL_BERRIES_SEED]: <SeedPacket cropType={10} size={iconSize} />,
            [ITEM_IDS.MOONFLOWERS_SEED]: <SeedPacket cropType={11} size={iconSize} />,
            [ITEM_IDS.ANCIENT_GRAIN_SEEDS_BUYABLE]: <SeedPacket cropType={12} size={iconSize} />,
            [ITEM_IDS.RAINBOW_FRUIT_SEED]: <SeedPacket cropType={13} size={iconSize} />,
            [ITEM_IDS.ANCIENT_APPLE_SEEDS]: <SeedPacket cropType={12} size={iconSize} />, // Using same as Ancient Grain
            [ITEM_IDS.WOOD]: <Wood size={iconSize} />,
            [ITEM_IDS.FABRIC]: <Fabric size={iconSize} />,
            [ITEM_IDS.ESSENCE_EXTRACTOR]: <EssenceExtractor size={iconSize} />,
            [ITEM_IDS.FERTILE_MESH]: <FertileMesh size={iconSize} />
        };
        
        // Return the specific icon for the item ID, or fall back to a generic icon
        return itemIconMap[item.id] || <CropsTokenIcon size={iconSize} />;
    };

    // Get item description for a specific item
    const getItemDescription = (item) => {
        switch (item.id) {
            case ITEM_IDS.WATER_BUCKET:
                return "Provides 6 water charges. Required to grow crops after planting.";
            case ITEM_IDS.FERTILIZER:
                return fertilizerCooldown > 0 
                    ? `Available in ${formatTime(fertilizerCooldown)}. Provides 4 fertilizer charges. Instantly matures crops.`
                    : "Provides 4 fertilizer charges. Instantly matures crops and can be used instead of water.";
            case ITEM_IDS.POTATO_SEED:
                return "Slow growing but reliable crop. Takes 3 hours to mature. Yields 40 CROPS.";
            case ITEM_IDS.TOMATO_SEED:
                return "Medium growth time with good yield. Takes 2 hours to mature. Yields 50 CROPS.";
            case ITEM_IDS.STRAWBERRY_SEED:
                return "Fast growing and high value crop. Takes 1 hour to mature. Yields 75 CROPS.";
            case ITEM_IDS.CORN_SEED:
                return "High-value crop with average growth time. Takes 2.5 hours to mature. Yields 55 CROPS.";
            case ITEM_IDS.CARROT_SEED:
                return "Fast growing root vegetable with modest yield. Takes 45 minutes to mature. Yields 35 CROPS.";
            case ITEM_IDS.PUMPKIN_SEED:
                return "A seasonal crop with high market value. Takes 4 hours to mature. Yields 80 CROPS.";
            case ITEM_IDS.WHEAT_SEED:
                return "Versatile grain crop, easy to grow but lower yield. Takes 30 minutes to mature. Yields 30 CROPS.";
            case ITEM_IDS.WATERMELON_SEED:
                return "Requires longer growing period but high yield. Takes 6 hours to mature. Yields 130 CROPS.";
            case ITEM_IDS.CACTUS_SEED:
                return "Exotic plant that requires minimal water. Takes 2 hours to mature. Yields 60 CROPS.";
            case ITEM_IDS.CRYSTAL_BERRIES_SEED:
                return "Rare berries that shimmer with crystal energy. Takes 24 hours to mature. Yields 300 CROPS. May drop Crystal Essence or Time Crystal.";
            case ITEM_IDS.MOONFLOWERS_SEED:
                return "Rare flowers that bloom only under moonlight. Takes 1.5 hours to mature. Yields 400 CROPS. May drop Moonleaf. ⚠️ Can only be harvested between 2-4 AM UTC.";
            case ITEM_IDS.RAINBOW_FRUIT_SEED:
                return "Rare fruit with a spectrum of colors and flavors. Takes 1 hour to mature. Yields 888 CROPS. May drop Rainbow Shard.";
            case ITEM_IDS.ANCIENT_GRAIN_SEEDS_BUYABLE:
                return "Rare ancient grains said to be from the first Monad farms. Takes 48 hours to mature. Yields 600 CROPS. May drop Ancient Apple.";
            default:
                return item.itemName ? `${item.itemName} - A farming item.` : `Item #${item.id}`;
        }
    };

    if (!address) return (
        <div className="card animate-fade-in">
            <h2>Farm Shop</h2>
            <p className="text-center text-secondary">Please connect your wallet to access the shop.</p>
        </div>
    );

    return (
        <div className="shop-container animate-fade-in">
            <LoadingOverlay 
                isLoading={isLoading}
                text={loadingText}
            />
            
            <h2>Farm Shop</h2>
            
            <div className="card mb-lg">
                <div className="flex justify-between items-center mb-md">
                    <h3 className="text-xl m-0">Balance: <span className="text-warning">{balance.toFixed(2)} CROPS</span></h3>
                    <button 
                        className="btn btn-primary"
                        onClick={() => notification.info("Visit the Tokens tab to claim your daily tokens!")}
                    >
                        <span className="btn-icon">💰</span>
                        Get More Tokens
                    </button>
                </div>
            </div>
            
            <div className="shop-categories">
                <button 
                    className={`shop-category-btn ${activeCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('all')}
                >
                    🛒 All Items
                </button>
                <button 
                    className={`shop-category-btn ${activeCategory === 'seeds' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('seeds')}
                >
                    🌱 Seeds
                </button>
                <button 
                    className={`shop-category-btn ${activeCategory === 'tools' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('tools')}
                >
                    🧰 Farming Tools
                </button>
                <button 
                    className={`shop-category-btn ${activeCategory === 'expansion' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('expansion')}
                >
                    🧑‍🌾 Farm Expansion
                </button>
            </div>
            
            {/* Seeds Section */}
            {(activeCategory === 'all' || activeCategory === 'seeds') && (
                <div className="shop-section">
                    <div className="shop-section-title">
                        <span className="shop-section-icon">🌱</span>
                        Seeds
                    </div>
                    
                    <div className="shop-grid">
                        {getItemsForCategory('seeds').map((item) => (
                            <ShopItem 
                                key={item.id}
                                title={item.itemName || `Seed #${item.id}`}
                                description={getItemDescription(item)}
                                price={item.purchasePrice}
                                icon={getItemIcon(item)}
                                count={inventory[item.id] || 0}
                                onPurchase={() => buyItem(item.id, 1)}
                                disabled={isLoading || 
                                        (item.purchasePrice > balance) || 
                                        (playerTier < item.tierRequirement)}
                                itemType="seed"
                                itemData={item.id}
                                className={isRareCrop(item.id) ? 'rare-crop' : ''}
                                requiredTier={item.tierRequirement}
                                playerTier={playerTier}
                            />
                        ))}
                    </div>
                </div>
            )}
            
            {/* Farming Tools Section */}
            {(activeCategory === 'all' || activeCategory === 'tools') && (
                <div className="shop-section">
                    <div className="shop-section-title">
                        <span className="shop-section-icon">🧰</span>
                        Farming Tools
                    </div>
                    
                    <div className="shop-grid">
                        {getItemsForCategory('tools').map((item) => (
                            <ShopItem 
                                key={item.id}
                                title={item.itemName || `Tool #${item.id}`}
                                description={getItemDescription(item)}
                                price={item.purchasePrice}
                                icon={getItemIcon(item)}
                                count={inventory[item.id] || 0}
                                onPurchase={() => buyItem(item.id, 1)}
                                disabled={
                                    isLoading || 
                                    item.purchasePrice > balance ||
                                    (item.id === ITEM_IDS.FERTILIZER && fertilizerCooldown > 0) ||
                                    (playerTier < item.tierRequirement)
                                }
                                itemType={item.id === ITEM_IDS.WATER_BUCKET ? "water" : "item"}
                                itemData={item.id === ITEM_IDS.WATER_BUCKET ? "bucket" : "tool"}
                                requiredTier={item.tierRequirement}
                                playerTier={playerTier}
                            />
                        ))}
                    </div>
                </div>
            )}
            
            {/* Farm Expansion Section */}
            {(activeCategory === 'all' || activeCategory === 'expansion') && (
                <div className="shop-section">
                    <div className="shop-section-title">
                        <span className="shop-section-icon">🧑‍🌾</span>
                        Farm Expansion
                    </div>
                    
                    <div className="shop-grid">
                        <ShopItem 
                            title="Farm Tile"
                            description={
                                tileCount >= 24 
                                    ? "Maximum tile count reached (24/24)." 
                                    : `Expands your farm with a new tile for growing crops. Currently owned: ${tileCount}/24 tiles.`
                            }
                            price={250}
                            icon={<ItemImages.TilePlot size={40} />}
                            count={24 - tileCount}
                            onPurchase={buyFarmTile}
                            disabled={
                                isLoading || 
                                tileCount >= 24 || 
                                250 > balance
                                // Remove tier requirement check temporarily
                            }
                            itemType="tile"
                            itemData="farm"
                            playerTier={playerTier}
                            requiredTier={0} // Set to beginner tier
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopManagerComponent;