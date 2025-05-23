// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GlobalEnumsAndStructs.sol";
import "./PlayerRegistryInventory.sol";
import "./ItemRegistry.sol";
import "./EconomyContract.sol";
import "./PlayerLeaderboard.sol";
import "./FarmEnhancementContract.sol";
import "./TimeOracle.sol"; // For fertilizer purchase cooldown
import "./CROPS_Token.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; // For safe CROPS transfers

contract ShopManager is Ownable, GlobalEnumsAndStructs {
    using SafeERC20 for CROPS_Token;

    PlayerRegistryInventory public playerRegistry;
    ItemRegistry public itemRegistry;
    EconomyContract public economyContract;
    PlayerLeaderboard public playerLeaderboard;
    FarmEnhancementContract public farmEnhancementContract;
    TimeOracle public timeOracle;
    CROPS_Token public cropsToken;

    uint256 public constant MAX_FARM_TILES = 24;

    event ItemPurchased(address indexed player, ItemID indexed itemId, uint256 quantity, uint256 cost);
    event FarmTilePurchased(address indexed player, uint256 newTileCount, uint256 cost);

    modifier onlyRegisteredPlayer() {
        PlayerProfile memory profile = playerRegistry.getPlayerProfile(msg.sender);
        require(bytes(profile.nickname).length != 0, "Player not registered");
        _;
    }

    constructor(
        address initialOwner,
        address _playerRegistryAddress,
        address _itemRegistryAddress,
        address _economyContractAddress,
        address _playerLeaderboardAddress,
        address _farmEnhancementContractAddress,
        address _timeOracleAddress,
        address _cropsTokenAddress
    ) {
        _transferOwnership(initialOwner);
        playerRegistry = PlayerRegistryInventory(_playerRegistryAddress);
        itemRegistry = ItemRegistry(_itemRegistryAddress);
        economyContract = EconomyContract(_economyContractAddress);
        playerLeaderboard = PlayerLeaderboard(_playerLeaderboardAddress);
        farmEnhancementContract = FarmEnhancementContract(_farmEnhancementContractAddress);
        timeOracle = TimeOracle(_timeOracleAddress);
        cropsToken = CROPS_Token(_cropsTokenAddress);
    }

    function purchaseItem(ItemID itemId, uint256 quantity)
        external
        onlyRegisteredPlayer
    {
        require(quantity > 0, "Quantity must be positive");
        ItemData memory itemData = itemRegistry.getItemData(itemId);
        require(itemData.isBuyable, "Item not buyable");

        PlayerProfile memory profile = playerRegistry.getPlayerProfile(msg.sender);
        require(profile.currentTier >= itemData.requiredTierToBuy, "Achievement tier not met");

        uint256 singleItemPrice = itemData.purchasePrice;
        uint256 totalCost;
        uint256 itemsToGrant = quantity;

        if (itemId == ItemID.WATER_BUCKET) {
            // Water Bucket: 6 units per 50 CROPS. Irrigation bonus applies.
            // quantity represents number of packs.
            require(singleItemPrice == 50, "Water bucket base price mismatch"); 
            totalCost = quantity * singleItemPrice; // Assuming price in ItemRegistry is already in base units of CROPS
            uint8 irrigationBonus = farmEnhancementContract.getIrrigationBonus(msg.sender);
            itemsToGrant = quantity * (6 + irrigationBonus); 
        } else if (itemId == ItemID.FERTILIZER) {
            // Price in ItemRegistry (100) is for a pack of 4. 
            // quantity represents number of packs.
            // Cooldown applies to the act of purchasing fertilizer, not the number of packs in one go.
            require(!timeOracle.isCooldownActive(msg.sender, TimeOracle.CooldownType.FERTILIZER_PURCHASE), "Fertilizer purchase cooldown active");
            
            totalCost = quantity * singleItemPrice; // Price in ItemRegistry is for one pack.
            itemsToGrant = quantity * 4; // Grant 4 fertilizer items per pack purchased.
            
            timeOracle.startCooldown(msg.sender, TimeOracle.CooldownType.FERTILIZER_PURCHASE); // Start cooldown after successful purchase parameters are set.
        } else {
            // Standard items: quantity is number of individual items.
            totalCost = quantity * singleItemPrice;
            // itemsToGrant is already quantity
        }

        // Assuming CROPS_CURRENCY is an ItemID and PlayerRegistryInventory handles its balance like other items.
        // And assuming CROPS token has 18 decimals typically.
        uint256 totalCostInSmallestUnit = totalCost * (10**cropsToken.decimals());

        require(playerRegistry.getPlayerInventoryItemBalance(msg.sender, ItemID.CROPS_CURRENCY) >= totalCostInSmallestUnit, "Insufficient CROPS balance in registry");

        // Transfer CROPS from player to treasury
        playerRegistry._removeItem(msg.sender, ItemID.CROPS_CURRENCY, totalCostInSmallestUnit); 
        cropsToken.safeTransferFrom(msg.sender, economyContract.treasuryAddress(), totalCostInSmallestUnit); 

        playerRegistry._addItem(msg.sender, itemId, itemsToGrant);

        playerLeaderboard.addPointsForAction(msg.sender, "PURCHASE_ITEM");
        emit ItemPurchased(msg.sender, itemId, itemsToGrant, totalCost); // Emitting itemsToGrant and totalCost (in CROPS base units)
    }

    function purchaseFarmTile() external onlyRegisteredPlayer {
        uint256 currentTiles = playerRegistry.getPlayerFarmTilesCount(msg.sender);
        require(currentTiles < MAX_FARM_TILES, "Max farm tiles reached");

        ItemData memory tileItem = itemRegistry.getItemData(ItemID.FARM_TILE_ITEM);
        uint256 cost = tileItem.purchasePrice * (10**cropsToken.decimals());

        require(playerRegistry.getPlayerInventoryItemBalance(msg.sender, ItemID.CROPS_CURRENCY) >= cost, "Insufficient CROPS for new tile");

        playerRegistry._removeItem(msg.sender, ItemID.CROPS_CURRENCY, cost);
        cropsToken.safeTransferFrom(msg.sender, economyContract.treasuryAddress(), cost);

        playerRegistry._incrementFarmTiles(msg.sender);

        playerLeaderboard.addPointsForAction(msg.sender, "PURCHASE_TILE");
        emit FarmTilePurchased(msg.sender, currentTiles + 1, cost / (10**cropsToken.decimals()));
    }

    function setExternalContracts(
        address _playerRegistryAddress,
        address _itemRegistryAddress,
        address _economyContractAddress,
        address _playerLeaderboardAddress,
        address _farmEnhancementContractAddress,
        address _timeOracleAddress,
        address _cropsTokenAddress
    ) external onlyOwner {
        playerRegistry = PlayerRegistryInventory(_playerRegistryAddress);
        itemRegistry = ItemRegistry(_itemRegistryAddress);
        economyContract = EconomyContract(_economyContractAddress);
        playerLeaderboard = PlayerLeaderboard(_playerLeaderboardAddress);
        farmEnhancementContract = FarmEnhancementContract(_farmEnhancementContractAddress);
        timeOracle = TimeOracle(_timeOracleAddress);
        cropsToken = CROPS_Token(_cropsTokenAddress);
    }
} 