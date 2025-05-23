import React, { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { readContract } from '@wagmi/core';
import { useNotification } from './notifications/NotificationSystem';
import CraftingManagerABI from '../abis/CraftingManager.abi.json';
import PlayerRegistryInventoryABI from '../abis/PlayerRegistryInventory.abi.json';
import CROPS_TokenABI from '../abis/CROPS_Token.abi.json';
import { CONTRACT_ADDRESSES } from '../constants/contractAddresses';
import { CHAIN_ID } from '../constants/networkConfig';
import itemRegistryService from '../services/itemRegistryService';
import { config } from '../Web3Provider';
import { 
  ItemImages, 
  CropsToken,
  WaterBucket,
  Fertilizer,
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
  GrowthLamp,
  Raincatcher,
  LunarHarvester,
  MonadiumSickle,
  MonadiumHoe,
  RainbowCore,
  AncientAppleSeeds,
  FertileMesh
} from '../assets/ItemImages';
import { formatEther, parseEther, formatUnits } from 'viem';
import timeOracleService from '../services/timeOracleService';
import { useProgress } from '../context/ProgressContext';

// ItemID enum values for reference
const ITEM_IDS = {
  CROPS_CURRENCY: 0,
  WATER_BUCKET: 1,
  FERTILIZER: 2,
  GOLDEN_SEED_ITEM: 3,
  CRYSTAL_ESSENCE: 4,
  MOONLEAF: 5,
  ANCIENT_APPLE: 6,
  RAINBOW_SHARD: 7,
  // Seeds are 8-19
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

// List of craftable items based on the CraftingManager contract recipes
const CRAFTABLE_ITEM_IDS = [
  ITEM_IDS.RAINBOW_CORE,        // Rainbow Core: 6 Rainbow Shards
  ITEM_IDS.GOLD_DUST,           // Gold Dust: Golden Seeds + Essence Extractor
  ITEM_IDS.FERTILE_MESH,        // Fertile Mesh: Gold Dust + 2 Fertilizer + 50 CROPS
  ITEM_IDS.GROWTH_LAMP,         // Growth Lamp: Crystal Essence + 24 Water + 100 CROPS
  ITEM_IDS.RAINCATCHER,         // Raincatcher: 2 Moonleaf + Rainbow Core + 200 CROPS
  ITEM_IDS.LUNAR_HARVESTER_ITEM, // Lunar Harvester: 2 Moonleaf + Gold Dust + 3 Time Crystals
  ITEM_IDS.MONADIUM_SICKLE_ITEM, // Monadium Sickle: Gold Dust + 2 Crystal Essence + 2 Moonleaf + Ancient Apple Seed + Rainbow Core (Blueprint needed)
  ITEM_IDS.MONADIUM_HOE_ITEM,   // Monadium Hoe: Growth Lamp + Essence Extractor + 10 Wood + 10 Fabric + Rainbow Core + Time Crystal + Fertile Mesh + 10000 CROPS (Blueprint needed)
  ITEM_IDS.ANCIENT_APPLE_SEEDS  // Ancient Apple Seeds (Special crafting using Ancient Apple)
];

const CraftingManagerComponent = () => {
  const { address, isConnected } = useAccount();
  const notification = useNotification();
  const { updateStats } = useProgress();
  const [craftableItems, setCraftableItems] = useState([]);
  const [playerInventory, setPlayerInventory] = useState({});
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [craftableItemNames, setCraftableItemNames] = useState({});
  const [componentNames, setComponentNames] = useState({});
  const [isCrafting, setIsCrafting] = useState(false);
  const [tokenAllowance, setTokenAllowance] = useState(0);
  const [tokenDecimals, setTokenDecimals] = useState(18);
  const [cropsBalance, setCropsBalance] = useState(0);

  // Get player inventory
  const { data: inventoryData, refetch: refetchInventory } = useReadContract({
    address: CONTRACT_ADDRESSES.PlayerRegistryInventory,
    abi: PlayerRegistryInventoryABI,
    functionName: 'getPlayerFullInventory',
    args: [address],
    enabled: !!address,
  });

  // Get token decimals
  const { data: decimalsData } = useReadContract({
    address: CONTRACT_ADDRESSES.CROPS_Token,
    abi: CROPS_TokenABI,
    functionName: 'decimals',
    enabled: !!address,
  });

  // Get token balance
  const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.CROPS_Token,
    abi: CROPS_TokenABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address,
  });

  // Set token decimals when data is received
  useEffect(() => {
    if (decimalsData !== undefined) {
      setTokenDecimals(Number(decimalsData));
    }
  }, [decimalsData]);

  // Update crops balance when data changes
  useEffect(() => {
    if (tokenBalance && decimalsData !== undefined) {
      const newBalance = Number(formatUnits(tokenBalance, tokenDecimals));
      setCropsBalance(newBalance);
    }
  }, [tokenBalance, decimalsData, tokenDecimals]);

  // Get token allowance for CraftingManager contract
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.CROPS_Token,
    abi: CROPS_TokenABI,
    functionName: 'allowance',
    args: [address, CONTRACT_ADDRESSES.CraftingManager],
    enabled: !!address,
  });

  // Write contract for crafting
  const { writeContractAsync: writeContract } = useWriteContract();

  // Update token allowance when data is received
  useEffect(() => {
    if (allowanceData) {
      setTokenAllowance(Number(formatEther(allowanceData)));
    }
  }, [allowanceData]);

  // Special case for Ancient Apple Seeds - since they're obtained by consuming an Ancient Apple
  const craftAncientAppleSeeds = async () => {
    try {
      // Check and approve tokens if needed
      const price = 500; // Hard-coded CROPS price for Ancient Apple Seeds
      const isApproved = await checkAndApproveTokens(price);
      if (!isApproved) {
        setIsCrafting(false);
        return;
      }
      
      await writeContract({
        address: CONTRACT_ADDRESSES.CraftingManager,
        abi: CraftingManagerABI,
        functionName: 'craftAncientAppleSeeds',
        args: []
      });
      
      notification.success("Successfully crafted Ancient Apple Seeds!");
      
      setTimeout(() => {
        refetchInventory();
        refetchAllowance();
        setIsCrafting(false);
      }, 2500);
    } catch (error) {
      console.error("Crafting Ancient Apple Seeds error:", error);
      notification.error(`Failed to craft: ${error.message}`);
      setIsCrafting(false);
    }
  };

  // Memoize the getRecipe function to avoid recreation on every render
  const getRecipe = useCallback(async (itemId) => {
    if (itemId === ITEM_IDS.ANCIENT_APPLE_SEEDS) {
      // Special case for Ancient Apple Seeds
      return {
        id: ITEM_IDS.ANCIENT_APPLE_SEEDS,
        components: [ITEM_IDS.ANCIENT_APPLE],
        componentQuantities: [1],
        blueprintId: 0,
        cropsPrice: 0,
        requiresBlueprint: false
      };
    }
    
    try {
      const data = await readContract(config, {
        address: CONTRACT_ADDRESSES.CraftingManager,
        abi: CraftingManagerABI,
        functionName: 'getRecipe',
        args: [itemId],
        chainId: CHAIN_ID
      });
      
      console.log("Recipe data for item", itemId, data);
      
      // Parse the recipe data structure returned by the contract
      // The contract returns a Recipe struct with components as RecipeComponent[] array
      if (data && data.components && Array.isArray(data.components)) {
        // Extract component IDs and quantities
        const componentIds = data.components.map(comp => Number(comp.itemId));
        const componentQuantities = data.components.map(comp => Number(comp.amount));
        
        return {
          id: itemId,
          components: componentIds,
          componentQuantities: componentQuantities,
          blueprintId: Number(data.blueprintId),
          cropsPrice: Number(data.costInCrops),
          requiresBlueprint: Number(data.blueprintId) !== 0
        };
      }
      
      // Fallback
      return {
        id: itemId,
        components: [],
        componentQuantities: [],
        blueprintId: 0,
        cropsPrice: 0,
        requiresBlueprint: false
      };
    } catch (error) {
      console.error(`Error fetching recipe for item ${itemId}:`, error);
      return {
        id: itemId,
        components: [],
        componentQuantities: [],
        blueprintId: 0,
        cropsPrice: 0,
        requiresBlueprint: false
      };
    }
  }, []);

  // Fetch all craftable items data on component mount
  useEffect(() => {
    let isMounted = true;
    const fetchItemData = async () => {
      if (!address) return;
      
      try {
        setLoading(true);
        console.log("Fetching crafting data...");
        
        // Fetch all item names from ItemRegistry
        const allItemIDs = await itemRegistryService.getAllItemIDs();
        const itemNamesObj = {};
        
        // Get names for all items
        for (const id of allItemIDs) {
          if (!isMounted) return;
          try {
            const itemData = await itemRegistryService.getItemData(id);
            itemNamesObj[id] = itemData.itemName;
          } catch (error) {
            console.warn(`Could not fetch data for item ${id}:`, error);
            itemNamesObj[id] = `Item #${id}`;
          }
        }
        
        if (!isMounted) return;
        setComponentNames(itemNamesObj);
        console.log("Item names loaded:", itemNamesObj);
        
        // Filter craftable items and get their recipes
        const craftableItemsData = [];
        const craftableNamesObj = {};
        
        for (const itemId of CRAFTABLE_ITEM_IDS) {
          try {
            if (!isMounted) return;
            
            // Fetch recipe from contract or use special case for Ancient Apple Seeds
            const recipeData = await getRecipe(itemId);
            console.log(`Recipe for item ${itemId}:`, recipeData);
            
            if (recipeData) {
              craftableItemsData.push({
                id: itemId,
                name: itemNamesObj[itemId] || `Item #${itemId}`,
                components: recipeData.components || [],
                componentQuantities: recipeData.componentQuantities || [],
                blueprintId: recipeData.blueprintId || 0,
                cropsPrice: Number(recipeData.cropsPrice) || 0,
                requiresBlueprint: Boolean(recipeData.requiresBlueprint)
              });
              
              // Add name to separate object for quick access
              craftableNamesObj[itemId] = itemNamesObj[itemId] || `Item #${itemId}`;
            }
          } catch (error) {
            console.error(`Error fetching recipe for item ${itemId}:`, error);
          }
        }
        
        if (isMounted) {
          console.log("Craftable items data:", craftableItemsData);
          setCraftableItems(craftableItemsData);
          setCraftableItemNames(craftableNamesObj);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching craftable items:", error);
        if (isMounted) {
          notification.error("Failed to load crafting data");
          setLoading(false);
        }
      }
    };
    
    fetchItemData();
    
    return () => {
      isMounted = false;
    };
  }, [address, getRecipe, notification]);

  // Update player inventory when data changes
  useEffect(() => {
    if (inventoryData) {
      const inventoryObj = {};
      inventoryData[0].forEach((id, index) => {
        const itemId = Number(id);
        const quantity = Number(inventoryData[1][index]);
        inventoryObj[itemId] = quantity;
      });
      console.log("Player inventory:", inventoryObj);
      setPlayerInventory(inventoryObj);
    }
  }, [inventoryData]);

  // Check if enough allowance is given for crafting
  const checkAndApproveTokens = async (price) => {
    // Convert price to correct decimal units (default to 18 if not set)
    const priceInTokenUnits = parseFloat(price) * (10 ** tokenDecimals);
    
    // Check if current allowance is sufficient
    if (tokenAllowance < price) {
      try {
        // Approve a large amount to avoid frequent approvals
        const approvalAmount = parseEther("1000000"); // 1 million CROPS with 18 decimals
        
        await writeContract({
          address: CONTRACT_ADDRESSES.CROPS_Token,
          abi: CROPS_TokenABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESSES.CraftingManager, approvalAmount]
        });
        
        notification.success("✅ Approved CROPS tokens for crafting!");
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

  // Handle crafting an item
  const handleCraft = async (itemId) => {
    if (!address) return;
    
    try {
      setIsCrafting(true);
      
      // Special case for Ancient Apple Seeds
      if (itemId === ITEM_IDS.ANCIENT_APPLE_SEEDS) {
        await craftAncientAppleSeeds();
        return;
      }

      // Find the recipe to get its price
      const recipe = craftableItems.find(item => item.id === itemId);
      if (recipe) {
        // Check and approve tokens if needed
        const isApproved = await checkAndApproveTokens(recipe.cropsPrice / (10**18));
        if (!isApproved) {
          setIsCrafting(false);
          return;
        }
      }
      
      await writeContract({
        address: CONTRACT_ADDRESSES.CraftingManager,
        abi: CraftingManagerABI,
        functionName: 'craftItem',
        args: [itemId]
      });
      
      notification.success(`Successfully crafted ${craftableItemNames[itemId] || `Item #${itemId}`}!`);
      
      // Refetch inventory after crafting
      setTimeout(() => {
        refetchInventory();
        refetchAllowance();
        setIsCrafting(false);
      }, 2500);
    } catch (error) {
      console.error("Crafting error:", error);
      notification.error(`Failed to craft: ${error.message}`);
      setIsCrafting(false);
    }
  };

  // Check if player has enough resources to craft an item
  const canCraftItem = (recipe) => {
    if (!recipe || !playerInventory) return false;
    
    // Check if player has enough CROPS tokens for crafting cost
    if (recipe.cropsPrice > 0 && ((playerInventory[ITEM_IDS.CROPS_CURRENCY] || 0) < recipe.cropsPrice)) {
      return false;
    }
    
    // Check if player has the required blueprint
    if (recipe.requiresBlueprint && !playerInventory[recipe.blueprintId]) {
      return false;
    }
    
    // Check if player has all required components
    for (let i = 0; i < recipe.components.length; i++) {
      const componentId = recipe.components[i];
      const requiredQty = recipe.componentQuantities[i];
      
      if ((playerInventory[componentId] || 0) < requiredQty) {
        return false;
      }
    }
    
    return true;
  };

  // Format CROPS amount for display
  const formatCrops = (amount) => {
    return amount.toString();
  };

  // Add a helper function to get the appropriate icon for an item
  const getItemIcon = (itemId, size = 32) => {
    const iconSize = size;
    
    // Map item IDs to their corresponding image components
    const itemIconMap = {
      [ITEM_IDS.CROPS_CURRENCY]: <CropsToken size={iconSize} />,
      [ITEM_IDS.WATER_BUCKET]: <WaterBucket size={iconSize} />,
      [ITEM_IDS.FERTILIZER]: <Fertilizer size={iconSize} />,
      [ITEM_IDS.WOOD]: <Wood size={iconSize} />,
      [ITEM_IDS.FABRIC]: <Fabric size={iconSize} />,
      [ITEM_IDS.ESSENCE_EXTRACTOR]: <EssenceExtractor size={iconSize} />,
      [ITEM_IDS.RAINBOW_CORE]: <RainbowCore size={iconSize} />,
      [ITEM_IDS.GOLD_DUST]: <GoldDust size={iconSize} />,
      [ITEM_IDS.FERTILE_MESH]: <FertileMesh size={iconSize} />,
      [ITEM_IDS.GROWTH_LAMP]: <GrowthLamp size={iconSize} />,
      [ITEM_IDS.RAINCATCHER]: <Raincatcher size={iconSize} />,
      [ITEM_IDS.LUNAR_HARVESTER_ITEM]: <LunarHarvester size={iconSize} />,
      [ITEM_IDS.MONADIUM_SICKLE_ITEM]: <MonadiumSickle size={iconSize} />,
      [ITEM_IDS.MONADIUM_HOE_ITEM]: <MonadiumHoe size={iconSize} />,
      [ITEM_IDS.ANCIENT_APPLE_SEEDS]: <AncientAppleSeeds size={iconSize} />,
      [ITEM_IDS.GOLDEN_SEED_ITEM]: <GoldenSeeds size={iconSize} />,
      [ITEM_IDS.CRYSTAL_ESSENCE]: <CrystalEssence size={iconSize} />,
      [ITEM_IDS.MOONLEAF]: <Moonleaf size={iconSize} />,
      [ITEM_IDS.ANCIENT_APPLE]: <AncientApple size={iconSize} />,
      [ITEM_IDS.RAINBOW_SHARD]: <RainbowShard size={iconSize} />,
      [ITEM_IDS.TIME_CRYSTAL]: <TimeCrystal size={iconSize} />
    };
    
    // Return the specific icon for the item ID, or fall back to a generic icon
    return itemIconMap[itemId] || <CropsToken size={iconSize} />;
  };

  if (!isConnected) {
    return (
      <div className="card animate-fade-in">
        <h2>Crafting Workshop</h2>
        <p className="text-center text-secondary">Please connect your wallet to access the crafting workshop.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card animate-fade-in">
        <h2>Crafting Workshop</h2>
        <p className="text-center">Loading crafting recipes...</p>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="crafting-container animate-fade-in">
      <h2>Crafting Workshop</h2>
      
      <div className="crafting-content">
        <div className="crafting-recipes">
          <h3>Available Recipes</h3>
          <div className="recipe-list">
            {craftableItems.length > 0 ? (
              craftableItems.map((item) => (
                <div 
                  key={item.id}
                  className={`recipe-card ${selectedRecipe?.id === item.id ? 'selected' : ''} ${canCraftItem(item) ? 'craftable' : 'not-craftable'}`}
                  onClick={() => setSelectedRecipe(item)}
                >
                  <div className="recipe-header">
                    <div className="recipe-icon">
                      {getItemIcon(item.id, 55)}
                    </div>
                    <h4>{item.name}</h4>
                    {canCraftItem(item) && <span className="craftable-badge">✓ Craftable</span>}
                  </div>
                  <div className="recipe-price">
                    <span className="price-with-icon">
                      <CropsToken size={24} />
                      <span className="price-amount">{formatCrops(item.cropsPrice)}</span>
                    </span>
                    <span>CROPS</span>
                  </div>
                  <div className="recipe-components-preview">
                    {item.components.slice(0, 2).map((componentId, idx) => (
                      <div key={idx} className="recipe-component-preview">
                        <span className="component-icon">{getItemIcon(componentId, 38)}</span>
                        {componentNames[componentId] || `Item #${componentId}`} ({item.componentQuantities[idx]})
                      </div>
                    ))}
                    {item.components.length > 2 && (
                      <div className="recipe-component-preview more">
                        +{item.components.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-secondary">No recipes available</p>
            )}
          </div>
        </div>
        
        <div className="recipe-details">
          {selectedRecipe ? (
            <div className="recipe-detail-card">
              <div className="recipe-header">
                <div className="recipe-detail-icon">
                  {getItemIcon(selectedRecipe.id, 55)}
                </div>
                <h3>{selectedRecipe.name}</h3>
              </div>
              
              <div className="recipe-cost">
                <span className="label">Cost:</span>
                <span className="value">
                  <span className="price-with-icon">
                    <CropsToken size={24} />
                    <span className="price-amount">{formatCrops(selectedRecipe.cropsPrice)}</span>
                  </span>
                  <span>CROPS</span>
                </span>
              </div>
              
              {selectedRecipe.requiresBlueprint && (
                <div className="recipe-blueprint">
                  <span className="label">Required Blueprint:</span>
                  <span className={`value ${(playerInventory[selectedRecipe.blueprintId] || 0) > 0 ? 'available' : 'missing'}`}>
                    {selectedRecipe.blueprintId === ITEM_IDS.MONADIUM_HOE_ITEM || selectedRecipe.blueprintId === ITEM_IDS.MONADIUM_SICKLE_ITEM ? 
                      <span>Blueprint: {componentNames[selectedRecipe.blueprintId] || `Blueprint #${selectedRecipe.blueprintId}`}</span> :
                      <>{getItemIcon(selectedRecipe.blueprintId, 38)}
                      {componentNames[selectedRecipe.blueprintId] || `Blueprint #${selectedRecipe.blueprintId}`}</>
                    }
                    {(playerInventory[selectedRecipe.blueprintId] || 0) > 0 ? ' ✓' : ' ✗'}
                  </span>
                </div>
              )}
              
              <div className="recipe-components">
                <h4>Required Components:</h4>
                <div className="components-list">
                  {selectedRecipe.components.map((componentId, idx) => (
                    <div key={idx} className="component-item">
                      <div className="component-icon">
                        {getItemIcon(componentId, 38)}
                      </div>
                      <span className="component-name">{componentNames[componentId] || `Item #${componentId}`}</span>
                      <span className={`component-quantity ${(playerInventory[componentId] || 0) >= selectedRecipe.componentQuantities[idx] ? 'available' : 'missing'}`}>
                        {playerInventory[componentId] || 0}/{selectedRecipe.componentQuantities[idx]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <button 
                className="btn btn-craft"
                onClick={() => handleCraft(selectedRecipe.id)}
                disabled={!canCraftItem(selectedRecipe) || isCrafting}
              >
                {isCrafting ? 'Crafting...' : 'Craft Item'}
              </button>
              
              {!canCraftItem(selectedRecipe) && (
                <div className="missing-resources-note">
                  You don't have all the required resources to craft this item.
                </div>
              )}
            </div>
          ) : (
            <div className="no-recipe-selected">
              <p>Select a recipe to view details</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="inventory-overview">
        <h3>Your Inventory</h3>
        <div className="inventory-list">
          {Object.entries(playerInventory)
            .filter(([id, count]) => count > 0 && id !== ITEM_IDS.CROPS_CURRENCY.toString()) // Filter out zero counts and CROPS token
            .map(([id, count]) => (
              <div key={id} className="inventory-item">
                <div className="item-icon">
                  {getItemIcon(Number(id), 32)}
                </div>
                <span className="item-name">{componentNames[id] || `Item #${id}`}</span>
                <span className="item-count">{count}</span>
              </div>
            ))}
          {Object.keys(playerInventory).length <= 1 && (
            <p className="text-center text-secondary">No items in inventory</p>
          )}
        </div>
        <div className="crops-balance">
          <CropsToken size={32} />
          <span className="crops-label">CROPS Balance:</span>
          <span className="crops-value">{formatCrops(cropsBalance)}</span>
        </div>
      </div>
    </div>
  );
};

export default CraftingManagerComponent; 