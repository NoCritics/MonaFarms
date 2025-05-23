// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GlobalEnumsAndStructs.sol";
import "./CROPS_Token.sol";
import "./TimeOracle.sol";
import "./ItemRegistry.sol";
import "./FarmEnhancementContract.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PlayerRegistryInventory is Ownable, AccessControl, GlobalEnumsAndStructs {
    CROPS_Token public cropsToken;
    TimeOracle public timeOracle; // For managing tool usage timestamps
    ItemRegistry public itemRegistry;
    FarmEnhancementContract public farmEnhancementContract;

    // Role definitions
    bytes32 public constant MODIFIER_ROLE = keccak256("MODIFIER_ROLE"); // General role for game contracts to modify inventory, grant tools etc.
    bytes32 public constant TIER_UPDATER_ROLE = keccak256("TIER_UPDATER_ROLE");
    bytes32 public constant INITIAL_CROPS_GRANTER_ROLE = keccak256("INITIAL_CROPS_GRANTER_ROLE");

    mapping(address => PlayerProfile) public playerProfiles;
    mapping(string => address) public nicknameToAddress;
    address[] public registeredPlayers;
    uint256 private nextUserId = 0; // For pseudo-randomness

    // New mapping for player inventories
    mapping(address => mapping(ItemID => uint256)) public playerInventories;

    event PlayerRegistered(address indexed player, string nickname);
    event InventoryUpdated(address indexed player, ItemID indexed itemId, uint256 newBalance);
    event PlayerTierUpdated(address indexed player, AchievementTier newTier);
    event FarmUpgradeUpdated(address indexed player, string upgradeType, uint8 newLevel);
    event EmblemAwarded(address indexed player, string emblemType);
    event AncientAppleConsumed(address indexed player, uint256 boostExpiresAt);
    event AncientAppleSeedsGifted(address indexed from, address indexed to, ItemID indexed seedId, uint256 amount);
    event ItemTransferred(address indexed from, address indexed to, ItemID indexed itemId, uint256 amount);

    modifier onlyRegisteredPlayer() {
        require(bytes(playerProfiles[msg.sender].nickname).length != 0, "Player not registered");
        _;
    }

    constructor(
        address initialOwner, 
        address _cropsTokenAddress, 
        address _timeOracleAddress, 
        address _itemRegistryAddress
    ) {
        _transferOwnership(initialOwner);
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner); // Grant admin role to deployer for managing other roles
        _grantRole(MODIFIER_ROLE, initialOwner); // Grant MODIFIER_ROLE to initialOwner for initial seed/water during registration
        require(_cropsTokenAddress != address(0), "Invalid CROPS token address");
        require(_timeOracleAddress != address(0), "Invalid TimeOracle address");
        require(_itemRegistryAddress != address(0), "Invalid ItemRegistry address");
        cropsToken = CROPS_Token(_cropsTokenAddress);
        timeOracle = TimeOracle(_timeOracleAddress);
        itemRegistry = ItemRegistry(_itemRegistryAddress);
    }

    function registerPlayer(string calldata nickname) external {
        require(bytes(playerProfiles[msg.sender].nickname).length == 0, "Player already registered");
        require(bytes(nickname).length > 0 && bytes(nickname).length <= 32, "Nickname invalid length");
        require(nicknameToAddress[nickname] == address(0), "Nickname already taken");

        playerProfiles[msg.sender].nickname = nickname;
        playerProfiles[msg.sender].farmTilesCount = 3;
        playerProfiles[msg.sender].currentTier = AchievementTier.BEGINNER;
        playerProfiles[msg.sender].irrigationSystemTier = 0;
        playerProfiles[msg.sender].greenhouseTier = 0;
        playerProfiles[msg.sender].seedSaverTier = 0;
        playerProfiles[msg.sender].richSoilTier = 0;

        nicknameToAddress[nickname] = msg.sender;
        registeredPlayers.push(msg.sender);

        // Initial Water Buckets (6 units)
        this._addItem(msg.sender, ItemID.WATER_BUCKET, 6);

        // Initial random basic crop (Potato, Tomato, Strawberry)
        uint256 randomChoice = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, nextUserId))) % 3;
        nextUserId++;
        ItemID chosenSeedItemID;
        if (randomChoice == 0) {
            chosenSeedItemID = ItemID.POTATO_SEED;
        } else if (randomChoice == 1) {
            chosenSeedItemID = ItemID.TOMATO_SEED;
        } else {
            chosenSeedItemID = ItemID.STRAWBERRY_SEED;
        }
        this._addItem(msg.sender, chosenSeedItemID, 1);

        emit PlayerRegistered(msg.sender, nickname);
        emit InventoryUpdated(msg.sender, ItemID.WATER_BUCKET, 6);
        emit InventoryUpdated(msg.sender, chosenSeedItemID, 1); // Emit event for the granted seed
    }

    // --- Inventory Management (callable by other game contracts) ---
    function _addItem(address player, ItemID itemId, uint256 amount) external onlyRole(MODIFIER_ROLE) {
        require(bytes(playerProfiles[player].nickname).length != 0, "Player not registered for item add");
        playerInventories[player][itemId] += amount;
        emit InventoryUpdated(player, itemId, playerInventories[player][itemId]);
    }

    function _removeItem(address player, ItemID itemId, uint256 amount) external onlyRole(MODIFIER_ROLE) {
        require(bytes(playerProfiles[player].nickname).length != 0, "Player not registered for item remove");
        require(playerInventories[player][itemId] >= amount, "Insufficient item balance");
        playerInventories[player][itemId] -= amount;
        emit InventoryUpdated(player, itemId, playerInventories[player][itemId]);
    }

    // --- Called by PlayerLeaderboard --- 
    function _updatePlayerTier(address player, AchievementTier newTier) external onlyRole(TIER_UPDATER_ROLE) {
        require(bytes(playerProfiles[player].nickname).length != 0, "Player not registered for tier update");
        playerProfiles[player].currentTier = newTier;
        emit PlayerTierUpdated(player, newTier);

        // Automatically activate farm upgrades for the new tier
        if (address(farmEnhancementContract) != address(0)) {
            farmEnhancementContract.activateUpgradesForTier(player, newTier);
        }

        // Award emblems based on tier
        if (newTier == AchievementTier.MASTER && !playerProfiles[player].hasGoldenEmblem) {
            playerProfiles[player].hasGoldenEmblem = true;
            emit EmblemAwarded(player, "Golden Emblem");
        }
        if (newTier == AchievementTier.EPOCHAL && !playerProfiles[player].hasPlatinumEmblem) {
            playerProfiles[player].hasPlatinumEmblem = true;
            emit EmblemAwarded(player, "Platinum Emblem (Divine Farmer)");
        }
        
        // Award blueprints at Expert tier
        if (newTier == AchievementTier.EXPERT) {
            if (!playerProfiles[player].hasBlueprintMonadiumSickle) {
                this._addItem(player, ItemID.BLUEPRINT_MONADIUM_SICKLE, 1);
                playerProfiles[player].hasBlueprintMonadiumSickle = true;
            }
            if (!playerProfiles[player].hasBlueprintMonadiumHoe) {
                this._addItem(player, ItemID.BLUEPRINT_MONADIUM_HOE, 1);
                playerProfiles[player].hasBlueprintMonadiumHoe = true;
            }
        }
    }

    // --- Called by FarmEnhancementContract --- 
    function _updateIrrigationTier(address player, uint8 level) external onlyRole(MODIFIER_ROLE) {
        playerProfiles[player].irrigationSystemTier = level;
        emit FarmUpgradeUpdated(player, "IrrigationSystem", level);
    }

    function _updateGreenhouseTier(address player, uint8 level) external onlyRole(MODIFIER_ROLE) {
        playerProfiles[player].greenhouseTier = level;
        emit FarmUpgradeUpdated(player, "Greenhouse", level);
    }

    function _updateSeedSaverTier(address player, uint8 level) external onlyRole(MODIFIER_ROLE) {
        playerProfiles[player].seedSaverTier = level;
        emit FarmUpgradeUpdated(player, "SeedSaver", level);
    }

    function _updateRichSoilTier(address player, uint8 level) external onlyRole(MODIFIER_ROLE) {
        playerProfiles[player].richSoilTier = level;
        emit FarmUpgradeUpdated(player, "RichSoil", level);
    }
    
    function _grantToolOwnership(address player, ItemID toolId) external onlyRole(MODIFIER_ROLE) {
        if (toolId == ItemID.LUNAR_HARVESTER_ITEM) playerProfiles[player].ownsLunarHarvester = true;
        else if (toolId == ItemID.MONADIUM_HOE_ITEM) playerProfiles[player].ownsMonadiumHoe = true;
        else if (toolId == ItemID.MONADIUM_SICKLE_ITEM) playerProfiles[player].ownsMonadiumSickle = true;
    }

    // --- Getters ---
    function getPlayerProfile(address player) external view returns (PlayerProfile memory) {
        require(bytes(playerProfiles[player].nickname).length != 0, "Player not registered");
        return playerProfiles[player];
    }

    function getPlayerInventoryItemBalance(address player, ItemID itemId) external view returns (uint256) {
        require(bytes(playerProfiles[player].nickname).length != 0, "Player not registered");
        return playerInventories[player][itemId];
    }

    function getPlayerFarmTilesCount(address player) external view returns (uint256) {
        require(bytes(playerProfiles[player].nickname).length != 0, "Player not registered");
        return playerProfiles[player].farmTilesCount;
    }

    function _incrementFarmTiles(address player) external onlyRole(MODIFIER_ROLE) {
        playerProfiles[player].farmTilesCount++;
    }
    
    // --- Tool Usage Tracking (called by FarmEnhancementContract) ---
    function _recordToolUsage(address player, ItemID tool) external onlyRole(MODIFIER_ROLE) {
        uint256 currentTime = timeOracle.getCurrentTimestamp();
        if (tool == ItemID.LUNAR_HARVESTER_ITEM) {
            if (currentTime - playerProfiles[player].lunarHarvesterLastUsedTimestamp >= timeOracle.cooldownDurations(TimeOracle.CooldownType.LUNAR_HARVESTER_DAILY_RESET)) {
                playerProfiles[player].lunarHarvesterUsesToday = 0;
            }
            playerProfiles[player].lunarHarvesterUsesToday++;
            playerProfiles[player].lunarHarvesterLastUsedTimestamp = currentTime;
        }
        // Similar logic for Monadium Hoe
        else if (tool == ItemID.MONADIUM_HOE_ITEM) {
             if (currentTime - playerProfiles[player].monadiumHoeLastUsedTimestamp >= timeOracle.cooldownDurations(TimeOracle.CooldownType.MONADIUM_HOE_DAILY_RESET)) {
                playerProfiles[player].monadiumHoeUsesToday = 0;
            }
            playerProfiles[player].monadiumHoeUsesToday++;
            playerProfiles[player].monadiumHoeLastUsedTimestamp = currentTime;
        }
    }

    function getToolUsesToday(address player, ItemID tool) external view returns (uint256) {
        if (tool == ItemID.LUNAR_HARVESTER_ITEM) return playerProfiles[player].lunarHarvesterUsesToday;
        if (tool == ItemID.MONADIUM_HOE_ITEM) return playerProfiles[player].monadiumHoeUsesToday;
        return 0;
    }

    function getPlayerFullInventory(address player) external view returns (ItemID[] memory, uint256[] memory) {
        require(bytes(playerProfiles[player].nickname).length != 0, "Player not registered");

        ItemID[] memory allItemIdsFromRegistry = itemRegistry.getAllItemIDs();
        uint256 ownedItemCount = 0;

        // First pass: count how many distinct items the player owns
        for (uint i = 0; i < allItemIdsFromRegistry.length; i++) {
            if (playerInventories[player][allItemIdsFromRegistry[i]] > 0) {
                ownedItemCount++;
            }
        }

        ItemID[] memory ownedItemIds = new ItemID[](ownedItemCount);
        uint256[] memory ownedBalances = new uint256[](ownedItemCount);
        uint256 currentIndex = 0;

        // Second pass: populate the arrays
        for (uint i = 0; i < allItemIdsFromRegistry.length; i++) {
            ItemID currentItemId = allItemIdsFromRegistry[i];
            uint256 balance = playerInventories[player][currentItemId];
            if (balance > 0) {
                ownedItemIds[currentIndex] = currentItemId;
                ownedBalances[currentIndex] = balance;
                currentIndex++;
            }
        }
        return (ownedItemIds, ownedBalances);
    }

    // Function for EconomyContract to call to give initial CROPS after registration
    function grantInitialCrops(address player, uint256 amount) external onlyRole(INITIAL_CROPS_GRANTER_ROLE) {
        require(bytes(playerProfiles[player].nickname).length != 0, "Player not registered for initial CROPS");
        require(playerInventories[player][ItemID.CROPS_CURRENCY] == 0, "Initial CROPS already granted");
        
        this._addItem(player, ItemID.CROPS_CURRENCY, amount);
    }

     function setExternalContracts(
         address _cropsTokenAddress, 
         address _timeOracleAddress, 
         address _itemRegistryAddress,
         address _farmEnhancementContractAddress
    ) external onlyOwner {
        require(_cropsTokenAddress != address(0), "Invalid CROPS token address");
        require(_timeOracleAddress != address(0), "Invalid TimeOracle address");
        require(_itemRegistryAddress != address(0), "Invalid ItemRegistry address");
        require(_farmEnhancementContractAddress != address(0), "Invalid FarmEnhancementContract address");
        cropsToken = CROPS_Token(_cropsTokenAddress);
        timeOracle = TimeOracle(_timeOracleAddress);
        itemRegistry = ItemRegistry(_itemRegistryAddress);
        farmEnhancementContract = FarmEnhancementContract(_farmEnhancementContractAddress);
    }

    // Function to allow admin to grant MODIFIER_ROLE to this contract itself if needed for internal _addItem calls
    function grantModifierRoleToSelf(address selfAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(selfAddress == address(this), "Must be this contract's address");
        _grantRole(MODIFIER_ROLE, selfAddress);
    }

    // Override supportsInterface to advertise EIP-165 AccessControl interface support
    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControl) returns (bool) {
        return interfaceId == type(IAccessControl).interfaceId || super.supportsInterface(interfaceId);
    }

    function getAncientAppleBoostActiveUntil(address player) external view returns (uint256) {
        require(bytes(playerProfiles[player].nickname).length != 0, "Player not registered");
        return playerProfiles[player].ancientAppleBoostActiveUntil;
    }

    function consumeAncientApple(address giftRecipient) external {
        require(bytes(playerProfiles[msg.sender].nickname).length != 0, "Player not registered");
        require(playerInventories[msg.sender][ItemID.ANCIENT_APPLE] >= 1, "No Ancient Apple to consume");
        require(giftRecipient != msg.sender, "Cannot gift seeds to yourself");
        require(bytes(playerProfiles[giftRecipient].nickname).length != 0, "Recipient not a registered player");

        this._removeItem(msg.sender, ItemID.ANCIENT_APPLE, 1);

        uint256 boostDuration = timeOracle.getCooldownDuration(TimeOracle.CooldownType.ANCIENT_APPLE_BOOST_DURATION);
        playerProfiles[msg.sender].ancientAppleBoostActiveUntil = block.timestamp + boostDuration;
        emit AncientAppleConsumed(msg.sender, playerProfiles[msg.sender].ancientAppleBoostActiveUntil);

        this._addItem(giftRecipient, ItemID.ANCIENT_APPLE_SEEDS, 1);
        emit AncientAppleSeedsGifted(msg.sender, giftRecipient, ItemID.ANCIENT_APPLE_SEEDS, 1);
    }

    function sendAncientApple(address recipient, uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        require(bytes(playerProfiles[msg.sender].nickname).length != 0, "Sender not registered");
        require(bytes(playerProfiles[recipient].nickname).length != 0, "Recipient not registered");
        require(recipient != msg.sender, "Cannot send to yourself");
        require(playerInventories[msg.sender][ItemID.ANCIENT_APPLE] >= amount, "Insufficient Ancient Apples to send");

        this._removeItem(msg.sender, ItemID.ANCIENT_APPLE, amount);
        this._addItem(recipient, ItemID.ANCIENT_APPLE, amount);

        emit ItemTransferred(msg.sender, recipient, ItemID.ANCIENT_APPLE, amount);
    }
} 