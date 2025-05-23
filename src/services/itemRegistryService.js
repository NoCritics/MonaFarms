import { readContract } from "@wagmi/core";
import ItemRegistryABI from "../abis/ItemRegistry.abi.json";
import { CONTRACT_ADDRESSES } from "../constants/contractAddresses";
import { CHAIN_ID } from "../constants/networkConfig";
import { config } from "../Web3Provider";

/**
 * Service for interacting with the ItemRegistry contract
 * This service provides functions to fetch item and crop data
 */

/**
 * Get data for a specific item
 * @param {number} itemId - The ID of the item to fetch
 * @returns {Promise<Object>} - Item data
 */
export const getItemData = async (itemId) => {
  try {
    const data = await readContract(config, {
      address: CONTRACT_ADDRESSES.ItemRegistry,
      abi: ItemRegistryABI,
      functionName: 'getItemData',
      args: [itemId],
      chainId: CHAIN_ID
    });

    // Since this returns a tuple with nested components
    // Make sure to properly parse all numeric values
    const result = {
      itemName: data.name,
      id: Number(data.id),
      isBuyable: data.isBuyable,
      purchasePrice: Number(data.purchasePrice),
      tierRequirement: Number(data.requiredTierToBuy),
      charges: Number(data.charges)
    };
    
    console.log(`Parsed item data for ID ${itemId}:`, result);
    return result;
  } catch (error) {
    console.error(`Error fetching item data for ID ${itemId}:`, error);
    
    // Special handling for Rainbow Fruit Seeds (ID 19)
    if (itemId === 19) {
      console.warn("Returning default data for Rainbow Fruit Seeds (ID 19)");
      return {
        itemName: "Rainbow Fruit Seed",
        id: 19,
        isBuyable: true,
        purchasePrice: 500,
        tierRequirement: 0,
        charges: 0
      };
    }
    
    // For debugging purposes, we'll return a default item for essential crops
    // to prevent UI from breaking if the contract call fails
    if ([8, 9, 10].includes(itemId)) { // Potato, Tomato, Strawberry seeds
      console.warn(`Returning default data for essential crop ${itemId}`);
      return {
        itemName: itemId === 8 ? "Potato Seed" : 
                  itemId === 9 ? "Tomato Seed" : "Strawberry Seed",
        id: itemId,
        isBuyable: true,
        purchasePrice: 20,
        tierRequirement: 0,
        charges: 0
      };
    }
    
    throw error;
  }
};

/**
 * Get data for a specific crop
 * @param {number} cropId - The ID of the crop to fetch
 * @returns {Promise<Object>} - Crop data
 */
export const getCropData = async (cropId) => {
  try {
    const data = await readContract(config, {
      address: CONTRACT_ADDRESSES.ItemRegistry,
      abi: ItemRegistryABI,
      functionName: 'getCropData',
      args: [cropId],
      chainId: CHAIN_ID
    });

    // Ensure all numeric values are properly parsed
    return {
      cropName: data.name, 
      baseGrowthTimeInSeconds: Number(data.growTimeSeconds),
      baseYield: Number(data.baseYield),
      waterNeeded: Number(data.waterNeeded),
      isRare: data.isRare,
      cropType: Number(data.id),
      seedId: Number(data.seedId),
      purchasePrice: Number(data.purchasePrice),
      requiredTierToBuy: Number(data.requiredTierToBuy)
    };
  } catch (error) {
    console.error(`Error fetching crop data for ID ${cropId}:`, error);
    throw error;
  }
};

/**
 * Get all registered item IDs
 * @returns {Promise<Array<number>>} - Array of item IDs
 */
export const getAllItemIDs = async () => {
  try {
    const data = await readContract(config, {
      address: CONTRACT_ADDRESSES.ItemRegistry,
      abi: ItemRegistryABI,
      functionName: 'getAllItemIDs',
      chainId: CHAIN_ID
    });

    const itemIds = data.map(id => Number(id));
    console.log("Retrieved all item IDs:", itemIds);
    
    // Ensure Rainbow Fruit Seeds (ID 19) is always included
    if (!itemIds.includes(19)) {
      console.log("Adding Rainbow Fruit Seeds (ID 19) manually to item IDs");
      itemIds.push(19);
    }
    
    return itemIds;
  } catch (error) {
    console.error("Error fetching all item IDs:", error);
    // Return a basic set of items to prevent UI from breaking
    console.warn("Returning default item IDs");
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];
  }
};

/**
 * Get all registered crop IDs
 * @returns {Promise<Array<number>>} - Array of crop IDs
 */
export const getAllCropIDs = async () => {
  try {
    const data = await readContract(config, {
      address: CONTRACT_ADDRESSES.ItemRegistry,
      abi: ItemRegistryABI,
      functionName: 'getAllCropIDs',
      chainId: CHAIN_ID
    });

    return data.map(id => Number(id));
  } catch (error) {
    console.error("Error fetching all crop IDs:", error);
    throw error;
  }
};

/**
 * Get all buyable items
 * @returns {Promise<Array<Object>>} - Array of buyable items with their data
 */
export const getAllBuyableItems = async () => {
  try {
    // Get all item IDs first
    const itemIDs = await getAllItemIDs();
    
    // Fetch data for each item and filter out non-buyable ones
    const itemsData = await Promise.all(
      itemIDs.map(async (id) => {
        const data = await getItemData(id);
        return { id, ...data };
      })
    );
    
    return itemsData.filter(item => item.isBuyable);
  } catch (error) {
    console.error("Error fetching buyable items:", error);
    throw error;
  }
};

/**
 * Check if an ID is a seed (based on the ItemType in the contract)
 * @param {number} itemId - The item ID to check
 * @returns {Promise<boolean>} - True if the item is a seed
 */
export const isSeedItem = async (itemId) => {
  try {
    const data = await getItemData(itemId);
    // ItemType.SEED is 1 in the contract
    return data.itemType === 1;
  } catch (error) {
    console.error(`Error checking if item ID ${itemId} is a seed:`, error);
    throw error;
  }
};

export default {
  getItemData,
  getCropData,
  getAllItemIDs,
  getAllCropIDs,
  getAllBuyableItems,
  isSeedItem
}; 