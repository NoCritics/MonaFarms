// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GlobalEnumsAndStructs.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ItemRegistry is Ownable, GlobalEnumsAndStructs {
    mapping(ItemID => ItemData) public items;
    mapping(CropID => CropData) public crops;

    // To keep track of all defined item and crop IDs for iteration if necessary (e.g., for a front-end)
    ItemID[] public allItemIDs;
    CropID[] public allCropIDs;

    event ItemRegistered(ItemID indexed id, string name);
    event ItemUpdated(ItemID indexed id);
    event CropRegistered(CropID indexed id, string name);
    event CropUpdated(CropID indexed id);

    constructor(address initialOwner) {
        _transferOwnership(initialOwner);
    }

    // --- Item Management ---
    function registerItem(
        ItemID id,
        string calldata name,
        uint256 purchasePrice,
        bool isBuyable,
        AchievementTier requiredTierToBuy,
        uint8 charges
    ) external {
        require(bytes(items[id].name).length == 0, "Item already registered");
        items[id] = ItemData({
            name: name,
            id: id,
            purchasePrice: purchasePrice,
            isBuyable: isBuyable,
            requiredTierToBuy: requiredTierToBuy,
            charges: charges
        });
        allItemIDs.push(id);
        emit ItemRegistered(id, name);
    }

    function updateItemPrice(ItemID id, uint256 newPrice) external onlyOwner {
        require(bytes(items[id].name).length != 0, "Item not registered");
        items[id].purchasePrice = newPrice;
        emit ItemUpdated(id);
    }

    // --- Crop Management ---
    function registerCrop(
        CropID id,
        string calldata name,
        ItemID seedId,
        uint256 growTimeSeconds,
        uint256 baseYield,
        uint8 waterNeeded,
        bool isRare,
        uint256 purchasePriceSeeds, // Price for its seeds
        AchievementTier requiredTierToBuySeeds,
        ItemID[] calldata guaranteedItemDrops,
        uint256[] calldata guaranteedItemDropCounts,
        ItemID[] calldata randomItemDrops,
        uint256[] calldata randomItemDropChances,
        uint256[] calldata randomItemDropCounts
    ) external {
        require(bytes(crops[id].name).length == 0, "Crop already registered");
        require(guaranteedItemDrops.length == guaranteedItemDropCounts.length, "Guaranteed drop array length mismatch");
        require(randomItemDrops.length == randomItemDropChances.length && randomItemDrops.length == randomItemDropCounts.length, "Random drop array length mismatch");

        crops[id] = CropData({
            name: name,
            id: id,
            seedId: seedId,
            growTimeSeconds: growTimeSeconds,
            baseYield: baseYield,
            waterNeeded: waterNeeded,
            isRare: isRare,
            purchasePrice: purchasePriceSeeds,
            requiredTierToBuy: requiredTierToBuySeeds,
            guaranteedItemDrops: guaranteedItemDrops,
            guaranteedItemDropCounts: guaranteedItemDropCounts,
            randomItemDrops: randomItemDrops,
            randomItemDropChances: randomItemDropChances,
            randomItemDropCounts: randomItemDropCounts
        });
        allCropIDs.push(id);
        emit CropRegistered(id, name);
    }

    function updateCropYield(CropID id, uint256 newYield) external onlyOwner {
        require(bytes(crops[id].name).length != 0, "Crop not registered");
        crops[id].baseYield = newYield;
        emit CropUpdated(id);
    }

    function updateCropGrowTime(CropID id, uint256 newGrowTime) external onlyOwner {
        require(bytes(crops[id].name).length != 0, "Crop not registered");
        crops[id].growTimeSeconds = newGrowTime;
        emit CropUpdated(id);
    }

    function updateCropSeedPrice(CropID id, uint256 newSeedPrice) external onlyOwner {
        require(bytes(crops[id].name).length != 0, "Crop not registered");
        crops[id].purchasePrice = newSeedPrice; // This is the seed purchase price
        emit CropUpdated(id);
    }

    // --- Getters ---
    function getItemData(ItemID id) external view returns (ItemData memory) {
        require(bytes(items[id].name).length != 0, "Item not registered");
        return items[id];
    }

    function getCropData(CropID id) external view returns (CropData memory) {
        require(bytes(crops[id].name).length != 0, "Crop not registered");
        return crops[id];
    }

    function getAllItemIDs() external view returns (ItemID[] memory) {
        return allItemIDs;
    }

    function getAllCropIDs() external view returns (CropID[] memory) {
        return allCropIDs;
    }

    function getAllItemNames() external view returns (string[] memory) {
        string[] memory names = new string[](allItemIDs.length);
        for (uint i = 0; i < allItemIDs.length; i++) {
            names[i] = items[allItemIDs[i]].name;
        }
        return names;
    }

    function getAllCropNames() external view returns (string[] memory) {
        string[] memory names = new string[](allCropIDs.length);
        for (uint i = 0; i < allCropIDs.length; i++) {
            names[i] = crops[allCropIDs[i]].name;
        }
        return names;
    }

    // --- Helper to initialize all game items and crops as per CSV/TXT files ---
    // This function would be called once by the owner after deployment.
    // For brevity, only a few examples are shown. The full list would be extensive.
    function initializeDefaultData() external onlyOwner {
        // ITEMS
        this.registerItem(ItemID.WATER_BUCKET, "Water Bucket", 50, true, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.FERTILIZER, "Fertilizer", 100, true, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.GOLDEN_SEED_ITEM, "Golden Seeds", 0, false, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.CRYSTAL_ESSENCE, "Crystal Essence", 0, false, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.MOONLEAF, "Moonleaf", 0, false, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.ANCIENT_APPLE, "Ancient Apple", 0, false, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.RAINBOW_SHARD, "Rainbow Shard", 0, false, AchievementTier.BEGINNER, 0);
        
        this.registerItem(ItemID.POTATO_SEED, "Potato Seed", 10, true, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.TOMATO_SEED, "Tomato Seed", 30, true, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.STRAWBERRY_SEED, "Strawberry Seed", 50, true, AchievementTier.BEGINNER, 0);

        this.registerItem(ItemID.CORN_SEED, "Corn Seed", 25, true, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.CARROT_SEED, "Carrot Seed", 20, true, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.PUMPKIN_SEED, "Pumpkin Seed", 35, true, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.WHEAT_SEED, "Wheat Seed", 15, true, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.WATERMELON_SEED, "Watermelon Seed", 60, true, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.CACTUS_SEED, "Cactus Seed", 30, true, AchievementTier.BEGINNER, 0);

        this.registerItem(ItemID.CRYSTAL_BERRIES_SEED, "Crystal Berries Seed", 200, true, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.MOONFLOWERS_SEED, "Moonflowers Seed", 200, true, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.RAINBOW_FRUIT_SEED, "Rainbow Fruit Seed", 500, true, AchievementTier.EXPERT, 0);

        // ANCIENT_APPLE_SEEDS is ItemID 21, ANCIENT_GRAIN_SEEDS_BUYABLE is ItemID 20
        this.registerItem(ItemID.ANCIENT_APPLE_SEEDS, "Ancient Apple Seeds (Gift)", 0, false, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.ANCIENT_GRAIN_SEEDS_BUYABLE, "Ancient Grain Seeds", 250, true, AchievementTier.INTERMEDIATE, 0); // Was ItemID.ANCIENT_GRAIN_SEEDS_BUYABLE

        this.registerItem(ItemID.RAINBOW_CORE, "Rainbow Core", 0, false, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.ESSENCE_EXTRACTOR, "Essence Extractor", 150, true, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.WOOD, "Wood", 25, true, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.FABRIC, "Fabric", 40, true, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.GOLD_DUST, "Gold Dust", 0, false, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.TIME_CRYSTAL, "Time Crystal", 0, false, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.FERTILE_MESH, "Fertile Mesh", 0, false, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.GROWTH_LAMP, "Growth Lamp", 0, false, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.RAINCATCHER, "Raincatcher", 0, false, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.LUNAR_HARVESTER_ITEM, "Lunar Harvester", 0, false, AchievementTier.BEGINNER, 0);
        this.registerItem(ItemID.MONADIUM_SICKLE_ITEM, "Monadium Sickle", 0, false, AchievementTier.EXPERT, 0);
        this.registerItem(ItemID.MONADIUM_HOE_ITEM, "Monadium Hoe", 0, false, AchievementTier.EXPERT, 0);
        this.registerItem(ItemID.BLUEPRINT_MONADIUM_SICKLE, "Blueprint: Monadium Sickle", 0, false, AchievementTier.EXPERT, 0);
        this.registerItem(ItemID.BLUEPRINT_MONADIUM_HOE, "Blueprint: Monadium Hoe", 0, false, AchievementTier.EXPERT, 0);
        this.registerItem(ItemID.FARM_TILE_ITEM, "Farm Tile", 250, true, AchievementTier.BEGINNER, 0);

        // CROPS (Seed ID, Grow Time, Yield, Water, IsRare, Seed Price, TierToBuySeeds, Guaranteed Drops, Random Drops)
        // Basic Crops
        this.registerCrop(CropID.POTATO, "Potato", ItemID.POTATO_SEED, 3 hours, 40, 1, false, 10, AchievementTier.BEGINNER, new ItemID[](0), new uint256[](0), new ItemID[](0), new uint256[](0), new uint256[](0));
        this.registerCrop(CropID.TOMATO, "Tomato", ItemID.TOMATO_SEED, 2 hours, 50, 1, false, 30, AchievementTier.BEGINNER, new ItemID[](0), new uint256[](0), new ItemID[](0), new uint256[](0), new uint256[](0));
        this.registerCrop(CropID.STRAWBERRY, "Strawberry", ItemID.STRAWBERRY_SEED, 1 hours, 75, 1, false, 0, AchievementTier.BEGINNER, new ItemID[](0), new uint256[](0), new ItemID[](0), new uint256[](0), new uint256[](0));

        // Standard Expansion Crops - now point to their specific seed ItemID, seed price in CropData is 0
        this.registerCrop(CropID.CORN, "Corn", ItemID.CORN_SEED, 2.5 hours, 55, 1, false, 0, AchievementTier.BEGINNER, new ItemID[](0), new uint256[](0), new ItemID[](0), new uint256[](0), new uint256[](0));
        this.registerCrop(CropID.CARROT, "Carrot", ItemID.CARROT_SEED, 0.75 hours, 35, 1, false, 0, AchievementTier.BEGINNER, new ItemID[](0), new uint256[](0), new ItemID[](0), new uint256[](0), new uint256[](0));
        this.registerCrop(CropID.PUMPKIN, "Pumpkin", ItemID.PUMPKIN_SEED, 4 hours, 80, 2, false, 0, AchievementTier.BEGINNER, new ItemID[](0), new uint256[](0), new ItemID[](0), new uint256[](0), new uint256[](0));
        this.registerCrop(CropID.WHEAT, "Wheat", ItemID.WHEAT_SEED, 0.5 hours, 30, 1, false, 0, AchievementTier.BEGINNER, new ItemID[](0), new uint256[](0), new ItemID[](0), new uint256[](0), new uint256[](0)); // Price per unit, yield per unit
        this.registerCrop(CropID.WATERMELON, "Watermelon", ItemID.WATERMELON_SEED, 6 hours, 130, 1, false, 0, AchievementTier.BEGINNER, new ItemID[](0), new uint256[](0), new ItemID[](0), new uint256[](0), new uint256[](0));
        this.registerCrop(CropID.CACTUS, "Cactus", ItemID.CACTUS_SEED, 2 hours, 60, 0, false, 0, AchievementTier.BEGINNER, new ItemID[](0), new uint256[](0), new ItemID[](0), new uint256[](0), new uint256[](0));

        // Rare Crops - now point to their specific seed ItemID where applicable
        ItemID[] memory goldenPlantGuaranteedDrop = new ItemID[](1);
        goldenPlantGuaranteedDrop[0] = ItemID.GOLDEN_SEED_ITEM;
        uint256[] memory goldenPlantGuaranteedDropCount = new uint256[](1);
        goldenPlantGuaranteedDropCount[0] = 1;
        // For the 5% chance to drop any other rare crop, this needs more complex logic in FarmManager, 
        // or define specific very low chances for each rare crop here.
        // For now, keeping it simple: only drops its own seeds.
        this.registerCrop(CropID.GOLDEN_PLANT_CROP, "Golden Plant", ItemID.GOLDEN_SEED_ITEM, 3 hours, 777, 1, true, 0, AchievementTier.BEGINNER, goldenPlantGuaranteedDrop, goldenPlantGuaranteedDropCount, new ItemID[](0), new uint256[](0), new uint256[](0)); // Seed not buyable, uses GOLDEN_SEED_ITEM

        ItemID[] memory crystalBerryRandomDrop = new ItemID[](1);
        crystalBerryRandomDrop[0] = ItemID.CRYSTAL_ESSENCE;
        uint256[] memory crystalBerryRandomChance = new uint256[](1);
        crystalBerryRandomChance[0] = 70; // 70%
        uint256[] memory crystalBerryRandomCount = new uint256[](1);
        crystalBerryRandomCount[0] = 1;
        // Time Crystal: 15% drop ONLY from harvesting crystal berries with fertile mesh active - this specific logic will be handled in FarmManager harvest.
        this.registerCrop(CropID.CRYSTAL_BERRIES, "Crystal Berries", ItemID.CRYSTAL_BERRIES_SEED, 24 hours, 300, 1, true, 0, AchievementTier.BEGINNER, new ItemID[](0), new uint256[](0), crystalBerryRandomDrop, crystalBerryRandomChance, crystalBerryRandomCount);

        ItemID[] memory moonflowerRandomDrop = new ItemID[](1);
        moonflowerRandomDrop[0] = ItemID.MOONLEAF;
        uint256[] memory moonflowerRandomChance = new uint256[](1);
        moonflowerRandomChance[0] = 50; // 50%
        uint256[] memory moonflowerRandomCount = new uint256[](1);
        moonflowerRandomCount[0] = 1;
        this.registerCrop(CropID.MOONFLOWERS, "Moonflowers", ItemID.MOONFLOWERS_SEED, 1.5 hours, 400, 1, true, 0, AchievementTier.BEGINNER, new ItemID[](0), new uint256[](0), moonflowerRandomDrop, moonflowerRandomChance, moonflowerRandomCount);

        ItemID[] memory ancientGrainRandomDrop = new ItemID[](1);
        ancientGrainRandomDrop[0] = ItemID.ANCIENT_APPLE;
        uint256[] memory ancientGrainRandomChance = new uint256[](1);
        ancientGrainRandomChance[0] = 30; // 30%
        uint256[] memory ancientGrainRandomCount = new uint256[](1);
        ancientGrainRandomCount[0] = 1;
        this.registerCrop(
            CropID.ANCIENT_GRAIN, 
            "Ancient Grain", 
            ItemID.ANCIENT_GRAIN_SEEDS_BUYABLE, // Ensure this uses the correct ID for buyable ancient grain seeds
            48 hours, 
            600, 
            4, 
            true, 
            0, // purchasePrice for crop itself (seeds are separate item)
            AchievementTier.INTERMEDIATE, // Tier to acquire/use the crop (matches seed)
            new ItemID[](0), 
            new uint256[](0), 
            ancientGrainRandomDrop, 
            ancientGrainRandomChance, 
            ancientGrainRandomCount
        );

        ItemID[] memory rainbowFruitRandomDrop = new ItemID[](1);
        rainbowFruitRandomDrop[0] = ItemID.RAINBOW_SHARD;
        uint256[] memory rainbowFruitRandomChance = new uint256[](1);
        rainbowFruitRandomChance[0] = 10; // 10%
        uint256[] memory rainbowFruitRandomCount = new uint256[](1);
        rainbowFruitRandomCount[0] = 1;
        this.registerCrop(CropID.RAINBOW_FRUIT, "Rainbow Fruit", ItemID.RAINBOW_FRUIT_SEED, 1 hours, 888, 1, true, 0, AchievementTier.EXPERT, new ItemID[](0), new uint256[](0), rainbowFruitRandomDrop, rainbowFruitRandomChance, rainbowFruitRandomCount);
    }
} 