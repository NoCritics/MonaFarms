// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TimeOracle is Ownable {
    uint256 public constant ONE_DAY_IN_SECONDS = 24 * 60 * 60;
    uint256 public constant ONE_HOUR_IN_SECONDS = 60 * 60;

    // Cooldown identifiers
    enum CooldownType {
        DAILY_FAUCET,
        FERTILIZER_PURCHASE,
        LUNAR_HARVESTER_DAILY_RESET,
        MONADIUM_HOE_DAILY_RESET,
        GROWTH_LAMP_DAILY_RESET,
        RAINCATCHER_DAILY_RESET,
        TIME_CRYSTAL_ITEM_COOLDOWN, // Cooldown for using a Time Crystal item
        ANCIENT_APPLE_BOOST_DURATION, // Example: 24 hours
        HARVEST_ALL_ASSISTANT_DAILY_RESET,
        AUTO_WATER_ASSISTANT_DAILY_RESET,
        CROP_CARETAKER_ASSISTANT_DAILY_RESET,
        SHOP_RESTOCK_GENERAL,
        SHOP_RESTOCK_RARE
    }

    mapping(CooldownType => uint256) public cooldownDurations;
    mapping(address => mapping(CooldownType => uint256)) public lastUsedTimestamp;

    event CooldownDurationSet(CooldownType indexed cType, uint256 duration);
    event CooldownStarted(address indexed player, CooldownType indexed cType, uint256 timestamp);

    constructor(address initialOwner) {
        _transferOwnership(initialOwner);
        // Default cooldowns (can be changed by owner)
        cooldownDurations[CooldownType.DAILY_FAUCET] = ONE_DAY_IN_SECONDS;
        cooldownDurations[CooldownType.FERTILIZER_PURCHASE] = ONE_DAY_IN_SECONDS;
        cooldownDurations[CooldownType.LUNAR_HARVESTER_DAILY_RESET] = ONE_DAY_IN_SECONDS;
        cooldownDurations[CooldownType.MONADIUM_HOE_DAILY_RESET] = ONE_DAY_IN_SECONDS;
        cooldownDurations[CooldownType.GROWTH_LAMP_DAILY_RESET] = ONE_DAY_IN_SECONDS;
        cooldownDurations[CooldownType.RAINCATCHER_DAILY_RESET] = ONE_DAY_IN_SECONDS;
        cooldownDurations[CooldownType.TIME_CRYSTAL_ITEM_COOLDOWN] = ONE_DAY_IN_SECONDS;
        cooldownDurations[CooldownType.ANCIENT_APPLE_BOOST_DURATION] = ONE_DAY_IN_SECONDS; // 24 hours
        cooldownDurations[CooldownType.HARVEST_ALL_ASSISTANT_DAILY_RESET] = ONE_DAY_IN_SECONDS;
        cooldownDurations[CooldownType.AUTO_WATER_ASSISTANT_DAILY_RESET] = ONE_DAY_IN_SECONDS;
        cooldownDurations[CooldownType.CROP_CARETAKER_ASSISTANT_DAILY_RESET] = ONE_DAY_IN_SECONDS;
        cooldownDurations[CooldownType.SHOP_RESTOCK_GENERAL] = 6 * ONE_HOUR_IN_SECONDS; // Example: 6 hours
        cooldownDurations[CooldownType.SHOP_RESTOCK_RARE] = ONE_DAY_IN_SECONDS; // Example: 24 hours
    }

    function setCooldownDuration(CooldownType cType, uint256 durationSeconds) external onlyOwner {
        require(durationSeconds > 0, "Duration must be positive");
        cooldownDurations[cType] = durationSeconds;
        emit CooldownDurationSet(cType, durationSeconds);
    }

    function startCooldown(address player, CooldownType cType) external {
        // For now, allow any contract to start a cooldown. Access control can be added if needed.
        lastUsedTimestamp[player][cType] = block.timestamp;
        emit CooldownStarted(player, cType, block.timestamp);
    }

    function isCooldownActive(address player, CooldownType cType) external view returns (bool) {
        uint256 lastUsed = lastUsedTimestamp[player][cType];
        if (lastUsed == 0) {
            return false; // Never used, so not on cooldown
        }
        return (block.timestamp < lastUsed + cooldownDurations[cType]);
    }

    function getTimeToCooldownEnd(address player, CooldownType cType) external view returns (uint256) {
        uint256 lastUsed = lastUsedTimestamp[player][cType];
        if (lastUsed == 0) {
            return 0; // Not on cooldown
        }
        uint256 cooldownEnd = lastUsed + cooldownDurations[cType];
        if (block.timestamp >= cooldownEnd) {
            return 0; // Cooldown has passed
        }
        return cooldownEnd - block.timestamp;
    }

    function getCurrentTimestamp() external view returns (uint256) {
        return block.timestamp;
    }

    // --- New Moonflower Specific Functions ---

    /**
     * @dev Returns the current hour of the day in UTC (0-23).
     */
    function getCurrentUTCHour() public view returns (uint8) {
        return uint8((block.timestamp % ONE_DAY_IN_SECONDS) / ONE_HOUR_IN_SECONDS);
    }

    /**
     * @dev Checks if the current time is within the Moonflower harvest window (2:00 AM - 4:59 AM UTC).
     * Moonflowers can be harvested during hour 2, 3, or 4.
     */
    function isMoonflowerHarvestWindow() external view returns (bool) {
        uint8 currentHour = getCurrentUTCHour();
        return currentHour >= 2 && currentHour <= 4;
    }

    // Changed from external to public
    function getCooldownDuration(CooldownType _type) public view returns (uint256) {
        return cooldownDurations[_type];
    }
} 