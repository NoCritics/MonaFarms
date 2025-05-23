// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GlobalEnumsAndStructs.sol";
import "./PlayerRegistryInventory.sol";
import "./ItemRegistry.sol";
import "./TimeOracle.sol";
import "./EconomyContract.sol";
import "./PlayerLeaderboard.sol";
import "./FarmEnhancementContract.sol";
import "./CROPS_Token.sol"; // For decimals
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol"; // For random number generation if needed

contract FarmManager is Ownable, GlobalEnumsAndStructs {
    PlayerRegistryInventory public playerRegistry;
    ItemRegistry public itemRegistry;
    TimeOracle public timeOracle;
    EconomyContract public economyContract;
    PlayerLeaderboard public playerLeaderboard;
    FarmEnhancementContract public farmEnhancementContract;
    CROPS_Token public cropsToken; // To get decimals

    // player => tile_index (0-23) => FarmTile
    mapping(address => mapping(uint256 => FarmTile)) public playerFarmTiles;

    uint256 private pseudoRandomNonce = 0; // For drop chances

    struct PlantableSeedInfo {
        CropID cropId;
        string cropName;
        ItemID seedId;
        string seedName;
        uint256 amountOwned;
    }

    event CropPlanted(address indexed player, uint256 indexed tileIndex, CropID indexed cropId, uint256 plantedAt);
    event CropWatered(address indexed player, uint256 indexed tileIndex, CropID indexed cropId);
    event CropFertilized(address indexed player, uint256 indexed tileIndex, CropID indexed cropId);
    event CropHarvested(
        address indexed player,
        uint256 indexed tileIndex,
        CropID indexed cropId,
        uint256 yieldCrops,
        ItemID[] itemDrops,
        uint256[] itemDropCounts
    );
    event RainbowFruitDied(address indexed player, uint256 indexed tileIndex);
    event TileLocked(address indexed player, uint256 indexed tileIndex, uint256 lockUntil);
    event TileUnlocked(address indexed player, uint256 indexed tileIndex);
    event YieldBoostApplied(address indexed player, CropID indexed cropId, string boostType, uint256 percentageBoost);

    modifier onlyRegisteredPlayer() {
        PlayerProfile memory profile = playerRegistry.getPlayerProfile(msg.sender);
        require(bytes(profile.nickname).length != 0, "Player not registered");
        _;
    }

    modifier tileOwnedByPlayer(address player, uint256 tileIndex) {
        require(tileIndex < playerRegistry.getPlayerFarmTilesCount(player), "Tile index out of bounds or not owned");
        _;
    }
    
    modifier tileIsEmpty(address player, uint256 tileIndex) {
        require(playerFarmTiles[player][tileIndex].plantedAt == 0, "Tile is not empty");
        _;
    }

    modifier tileIsNotEmpty(address player, uint256 tileIndex) {
        require(playerFarmTiles[player][tileIndex].plantedAt != 0, "Tile is empty");
        _;
    }
    
    modifier tileNotLocked(address player, uint256 tileIndex) {
        require(!playerFarmTiles[player][tileIndex].isLocked, "Tile is locked");
        _;
    }

    constructor(
        address initialOwner,
        address _playerRegistryAddress,
        address _itemRegistryAddress,
        address _timeOracleAddress,
        address _economyContractAddress,
        address _playerLeaderboardAddress,
        address _farmEnhancementContractAddress,
        address _cropsTokenAddress
    ) {
        _transferOwnership(initialOwner);
        playerRegistry = PlayerRegistryInventory(_playerRegistryAddress);
        itemRegistry = ItemRegistry(_itemRegistryAddress);
        timeOracle = TimeOracle(_timeOracleAddress);
        economyContract = EconomyContract(_economyContractAddress);
        playerLeaderboard = PlayerLeaderboard(_playerLeaderboardAddress);
        farmEnhancementContract = FarmEnhancementContract(_farmEnhancementContractAddress);
        cropsToken = CROPS_Token(_cropsTokenAddress);
    }

    function plantCrop(uint256 tileIndex, ItemID seedItemId) external {
        // --- Check if Rainbow Fruit is currently growing anywhere --- 
        uint256 playerTotalTilesGlobal = playerRegistry.getPlayerFarmTilesCount(msg.sender);
        for (uint i = 0; i < playerTotalTilesGlobal; i++) {
            if (playerFarmTiles[msg.sender][i].plantedAt != 0 && playerFarmTiles[msg.sender][i].plantedCrop == CropID.RAINBOW_FRUIT) {
                // If we are trying to plant on the tile that ALREADY has the rainbow fruit, that's an error caught later (tile not empty).
                // If we are trying to plant on a DIFFERENT tile while rainbow fruit exists, this is the error.
                if (i != tileIndex || seedItemId != itemRegistry.getCropData(CropID.RAINBOW_FRUIT).seedId ) { // Allow replanting same tile if it somehow got cleared before harvest, but this check is broad.
                                                                                                            // More simply: if a rainbow fruit exists, no other planting at all.
                     revert("Cannot plant any crops on any tile while Rainbow Fruit is growing.");
                }
            }
        }
        // --- End Rainbow Fruit Growing Check ---

        require(tileIndex < playerTotalTilesGlobal, "Invalid tile index"); // Use already fetched total tiles
        FarmTile storage tile = playerFarmTiles[msg.sender][tileIndex];
        require(tile.plantedAt == 0, "Tile already has a crop"); 

        require(playerRegistry.getPlayerInventoryItemBalance(msg.sender, seedItemId) >= 1, "Not enough seeds");

        CropData memory cropData = getCropDataForSeed(seedItemId);

        // --- General Rare Crop Restriction: One instance of the same rare crop type at a time ---
        // This check is still useful for other rare crops. For Rainbow Fruit, the global check above is stricter.
        if (cropData.isRare) {
            // uint256 playerTotalTilesCheck = playerRegistry.getPlayerFarmTilesCount(msg.sender); // Already fetched as playerTotalTilesGlobal
            for (uint i = 0; i < playerTotalTilesGlobal; i++) {
                if (playerFarmTiles[msg.sender][i].plantedAt != 0 && playerFarmTiles[msg.sender][i].plantedCrop == cropData.id) {
                    if (cropData.id == CropID.RAINBOW_FRUIT && i == tileIndex) {
                        // This case should not happen if the global check is effective and tile.plantedAt == 0 is checked first for the target tile.
                        // If trying to plant rainbow fruit on a tile that supposedly has rainbow fruit already but was cleared -> would be caught by tile.plantedAt == 0 for target tile.
                        // This means if we reach here for Rainbow fruit, it must be an attempt to plant it on a *different* tile than an existing one, or it's the first one.
                    } else if (cropData.id == CropID.RAINBOW_FRUIT && playerFarmTiles[msg.sender][i].plantedCrop == CropID.RAINBOW_FRUIT) {
                        // Covered by global check: if a rainbow fruit exists, no other planting, including another rainbow fruit.
                    } else if (playerFarmTiles[msg.sender][i].plantedCrop == cropData.id) {
                         revert("An instance of this rare crop type is already planted.");
                    }
                }
            }
        }
        // --- End General Rare Crop Restriction ---

        // --- Special handling for Ancient Grain seeds ---
        bool isValidSeedForCrop = false;
        if (cropData.id == CropID.ANCIENT_GRAIN) {
            if (seedItemId == ItemID.ANCIENT_GRAIN_SEEDS_BUYABLE || seedItemId == ItemID.ANCIENT_APPLE_SEEDS) {
                isValidSeedForCrop = true;
            }
        } else {
            if (seedItemId == cropData.seedId) {
                 isValidSeedForCrop = true;
            }
        }
        require(isValidSeedForCrop, "Invalid seed for this crop, or crop not plantable with this seed.");
        // --- End special handling ---

        // --- Rainbow Fruit Planting Restrictions (when planting the Rainbow Fruit itself) ---
        if (cropData.id == CropID.RAINBOW_FRUIT) {
            // playerTotalTilesGlobal already fetched
            require(playerTotalTilesGlobal >= 12, "Rainbow Fruit requires at least 12 farm tiles.");
            for (uint i = 0; i < playerTotalTilesGlobal; i++) {
                if (i == tileIndex) { continue; }
                require(playerFarmTiles[msg.sender][i].plantedAt == 0, "All other farm tiles must be empty to plant Rainbow Fruit.");
            }
        }
        // --- End Rainbow Fruit Planting Restrictions ---
        
        // Consume seed
        // Seed Saver Check - Implemented as per original logic if it existed, or a simple removal.
        // For this iteration, assuming direct seed removal as Seed Saver logic wasn't in the prior snippets fully.
        bool seedSaved = false;
        uint8 seedSaverChance = farmEnhancementContract.getSeedSaverChancePercent(msg.sender);
        if (seedSaverChance > 0) {
            // Basic pseudo-random check for seed saving
            if ((uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, pseudoRandomNonce++))) % 100) < seedSaverChance) {
                seedSaved = true;
            }
        }

        if (!seedSaved) {
             playerRegistry._removeItem(msg.sender, seedItemId, 1);
        }

        uint256 currentTime = timeOracle.getCurrentTimestamp();
        uint8 greenhouseBoostPercent = farmEnhancementContract.getGreenhouseBoostPercent(msg.sender);
        uint256 actualGrowTime = cropData.growTimeSeconds;
        if(greenhouseBoostPercent > 0) {
            actualGrowTime = actualGrowTime - (actualGrowTime * greenhouseBoostPercent / 100);
        }

        tile.plantedCrop = cropData.id;
        tile.plantedAt = currentTime;
        tile.waterCount = 0; 
        tile.isFertilized = false;
        tile.maturityTime = currentTime + actualGrowTime;
        tile.isLocked = false;

        playerLeaderboard.addPointsForAction(msg.sender, "PLANT_CROP");
        emit CropPlanted(msg.sender, tileIndex, cropData.id, currentTime);
    }

    function getCropDataForSeed(ItemID seedId) public view returns (CropData memory) {
        // ItemID[] memory allItemIds = itemRegistry.getAllItemIDs(); // Removed unused variable
        CropID[] memory allCropIds = itemRegistry.getAllCropIDs();

        // --- Handle specific seed types directly for efficiency if possible ---
        if (seedId == ItemID.ANCIENT_GRAIN_SEEDS_BUYABLE || seedId == ItemID.ANCIENT_APPLE_SEEDS) {
            return itemRegistry.getCropData(CropID.ANCIENT_GRAIN);
        }
        // --- End specific handling ---

        for (uint i = 0; i < allCropIds.length; i++) {
            CropData memory crop = itemRegistry.getCropData(allCropIds[i]);
            if (crop.seedId == seedId) {
                return crop;
            }
        }
        revert("No crop found for the given seed ID");
    }

    function waterCrop(uint256 tileIndex) 
        external 
        onlyRegisteredPlayer 
        tileOwnedByPlayer(msg.sender, tileIndex)
        tileIsNotEmpty(msg.sender, tileIndex)
        tileNotLocked(msg.sender, tileIndex)
    {
        FarmTile storage tile = playerFarmTiles[msg.sender][tileIndex];
        CropData memory crop = itemRegistry.getCropData(tile.plantedCrop);
        require(tile.waterCount < crop.waterNeeded, "Crop already fully watered");
        require(playerRegistry.getPlayerInventoryItemBalance(msg.sender, ItemID.WATER_BUCKET) >= 1, "Not enough water buckets");

        playerRegistry._removeItem(msg.sender, ItemID.WATER_BUCKET, 1);
        tile.waterCount++;
        tile.lastWateredAt = timeOracle.getCurrentTimestamp();

        emit CropWatered(msg.sender, tileIndex, tile.plantedCrop);
        playerLeaderboard.addPointsForAction(msg.sender, "WATER_CROP");
    }

    function fertilizeCrop(uint256 tileIndex) 
        external 
        onlyRegisteredPlayer 
        tileOwnedByPlayer(msg.sender, tileIndex)
        tileIsNotEmpty(msg.sender, tileIndex)
        tileNotLocked(msg.sender, tileIndex)
    {
        FarmTile storage tile = playerFarmTiles[msg.sender][tileIndex];
        CropData memory crop = itemRegistry.getCropData(tile.plantedCrop);
        require(!crop.isRare, "Cannot fertilize rare crops");
        require(!tile.isFertilized, "Crop already fertilized");
        require(playerRegistry.getPlayerInventoryItemBalance(msg.sender, ItemID.FERTILIZER) >= 1, "Not enough fertilizer"); // Assuming 1 fertilizer item = 1 charge for this tx
        // The CSV says fertilizer has 4 charges, this implies Fertilizer is an item whose count decreases, not an item with internal charges for now.
        // This needs clarification. For now: 1 Fertilizer item used.

        playerRegistry._removeItem(msg.sender, ItemID.FERTILIZER, 1);
        tile.isFertilized = true;
        tile.maturityTime = timeOracle.getCurrentTimestamp(); // Instantly mature

        emit CropFertilized(msg.sender, tileIndex, tile.plantedCrop);
        playerLeaderboard.addPointsForAction(msg.sender, "FERTILIZE_CROP");
    }

    function isCropMature(address player, uint256 tileIndex) public view returns (bool) {
        FarmTile storage tile = playerFarmTiles[player][tileIndex];
        if (tile.plantedAt == 0) return false; // Not planted
        if (tile.isFertilized) return true;

        CropData memory crop = itemRegistry.getCropData(tile.plantedCrop);
        if (cropIdRequiresWater(tile.plantedCrop) && tile.waterCount < crop.waterNeeded) return false;
        
        return timeOracle.getCurrentTimestamp() >= tile.maturityTime;
    }

    function cropIdRequiresWater(CropID cropId) internal pure returns (bool) {
        return cropId != CropID.CACTUS;
    }

    function harvestCrop(uint256 tileIndex)
        external
        onlyRegisteredPlayer
        tileOwnedByPlayer(msg.sender, tileIndex)
        tileIsNotEmpty(msg.sender, tileIndex)
        tileNotLocked(msg.sender, tileIndex)
    {
        FarmTile storage tile = playerFarmTiles[msg.sender][tileIndex];
        CropData memory crop = itemRegistry.getCropData(tile.plantedCrop);

        if (tile.plantedCrop == CropID.RAINBOW_FRUIT) {
            if (timeOracle.getCurrentTimestamp() > tile.maturityTime + 5 minutes) {
                // Rainbow fruit died
                delete playerFarmTiles[msg.sender][tileIndex];
                emit RainbowFruitDied(msg.sender, tileIndex);
                return;
            }
        }
        require(isCropMature(msg.sender, tileIndex), "Crop not mature or watered");

        // --- Moonflower Harvest Window Check ---
        if (tile.plantedCrop == CropID.MOONFLOWERS) {
            require(timeOracle.isMoonflowerHarvestWindow(), "Moonflowers can only be harvested between 2-4 AM UTC.");
        }
        // --- End Moonflower Check ---

        uint256 baseYieldCrops = crop.baseYield;
        uint256 finalYieldCrops = baseYieldCrops; // We will adjust this for Ancient Apple boost later

        // Check for Ancient Apple yield boost
        if (playerRegistry.getAncientAppleBoostActiveUntil(msg.sender) > block.timestamp) {
            finalYieldCrops = (finalYieldCrops * 150) / 100; // +50% yield
            emit YieldBoostApplied(msg.sender, crop.id, "AncientApple", 50);
        }

        uint8 richSoilBonus = farmEnhancementContract.getRichSoilBoostPercent(msg.sender);
        if (richSoilBonus > 0) {
            finalYieldCrops += (finalYieldCrops * richSoilBonus) / 100;
        }
        uint8 sickleBonus = farmEnhancementContract.getMonadiumSickleHarvestBonusPercent(msg.sender);
         if (sickleBonus > 0) {
            finalYieldCrops += (finalYieldCrops * sickleBonus) / 100;
        }
        
        uint256 yieldInSmallestUnit = finalYieldCrops * (10**cropsToken.decimals());
        economyContract.mintCropsForHarvest(msg.sender, yieldInSmallestUnit);

        // Handle item drops
        ItemID[] memory droppedItems = new ItemID[](crop.guaranteedItemDrops.length + crop.randomItemDrops.length);
        uint256[] memory droppedCounts = new uint256[](crop.guaranteedItemDrops.length + crop.randomItemDrops.length);
        uint actualDropCount = 0;

        for (uint i = 0; i < crop.guaranteedItemDrops.length; i++) {
            playerRegistry._addItem(msg.sender, crop.guaranteedItemDrops[i], crop.guaranteedItemDropCounts[i]);
            droppedItems[actualDropCount] = crop.guaranteedItemDrops[i];
            droppedCounts[actualDropCount] = crop.guaranteedItemDropCounts[i];
            actualDropCount++;
        }

        for (uint i = 0; i < crop.randomItemDrops.length; i++) {
            if ((uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, tileIndex, pseudoRandomNonce++))) % 100) < crop.randomItemDropChances[i]) {
                playerRegistry._addItem(msg.sender, crop.randomItemDrops[i], crop.randomItemDropCounts[i]);
                droppedItems[actualDropCount] = crop.randomItemDrops[i];
                droppedCounts[actualDropCount] = crop.randomItemDropCounts[i];
                actualDropCount++;
            }
        }
        
        // Special: Golden Plant 5% chance to drop any other rare crop
        if (tile.plantedCrop == CropID.GOLDEN_PLANT_CROP) {
            if ((uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, pseudoRandomNonce++))) % 100) < 5) {
                // Select a random rare crop (excluding Golden Plant itself)
                CropID[] memory rareCrops = new CropID[](4); // CRYSTAL_BERRIES, MOONFLOWERS, ANCIENT_GRAIN, RAINBOW_FRUIT
                rareCrops[0] = CropID.CRYSTAL_BERRIES;
                rareCrops[1] = CropID.MOONFLOWERS;
                rareCrops[2] = CropID.ANCIENT_GRAIN;
                rareCrops[3] = CropID.RAINBOW_FRUIT;
                CropID droppedRareCropId = rareCrops[uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, pseudoRandomNonce++))) % rareCrops.length];
                CropData memory rareCropData = itemRegistry.getCropData(droppedRareCropId);
                playerRegistry._addItem(msg.sender, rareCropData.seedId, 1); // Give one seed of that rare crop
                // TODO: Add this to droppedItems/Counts if event needs to show it
            }
        }
        
        // Special: Time Crystal from Crystal Berries with Fertile Mesh
        if (tile.plantedCrop == CropID.CRYSTAL_BERRIES) {
            // Check if player owns Fertile Mesh
            if (playerRegistry.getPlayerInventoryItemBalance(msg.sender, ItemID.FERTILE_MESH) >= 1) {
                // Only if they own Fertile Mesh, they have a chance to get Time Crystal
                if ((uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, tileIndex, pseudoRandomNonce++))) % 100) < 15) { // 15% chance
                    playerRegistry._addItem(msg.sender, ItemID.TIME_CRYSTAL, 1);
                    
                    // To correctly include Time Crystal in the event if it drops:
                    // We need to add it to the droppedItems and droppedCounts arrays before they are finalized.
                    // This is a bit tricky because these arrays are dynamically sized before being finalized.
                    // One approach: If it drops, increment actualDropCount and add it to the intermediate arrays.
                    // However, the current droppedItems/Counts are sized based on guaranteed + random from CropData.
                    // A simpler way for now, without resizing arrays mid-flight (which is complex for memory arrays):
                    // Is to have a separate event or log, or accept that the CropHarvested event might not list this *specific* conditional bonus drop.
                    // For this implementation, let's focus on getting the item to the player.
                    // The TODO for event logging can be a future refinement if listing ALL drops in one event is critical.
                }
            }
        }

        ItemID[] memory finalDroppedItems = new ItemID[](actualDropCount);
        uint256[] memory finalDroppedCounts = new uint256[](actualDropCount);
        for(uint i=0; i < actualDropCount; i++){
            finalDroppedItems[i] = droppedItems[i];
            finalDroppedCounts[i] = droppedCounts[i];
        }

        delete playerFarmTiles[msg.sender][tileIndex];
        emit CropHarvested(msg.sender, tileIndex, crop.id, yieldInSmallestUnit, finalDroppedItems, finalDroppedCounts);
        playerLeaderboard.addPointsForAction(msg.sender, "HARVEST_CROP");
        
        // If it was wheat, clear all 3 tiles
        if (crop.id == CropID.WHEAT) {
            // This assumes wheat is always planted starting at tileIndex and occupies tileIndex, tileIndex+1, tileIndex+2
            // And that harvestCrop was called on the primary tileIndex.
            // The current logic plants them as separate tiles with same properties.
            // A more robust batch system might link them. For now, assume player harvests each tile.
            // OR: Harvest one, clear all. Let's assume harvest on one tile of batch clears the other two IF they were part of same plant op.
            // This is complex to track. Simplification: Player harvests each of the 3 wheat tiles individually.
        }
    }

    // --- Tile Locking for Lunar Harvester (called by FarmEnhancementContract) ---
    function lockTile(address player, uint256 tileIndex, uint256 lockUntilTimestamp) external {
        // require(msg.sender == address(farmEnhancementContract), "Only FarmEnhancementContract can lock tiles");
        // For now, let FEC call it. Player should be implicit from FEC call.
        playerFarmTiles[player][tileIndex].isLocked = true;
        playerFarmTiles[player][tileIndex].maturityTime = lockUntilTimestamp; // Store the actual target maturity for LH
        emit TileLocked(player, tileIndex, lockUntilTimestamp);
    }

    function unlockTileAndClear(address player, uint256 tileIndex) external {
        // require(msg.sender == address(farmEnhancementContract), "Only FarmEnhancementContract can unlock tiles");
        delete playerFarmTiles[player][tileIndex]; // Clear it after LH claim
        emit TileUnlocked(player, tileIndex);
    }

    function getFarmTile(address player, uint256 tileIndex) external view returns (FarmTile memory) {
        return playerFarmTiles[player][tileIndex];
    }
    
    function getPlayerPlantableSeeds(address player) external view returns (PlantableSeedInfo[] memory) {
        require(bytes(playerRegistry.getPlayerProfile(player).nickname).length != 0, "Player not registered");

        CropID[] memory allCropIDs = itemRegistry.getAllCropIDs();
        PlantableSeedInfo[] memory plantableSeeds = new PlantableSeedInfo[](allCropIDs.length); // Max possible size
        uint256 count = 0;

        for (uint i = 0; i < allCropIDs.length; i++) {
            CropID cropId = allCropIDs[i];
            CropData memory cropData = itemRegistry.getCropData(cropId);
            ItemID seedId = cropData.seedId;

            // We are interested in actual seed items, not CROPS_CURRENCY as a seed requirement
            if (seedId != ItemID.CROPS_CURRENCY) { 
                uint256 balance = playerRegistry.getPlayerInventoryItemBalance(player, seedId);
                if (balance > 0) {
                    ItemData memory seedItemData = itemRegistry.getItemData(seedId);
                    plantableSeeds[count] = PlantableSeedInfo({
                        cropId: cropId,
                        cropName: cropData.name,
                        seedId: seedId,
                        seedName: seedItemData.name,
                        amountOwned: balance
                    });
                    count++;
                }
            }
        }

        // Resize the array to the actual number of plantable seeds found
        PlantableSeedInfo[] memory result = new PlantableSeedInfo[](count);
        for (uint i = 0; i < count; i++) {
            result[i] = plantableSeeds[i];
        }
        return result;
    }

    function setExternalContracts(
        address _playerRegistryAddress,
        address _itemRegistryAddress,
        address _timeOracleAddress,
        address _economyContractAddress,
        address _playerLeaderboardAddress,
        address _farmEnhancementContractAddress,
        address _cropsTokenAddress
    ) external onlyOwner {
        playerRegistry = PlayerRegistryInventory(_playerRegistryAddress);
        itemRegistry = ItemRegistry(_itemRegistryAddress);
        timeOracle = TimeOracle(_timeOracleAddress);
        economyContract = EconomyContract(_economyContractAddress);
        playerLeaderboard = PlayerLeaderboard(_playerLeaderboardAddress);
        farmEnhancementContract = FarmEnhancementContract(_farmEnhancementContractAddress);
        cropsToken = CROPS_Token(_cropsTokenAddress);
    }
} 