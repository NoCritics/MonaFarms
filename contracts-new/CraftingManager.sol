// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GlobalEnumsAndStructs.sol";
import "./PlayerRegistryInventory.sol";
import "./ItemRegistry.sol";
import "./PlayerLeaderboard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CraftingManager is Ownable, GlobalEnumsAndStructs {
    PlayerRegistryInventory public playerRegistry;
    ItemRegistry public itemRegistry; // To verify item existence, though recipes are hardcoded for now
    PlayerLeaderboard public playerLeaderboard;

    struct RecipeComponent {
        ItemID itemId;
        uint256 amount;
    }

    struct Recipe {
        ItemID targetItemId;
        RecipeComponent[] components;
        ItemID blueprintId; // ItemID.CROPS_CURRENCY if no blueprint needed (CROPS_CURRENCY is just a placeholder for a non-item)
        uint256 costInCrops; // Additional CROPS cost for crafting, if any
    }

    mapping(ItemID => Recipe) public recipes;

    event ItemCrafted(address indexed player, ItemID indexed craftedItemId, uint256 amount);
    event RecipeAdded(ItemID indexed targetItemId);

    modifier onlyRegisteredPlayer() {
        PlayerProfile memory profile = playerRegistry.getPlayerProfile(msg.sender);
        require(bytes(profile.nickname).length != 0, "Player not registered");
        _;
    }

    constructor(
        address initialOwner,
        address _playerRegistryAddress,
        address _itemRegistryAddress,
        address _playerLeaderboardAddress
    ) {
        _transferOwnership(initialOwner);
        playerRegistry = PlayerRegistryInventory(_playerRegistryAddress);
        itemRegistry = ItemRegistry(_itemRegistryAddress);
        playerLeaderboard = PlayerLeaderboard(_playerLeaderboardAddress);
        _initializeRecipes();
    }

    function _initializeRecipes() private {
        // Rainbow Core: Crafted from 6 Rainbow Shards
        RecipeComponent[] memory rainbowCoreComps = new RecipeComponent[](1);
        rainbowCoreComps[0] = RecipeComponent(ItemID.RAINBOW_SHARD, 6);
        recipes[ItemID.RAINBOW_CORE] = Recipe(ItemID.RAINBOW_CORE, rainbowCoreComps, ItemID.CROPS_CURRENCY, 0);
        emit RecipeAdded(ItemID.RAINBOW_CORE);

        // Gold Dust: crafted with Golden seeds + essence extractor
        RecipeComponent[] memory goldDustComps = new RecipeComponent[](2);
        goldDustComps[0] = RecipeComponent(ItemID.GOLDEN_SEED_ITEM, 1); // Assuming 1 golden seed item
        goldDustComps[1] = RecipeComponent(ItemID.ESSENCE_EXTRACTOR, 1);
        recipes[ItemID.GOLD_DUST] = Recipe(ItemID.GOLD_DUST, goldDustComps, ItemID.CROPS_CURRENCY, 0);
        emit RecipeAdded(ItemID.GOLD_DUST);

        // Fertile Mesh: Crafted with Gold Dust + 2 Fertilizer + 50 CROPS
        RecipeComponent[] memory fertileMeshComps = new RecipeComponent[](2);
        fertileMeshComps[0] = RecipeComponent(ItemID.GOLD_DUST, 1);
        fertileMeshComps[1] = RecipeComponent(ItemID.FERTILIZER, 2);
        recipes[ItemID.FERTILE_MESH] = Recipe(ItemID.FERTILE_MESH, fertileMeshComps, ItemID.CROPS_CURRENCY, 50);
        emit RecipeAdded(ItemID.FERTILE_MESH);

        // Growth Lamp: Crystal Essence + 24 Water + 100 CROPS
        RecipeComponent[] memory growthLampComps = new RecipeComponent[](2);
        growthLampComps[0] = RecipeComponent(ItemID.CRYSTAL_ESSENCE, 1);
        growthLampComps[1] = RecipeComponent(ItemID.WATER_BUCKET, 24); // Assuming 24 water bucket items
        recipes[ItemID.GROWTH_LAMP] = Recipe(ItemID.GROWTH_LAMP, growthLampComps, ItemID.CROPS_CURRENCY, 100);
        emit RecipeAdded(ItemID.GROWTH_LAMP);
        
        // Raincatcher: 2 Moonleaf + rainbow core + 200 CROPS
        RecipeComponent[] memory raincatcherComps = new RecipeComponent[](2);
        raincatcherComps[0] = RecipeComponent(ItemID.MOONLEAF, 2);
        raincatcherComps[1] = RecipeComponent(ItemID.RAINBOW_CORE, 1);
        recipes[ItemID.RAINCATCHER] = Recipe(ItemID.RAINCATCHER, raincatcherComps, ItemID.CROPS_CURRENCY, 200);
        emit RecipeAdded(ItemID.RAINCATCHER);

        // Lunar Harvester: 2 Moonleaf + Gold Dust + 3 Time Crystals
        RecipeComponent[] memory lunarHarvesterComps = new RecipeComponent[](3);
        lunarHarvesterComps[0] = RecipeComponent(ItemID.MOONLEAF, 2);
        lunarHarvesterComps[1] = RecipeComponent(ItemID.GOLD_DUST, 1);
        lunarHarvesterComps[2] = RecipeComponent(ItemID.TIME_CRYSTAL, 3);
        recipes[ItemID.LUNAR_HARVESTER_ITEM] = Recipe(ItemID.LUNAR_HARVESTER_ITEM, lunarHarvesterComps, ItemID.CROPS_CURRENCY, 0);
        emit RecipeAdded(ItemID.LUNAR_HARVESTER_ITEM);

        // Monadium Sickle: Gold Dust + 2 Crystal Essence + 2 Moonleaf + Ancient Apple Seed + Rainbow Core (Blueprint needed)
        RecipeComponent[] memory sickleComps = new RecipeComponent[](5);
        sickleComps[0] = RecipeComponent(ItemID.GOLD_DUST, 1);
        sickleComps[1] = RecipeComponent(ItemID.CRYSTAL_ESSENCE, 2);
        sickleComps[2] = RecipeComponent(ItemID.MOONLEAF, 2);
        sickleComps[3] = RecipeComponent(ItemID.ANCIENT_APPLE_SEEDS, 1); // Corrected from Ancient Apple to Ancient Apple Seeds
        sickleComps[4] = RecipeComponent(ItemID.RAINBOW_CORE, 1);
        recipes[ItemID.MONADIUM_SICKLE_ITEM] = Recipe(ItemID.MONADIUM_SICKLE_ITEM, sickleComps, ItemID.BLUEPRINT_MONADIUM_SICKLE, 0);
        emit RecipeAdded(ItemID.MONADIUM_SICKLE_ITEM);

        // Monadium Hoe: Growth Lamp + Essence Extractor + 10 Wood + 10 Fabric + Rainbow Core + Time Crystal + Fertile Mesh + 10000crops (Blueprint needed)
        RecipeComponent[] memory hoeComps = new RecipeComponent[](7);
        hoeComps[0] = RecipeComponent(ItemID.GROWTH_LAMP, 1);
        hoeComps[1] = RecipeComponent(ItemID.ESSENCE_EXTRACTOR, 1);
        hoeComps[2] = RecipeComponent(ItemID.WOOD, 10);
        hoeComps[3] = RecipeComponent(ItemID.FABRIC, 10);
        hoeComps[4] = RecipeComponent(ItemID.RAINBOW_CORE, 1);
        hoeComps[5] = RecipeComponent(ItemID.TIME_CRYSTAL, 1);
        hoeComps[6] = RecipeComponent(ItemID.FERTILE_MESH, 1);
        recipes[ItemID.MONADIUM_HOE_ITEM] = Recipe(ItemID.MONADIUM_HOE_ITEM, hoeComps, ItemID.BLUEPRINT_MONADIUM_HOE, 10000);
        emit RecipeAdded(ItemID.MONADIUM_HOE_ITEM);
    }

    function craftItem(ItemID targetItemId) external onlyRegisteredPlayer {
        Recipe storage recipeToCraft = recipes[targetItemId];
        require(recipeToCraft.targetItemId != ItemID.CROPS_CURRENCY, "Recipe not found"); // CROPS_CURRENCY as uninitialized check

        // Check blueprint if required
        if (recipeToCraft.blueprintId != ItemID.CROPS_CURRENCY) {
            PlayerProfile memory profile = playerRegistry.getPlayerProfile(msg.sender);
            if (recipeToCraft.blueprintId == ItemID.BLUEPRINT_MONADIUM_SICKLE) {
                 require(profile.hasBlueprintMonadiumSickle, "Blueprint for Monadium Sickle required");
            } else if (recipeToCraft.blueprintId == ItemID.BLUEPRINT_MONADIUM_HOE) {
                 require(profile.hasBlueprintMonadiumHoe, "Blueprint for Monadium Hoe required");
            } else {
                // Generic blueprint check if other blueprints were added
                require(playerRegistry.getPlayerInventoryItemBalance(msg.sender, recipeToCraft.blueprintId) >= 1, "Required blueprint missing");
            }
        }

        // Check and consume components
        for (uint i = 0; i < recipeToCraft.components.length; i++) {
            RecipeComponent storage component = recipeToCraft.components[i];
            require(playerRegistry.getPlayerInventoryItemBalance(msg.sender, component.itemId) >= component.amount, "Insufficient crafting components");
            playerRegistry._removeItem(msg.sender, component.itemId, component.amount);
        }

        // Check and consume CROPS cost if any
        if (recipeToCraft.costInCrops > 0) {
            uint256 costInSmallestUnit = recipeToCraft.costInCrops * (10**playerRegistry.cropsToken().decimals());
            require(playerRegistry.getPlayerInventoryItemBalance(msg.sender, ItemID.CROPS_CURRENCY) >= costInSmallestUnit, "Insufficient CROPS for crafting cost");
            playerRegistry._removeItem(msg.sender, ItemID.CROPS_CURRENCY, costInSmallestUnit);
            // CROPS are transferred to treasury by PlayerRegistry._removeItem if it involves CROPS_Token directly,
            // or this contract would need to interact with EconomyContract/CROPS_Token if _removeItem only updates internal balances.
            // Assuming PlayerRegistry._removeItem for CROPS_CURRENCY handles the token transfer via EconomyContract or similar.
            // For safety, explicitly transfer to treasury if _removeItem doesn't:
            // playerRegistry.cropsToken().safeTransferFrom(msg.sender, economyContract.treasuryAddress(), costInSmallestUnit);
            // This depends on PlayerRegistry.sol._removeItem implementation for CROPS_CURRENCY.
            // Let's assume for now _removeItem for CROPS_CURRENCY in PlayerRegistry talks to EconomyContract or CROPS_Token for burn/transfer.
        }

        // Grant crafted item
        playerRegistry._addItem(msg.sender, recipeToCraft.targetItemId, 1);
        
        // Grant tool ownership if applicable (for Monadium tools, Lunar Harvester)
        if (targetItemId == ItemID.LUNAR_HARVESTER_ITEM || targetItemId == ItemID.MONADIUM_HOE_ITEM || targetItemId == ItemID.MONADIUM_SICKLE_ITEM) {
            playerRegistry._grantToolOwnership(msg.sender, targetItemId);
        }

        playerLeaderboard.addPointsForAction(msg.sender, "CRAFT_ITEM");
        emit ItemCrafted(msg.sender, recipeToCraft.targetItemId, 1);
    }
    
    function getRecipe(ItemID targetItemId) external view returns (Recipe memory) {
        require(recipes[targetItemId].targetItemId != ItemID.CROPS_CURRENCY, "Recipe not found");
        return recipes[targetItemId];
    }

    function setExternalContracts(
        address _playerRegistryAddress,
        address _itemRegistryAddress,
        address _playerLeaderboardAddress
    ) external onlyOwner {
        playerRegistry = PlayerRegistryInventory(_playerRegistryAddress);
        itemRegistry = ItemRegistry(_itemRegistryAddress);
        playerLeaderboard = PlayerLeaderboard(_playerLeaderboardAddress);
    }
} 