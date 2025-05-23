import { readContract } from "@wagmi/core";
import TimeOracleABI from "../abis/TimeOracle.abi.json";
import { CONTRACT_ADDRESSES } from "../constants/contractAddresses";
import { CHAIN_ID } from "../constants/networkConfig";

/**
 * Service for interacting with the TimeOracle contract
 * This service provides functions to handle time-related operations
 */

/**
 * Get the current timestamp from the blockchain
 * @returns {Promise<number>} - Current timestamp in seconds
 */
export const getCurrentTimestamp = async () => {
  try {
    const data = await readContract({
      address: CONTRACT_ADDRESSES.TimeOracle,
      abi: TimeOracleABI,
      functionName: 'getCurrentTimestamp',
      chainId: CHAIN_ID
    });

    return Number(data);
  } catch (error) {
    console.error("Error fetching current timestamp:", error);
    // Fallback to local timestamp if the contract call fails
    return Math.floor(Date.now() / 1000);
  }
};

/**
 * Check if a cooldown is active
 * @param {string} address - Player address
 * @param {number} cooldownType - Type of cooldown to check
 * @returns {Promise<boolean>} - True if cooldown is active
 */
export const isCooldownActive = async (address, cooldownType) => {
  try {
    const data = await readContract({
      address: CONTRACT_ADDRESSES.TimeOracle,
      abi: TimeOracleABI,
      functionName: 'isCooldownActive',
      args: [address, cooldownType],
      chainId: CHAIN_ID
    });

    return data;
  } catch (error) {
    console.error(`Error checking cooldown for address ${address}, type ${cooldownType}:`, error);
    throw error;
  }
};

/**
 * Get time remaining until a cooldown ends
 * @param {string} address - Player address
 * @param {number} cooldownType - Type of cooldown to check
 * @returns {Promise<number>} - Time remaining in seconds
 */
export const getTimeToCooldownEnd = async (address, cooldownType) => {
  try {
    const data = await readContract({
      address: CONTRACT_ADDRESSES.TimeOracle,
      abi: TimeOracleABI,
      functionName: 'getTimeToCooldownEnd',
      args: [address, cooldownType],
      chainId: CHAIN_ID
    });

    return Number(data);
  } catch (error) {
    console.error(`Error getting cooldown end time for address ${address}, type ${cooldownType}:`, error);
    throw error;
  }
};

/**
 * Check if it's currently a Moonflower harvest window
 * @returns {Promise<boolean>} - True if in Moonflower harvest window
 */
export const isMoonflowerHarvestWindow = async () => {
  try {
    const data = await readContract({
      address: CONTRACT_ADDRESSES.TimeOracle,
      abi: TimeOracleABI,
      functionName: 'isMoonflowerHarvestWindow',
      chainId: CHAIN_ID
    });

    return data;
  } catch (error) {
    console.error("Error checking Moonflower harvest window:", error);
    throw error;
  }
};

/**
 * Format seconds into a human-readable time string
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string (e.g., "2h 30m 15s")
 */
export const formatTimeLeft = (seconds) => {
  if (seconds <= 0) return "0s";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  let result = "";
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0 || hours > 0) result += `${minutes}m `;
  result += `${secs}s`;
  
  return result;
};

export default {
  getCurrentTimestamp,
  isCooldownActive,
  getTimeToCooldownEnd,
  isMoonflowerHarvestWindow,
  formatTimeLeft
}; 