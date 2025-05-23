// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GlobalEnumsAndStructs.sol";
import "./PlayerRegistryInventory.sol";
import "./TimeOracle.sol";
import "./ItemRegistry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FarmEnhancementContract is Ownable, GlobalEnumsAndStructs {
    PlayerRegistryInventory public playerRegistry;
    TimeOracle public timeOracle;
    ItemRegistry public itemRegistry; // Needed for crop data for Lunar Harvester

    // Store HarvestBaskets for Lunar Harvester
    // Mapping: player => tileIndex => HarvestBasket
    mapping(address => mapping(uint256 => HarvestBasket)) public harvestBaskets;

    // Upgrade definitions (could be made configurable by owner if needed)
    // Irrigation: Water units per purchase = base (6) + tier_bonus
    uint8[5] public irrigationBonuses; // 0: no bonus, 1: +1, 2: +2, 3: +3, 4: +4
    // Greenhouse: Growth speed boost percentage
    uint8[5] public greenhouseBoostsPct; // 0: 0%, 1: 5%, 2: 10%, 3: 15%, 4: 20%
    // Seed Saver: Chance percentage to not consume seed
    uint8[5] public seedSaverChancesPct; // 0: 0%, 1: 5%, 2: 10%, 3: 15%, 4: 20%
    // Rich Soil: Harvest yield boost percentage
    uint8[5] public richSoilBoostsPct; // 0: 0%, 1: 5%, 2: 10%, 3: 15%, 4: 20%

    uint256 public constant LUNAR_HARVESTER_MAX_USES_PER_DAY = 6;
    uint256 public constant MONADIUM_HOE_MAX_USES_PER_DAY = 240;

    event FarmUpgradeActivated(address indexed player, AchievementTier tier, string upgradeType, uint8 level);
    event LunarHarvestInitiated(address indexed player, uint256 tileIndex, CropID cropId, uint256 maturityTimestamp);
    event LunarHarvestClaimed(address indexed player, uint256 tileIndex, uint256 cropsAwarded);
    event MonadiumHoeUsed(address indexed player, uint256 tileIndex, CropID cropId, uint256 cropsAwarded);

    constructor(address initialOwner, address _playerRegistryAddress, address _timeOracleAddress, address _itemRegistryAddress)
    {
        _transferOwnership(initialOwner);
        require(_playerRegistryAddress != address(0));
        require(_timeOracleAddress != address(0));
        require(_itemRegistryAddress != address(0));

        playerRegistry = PlayerRegistryInventory(_playerRegistryAddress);
        timeOracle = TimeOracle(_timeOracleAddress);
        itemRegistry = ItemRegistry(_itemRegistryAddress);

        // Initialize upgrade bonus values
        irrigationBonuses = [0, 1, 2, 3, 4];
        greenhouseBoostsPct = [0, 5, 10, 15, 20];
        seedSaverChancesPct = [0, 5, 10, 15, 20];
        richSoilBoostsPct = [0, 5, 10, 15, 20];
    }

    // Called by PlayerLeaderboard (or an admin) when a player's tier is confirmed to unlock upgrades
    // This function updates the player's tier levels in PlayerRegistryInventory
    function activateUpgradesForTier(address player, AchievementTier newlyAchievedTier) external { // Or restricted access
        // require(msg.sender == address(playerRegistry), "Only PlayerRegistryInventory can call this"); // Add access control
        PlayerProfile memory profile = playerRegistry.getPlayerProfile(player);
        // The `newlyAchievedTier` is the tier the player JUST entered.
        // We grant rewards for completing the tier *before* this one.

        uint8 newIrrigationTier = profile.irrigationSystemTier;
        uint8 newGreenhouseTier = profile.greenhouseTier;
        uint8 newSeedSaverTier = profile.seedSaverTier;
        uint8 newRichSoilTier = profile.richSoilTier;

        // Grant rewards based on the tier *completed* to reach the newlyAchievedTier
        if (newlyAchievedTier == AchievementTier.INTERMEDIATE) { // Completed BEGINNER
            newIrrigationTier = 1;
        }
        if (newlyAchievedTier == AchievementTier.EXPERT) { // Completed INTERMEDIATE
            newIrrigationTier = 2;
            newGreenhouseTier = 1;
        }
        if (newlyAchievedTier == AchievementTier.MASTER) { // Completed EXPERT
            newIrrigationTier = 3;
            newGreenhouseTier = 2;
            newSeedSaverTier = 1;
            newRichSoilTier = 1;
        }
        if (newlyAchievedTier == AchievementTier.LEGENDARY) { // Completed MASTER
            newIrrigationTier = 4;
            newGreenhouseTier = 3;
            newSeedSaverTier = 2;
            newRichSoilTier = 2;
        }
        if (newlyAchievedTier == AchievementTier.EPOCHAL) { // Completed LEGENDARY
            newIrrigationTier = 4; // Stays maxed
            newGreenhouseTier = 4;
            newSeedSaverTier = 3;
            newRichSoilTier = 3;
        }
        // If there are rewards for completing EPOCHAL (e.g., reaching a hypothetical next tier):
        // if (newlyAchievedTier == AchievementTier.POST_EPOCHAL_OR_MAX) { // Completed EPOCHAL
        //     newIrrigationTier = 4; // Stays maxed
        //     newGreenhouseTier = 4; // Stays maxed
        //     newSeedSaverTier = 4;
        //     newRichSoilTier = 4;
        // }

        // Update in PlayerRegistry if changed
        if (newIrrigationTier != profile.irrigationSystemTier) playerRegistry._updateIrrigationTier(player, newIrrigationTier);
        if (newGreenhouseTier != profile.greenhouseTier) playerRegistry._updateGreenhouseTier(player, newGreenhouseTier);
        if (newSeedSaverTier != profile.seedSaverTier) playerRegistry._updateSeedSaverTier(player, newSeedSaverTier);
        if (newRichSoilTier != profile.richSoilTier) playerRegistry._updateRichSoilTier(player, newRichSoilTier);

        // This event is a bit broad, consider more specific events if needed
        emit FarmUpgradeActivated(player, newlyAchievedTier, "Multiple", 0); 
    }


    // --- Getters for current player bonuses (called by FarmManager, ShopManager) ---
    function getIrrigationBonus(address player) external view returns (uint8) {
        PlayerProfile memory profile = playerRegistry.getPlayerProfile(player);
        if (profile.irrigationSystemTier == 0) return 0;
        return irrigationBonuses[profile.irrigationSystemTier];
    }

    function getGreenhouseBoostPercent(address player) external view returns (uint8) {
        PlayerProfile memory profile = playerRegistry.getPlayerProfile(player);
        if (profile.greenhouseTier == 0) return 0;
        return greenhouseBoostsPct[profile.greenhouseTier];
    }

    function getSeedSaverChancePercent(address player) external view returns (uint8) {
        PlayerProfile memory profile = playerRegistry.getPlayerProfile(player);
        if (profile.seedSaverTier == 0) return 0;
        return seedSaverChancesPct[profile.seedSaverTier];
    }

    function getRichSoilBoostPercent(address player) external view returns (uint8) {
        PlayerProfile memory profile = playerRegistry.getPlayerProfile(player);
        if (profile.richSoilTier == 0) return 0;
        return richSoilBoostsPct[profile.richSoilTier];
    }
    
    function getMonadiumSickleHarvestBonusPercent(address player) external view returns (uint8) {
        PlayerProfile memory profile = playerRegistry.getPlayerProfile(player);
        return profile.ownsMonadiumSickle ? 5 : 0; // 5% bonus if owned
    }

    // --- Lunar Harvester Logic (called by FarmManager or directly by player UI) ---
    function initiateLunarHarvest(address player, uint256 tileIndex, CropID cropId)
        external
        // access control: only FarmManager or player himself
    {
        PlayerProfile memory profile = playerRegistry.getPlayerProfile(player);
        require(profile.ownsLunarHarvester, "Player does not own Lunar Harvester");
        require(playerRegistry.getToolUsesToday(player, ItemID.LUNAR_HARVESTER_ITEM) < LUNAR_HARVESTER_MAX_USES_PER_DAY, "Max daily uses reached");
        
        CropData memory crop = itemRegistry.getCropData(cropId);
        require(crop.isRare, "Lunar Harvester only for rare crops");
        // FarmManager should verify tile is plantable, owned by player and holds this crop.
        // Assuming FarmManager has set the tile with plantedAt and correct cropId.

        // Calculate maturity time (FarmManager usually does this, but we need it here too)
        // This simplified version doesn't account for greenhouse boost for now, assuming base grow time.
        // A more integrated approach would have FarmManager pass the calculated maturity time.
        uint256 maturityTimestamp = timeOracle.getCurrentTimestamp() + crop.growTimeSeconds; // Simplification

        harvestBaskets[player][tileIndex] = HarvestBasket({
            cropId: cropId,
            projectedYieldCrops: crop.baseYield, // Base yield, RichSoil not applied by Lunar Harvester per description
            projectedItemDrops: crop.guaranteedItemDrops, // TODO: Add random drops with pseudo-random pre-determination
            projectedItemDropCounts: crop.guaranteedItemDropCounts,
            maturityTimestamp: maturityTimestamp,
            claimed: false
        });

        playerRegistry._recordToolUsage(player, ItemID.LUNAR_HARVESTER_ITEM);
        // FarmManager should mark the tile as locked: farmManager.lockTile(player, tileIndex);
        emit LunarHarvestInitiated(player, tileIndex, cropId, maturityTimestamp);
    }

    function claimLunarHarvest(address player, uint256 tileIndex)
        external
        // access control: only FarmManager (acting for player) or player himself
    {
        HarvestBasket storage basket = harvestBaskets[player][tileIndex];
        require(basket.maturityTimestamp > 0, "No harvest basket found");
        require(!basket.claimed, "Harvest already claimed");
        require(timeOracle.getCurrentTimestamp() >= basket.maturityTimestamp, "Crop not yet mature");

        // Award CROPS (directly to player, not via EconomyContract.mintCrops as it's from basket)
        playerRegistry._addItem(player, ItemID.CROPS_CURRENCY, basket.projectedYieldCrops * (10**18) /* TODO: use cropsToken.decimals() */);

        // Award items
        for (uint i = 0; i < basket.projectedItemDrops.length; i++) {
            playerRegistry._addItem(player, basket.projectedItemDrops[i], basket.projectedItemDropCounts[i]);
        }

        basket.claimed = true;
        // FarmManager should unlock the tile: farmManager.unlockTile(player, tileIndex) and clear it.
        emit LunarHarvestClaimed(player, tileIndex, basket.projectedYieldCrops);
    }

    // --- Monadium Hoe Logic (called by FarmManager or directly by player UI) ---
    function useMonadiumHoe(address player, uint256 tileIndex, CropID cropId)
        external
        // access control: only FarmManager or player himself
        returns (uint256 yieldAwarded)
    {
        PlayerProfile memory profile = playerRegistry.getPlayerProfile(player);
        require(profile.ownsMonadiumHoe, "Player does not own Monadium Hoe");
        require(playerRegistry.getToolUsesToday(player, ItemID.MONADIUM_HOE_ITEM) < MONADIUM_HOE_MAX_USES_PER_DAY, "Max daily uses reached");

        CropData memory crop = itemRegistry.getCropData(cropId);
        require(!crop.isRare, "Monadium Hoe only for non-rare crops");
        // FarmManager should verify tile ownership, emptiness, and seed availability.

        // Calculate yield: base + RichSoil (if active) + MonadiumSickle (if active, though applies to all harvests)
        uint256 finalYield = crop.baseYield;
        uint8 richSoilBonus = this.getRichSoilBoostPercent(player);
        if (richSoilBonus > 0) {
            finalYield += (finalYield * richSoilBonus) / 100;
        }
        uint8 sickleBonus = this.getMonadiumSickleHarvestBonusPercent(player);
        if (sickleBonus > 0) {
            finalYield += (finalYield * sickleBonus) / 100;
        }
        yieldAwarded = finalYield * (10**18); //TODO: use cropsToken.decimals()

        // Award CROPS directly
        playerRegistry._addItem(player, ItemID.CROPS_CURRENCY, yieldAwarded);

        playerRegistry._recordToolUsage(player, ItemID.MONADIUM_HOE_ITEM);
        // FarmManager should consume seed and log the action, tile remains clear.
        emit MonadiumHoeUsed(player, tileIndex, cropId, yieldAwarded);
        return yieldAwarded;
    }
    
    function setExternalContracts(address _playerRegistryAddress, address _timeOracleAddress, address _itemRegistryAddress) external onlyOwner {
        require(_playerRegistryAddress != address(0));
        require(_timeOracleAddress != address(0));
        require(_itemRegistryAddress != address(0));
        playerRegistry = PlayerRegistryInventory(_playerRegistryAddress);
        timeOracle = TimeOracle(_timeOracleAddress);
        itemRegistry = ItemRegistry(_itemRegistryAddress);
    }
} 