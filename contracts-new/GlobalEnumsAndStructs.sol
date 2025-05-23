// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GlobalEnumsAndStructs {
    // Using a contract to hold enums and structs to allow imports.
    // This contract itself won't be deployed, but its definitions will be used.

    enum ItemID {
        // Base Materials
        CROPS_CURRENCY, // 0
        WATER_BUCKET, // 1
        FERTILIZER, // 2
        GOLDEN_SEED_ITEM, // 3 
        CRYSTAL_ESSENCE, // 4
        MOONLEAF, // 5
        ANCIENT_APPLE, // 6
        RAINBOW_SHARD, // 7
        // Seed Items 
        POTATO_SEED, // 8
        TOMATO_SEED, // 9
        STRAWBERRY_SEED, // 10
        CORN_SEED, // 11
        CARROT_SEED, // 12
        PUMPKIN_SEED, // 13
        WHEAT_SEED, // 14
        WATERMELON_SEED, // 15
        CACTUS_SEED, // 16
        CRYSTAL_BERRIES_SEED, // 17
        MOONFLOWERS_SEED, // 18
        RAINBOW_FRUIT_SEED, // 19
        ANCIENT_GRAIN_SEEDS_BUYABLE, // 20 - Matches user's list (was 35)
        // Intermediates & Crafting Components
        ANCIENT_APPLE_SEEDS, // 21 - Matches user's list (was 19)
        RAINBOW_CORE, // 22
        ESSENCE_EXTRACTOR, // 23
        WOOD, // 24
        FABRIC, // 25
        GOLD_DUST, // 26
        TIME_CRYSTAL, // 27
        // Utility Craftables
        FERTILE_MESH, // 28
        GROWTH_LAMP, // 29
        RAINCATCHER, // 30
        LUNAR_HARVESTER_ITEM, // 31
        // Monadium Toolset
        MONADIUM_SICKLE_ITEM, // 32
        MONADIUM_HOE_ITEM,    // 33
        BLUEPRINT_MONADIUM_SICKLE, // 34
        BLUEPRINT_MONADIUM_HOE, // 35
        // Domain Expansion
        FARM_TILE_ITEM // 36
    }

    enum CropID {
        // Basic Crops
        POTATO,
        TOMATO,
        STRAWBERRY,
        // Standard Expansion Crops
        CORN,
        CARROT,
        PUMPKIN,
        WHEAT,
        WATERMELON,
        CACTUS,
        // Rare Crops
        GOLDEN_PLANT_CROP, // This is the crop that yields Golden Seeds
        CRYSTAL_BERRIES,
        MOONFLOWERS,
        ANCIENT_GRAIN,
        RAINBOW_FRUIT
    }

    enum AchievementTier {
        BEGINNER,       // 0-500
        INTERMEDIATE,   // 501-1500
        EXPERT,         // 1501-3000
        MASTER,         // 3001-6000
        LEGENDARY,      // 6001-10000 (formerly Quirky)
        EPOCHAL         // 10001-20000 (formerly Seasonal)
    }

    struct PlayerProfile {
        string nickname;
        // mapping(ItemID => uint256) inventory; // Removed to allow struct to be returned by external functions
        uint256 farmTilesCount;
        AchievementTier currentTier;
        // Upgrade levels - 0 means no upgrade, 1-4 represent tiers
        uint8 irrigationSystemTier;    // Max 4
        uint8 greenhouseTier;          // Max 4
        uint8 seedSaverTier;           // Max 4
        uint8 richSoilTier;            // Max 4
        bool hasGoldenEmblem;
        bool hasPlatinumEmblem;
        // Monadium tools and other special items
        bool ownsLunarHarvester;
        uint256 lunarHarvesterUsesToday;
        uint256 lunarHarvesterLastUsedTimestamp;
        bool ownsMonadiumHoe;
        uint256 monadiumHoeUsesToday;
        uint256 monadiumHoeLastUsedTimestamp;
        bool ownsMonadiumSickle;
        // Blueprints
        bool hasBlueprintMonadiumSickle;
        bool hasBlueprintMonadiumHoe;
        // Ancient Apple Yield Boost
        uint256 ancientAppleBoostActiveUntil; // Timestamp until which the +50% yield boost is active
    }

    struct FarmTile {
        CropID plantedCrop;
        uint256 plantedAt;
        uint256 lastWateredAt; // Could be used for advanced mechanics if needed
        uint8 waterCount;
        bool isFertilized; // True if fertilizer was used to mature it
        uint256 maturityTime; // Specific time it becomes mature, esp. for auto-harvesters or time-sensitive crops
        bool isLocked; // For Lunar Harvester
    }

    struct CropData {
        string name;
        CropID id;
        ItemID seedId; // The ItemID of the seed required to plant this crop
        uint256 growTimeSeconds;
        uint256 baseYield; // Number of CROPS tokens
        uint8 waterNeeded;
        bool isRare;
        uint256 purchasePrice; // Price to buy seeds from item registry, 0 if not buyable directly or if seed is separate item
        AchievementTier requiredTierToBuy; // Tier needed to purchase seeds (or the crop itself if directly buyable)
        ItemID[] guaranteedItemDrops; // Items dropped on every harvest
        uint256[] guaranteedItemDropCounts;
        ItemID[] randomItemDrops; // Items that might drop
        uint256[] randomItemDropChances; // Percentage chance (1-100)
        uint256[] randomItemDropCounts;
    }

    struct ItemData {
        string name;
        ItemID id;
        uint256 purchasePrice;
        bool isBuyable;
        AchievementTier requiredTierToBuy;
        // For items like fertilizer that have charges
        uint8 charges;
    }

    // For Lunar Harvester
    struct HarvestBasket {
        CropID cropId;
        uint256 projectedYieldCrops;
        ItemID[] projectedItemDrops;
        uint256[] projectedItemDropCounts;
        uint256 maturityTimestamp;
        bool claimed;
    }
} 