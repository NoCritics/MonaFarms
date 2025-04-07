// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface IPlayerRegistry {
    function isPlayerRegistered(address playerAddress) external view returns (bool);
    function getPlayer(address playerAddress) external view returns (
        string memory nickname,
        uint256 registrationTime,
        bool exists,
        uint8 waterBuckets,
        uint8 initialSeedType,
        uint8 initialSeedCount,
        uint8 ownedTiles
    );
    function updateWaterBuckets(address playerAddress, uint8 newWaterBucketCount) external;
}

interface ICropsToken {
    function mint(address to, uint256 amount) external;
    function burnFrom(address from, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
}

interface ILeaderboard {
    function addPoints(address player, uint8 actionType, uint256 points) external;
}

contract FarmManager is Ownable, Pausable {
    uint8 public constant POTATO = 0;
    uint8 public constant TOMATO = 1;
    uint8 public constant STRAWBERRY = 2;
    
    struct CropConfig {
        uint256 cost;
        uint256 growthTime;
        uint256 yield;
        bool enabled;
    }
    
    struct CropState {
        uint8 cropType;
        uint256 plantedTime;
        bool isWatered;
        bool exists;
    }
    
    struct Tile {
        address owner;
        CropState crop;
        bool exists;
    }
    
    struct PlayerInventory {
        mapping(uint8 => uint8) seeds;
        uint8 waterBuckets;
        uint8 fertilizerCharges;
        uint256 lastFertilizerPurchase;
    }
    
    address public playerRegistryAddress;
    address public cropsTokenAddress;
    address public leaderboardAddress;
    
    mapping(address => bool) private authorizedContracts;
    
    mapping(address => mapping(uint8 => uint256)) private playerTiles;
    mapping(address => uint8) private playerTileCount;
    mapping(uint256 => Tile) private tiles;
    mapping(address => PlayerInventory) private playerInventories;
    
    mapping(uint8 => CropConfig) private cropConfigs;
    
    uint256 private nextTileId;
    
    event CropPlanted(address indexed player, uint256 tileId, uint8 cropType, uint256 timestamp);
    event CropWatered(address indexed player, uint256 tileId, uint256 timestamp);
    event CropHarvested(address indexed player, uint256 tileId, uint8 cropType, uint256 yield, uint256 timestamp);
    event TileAdded(address indexed player, uint256 tileId, uint8 tileIndex);
    event ItemAdded(address indexed player, uint8 itemType, uint8 quantity);
    event FertilizerUsed(address indexed player, uint256 tileId);
    
    constructor(
        address _playerRegistry,
        address _cropsToken,
        address _leaderboard
    ) {
        playerRegistryAddress = _playerRegistry;
        cropsTokenAddress = _cropsToken;
        leaderboardAddress = _leaderboard;
        
        cropConfigs[POTATO] = CropConfig({
            cost: 10 * 10**18,
            growthTime: 3 hours,
            yield: 40 * 10**18,
            enabled: true
        });
        
        cropConfigs[TOMATO] = CropConfig({
            cost: 30 * 10**18,
            growthTime: 2 hours,
            yield: 50 * 10**18,
            enabled: true
        });
        
        cropConfigs[STRAWBERRY] = CropConfig({
            cost: 50 * 10**18,
            growthTime: 1 hours,
            yield: 75 * 10**18,
            enabled: true
        });
        
        nextTileId = 1;
    }
    
    modifier onlyRegisteredPlayer() {
        require(
            IPlayerRegistry(playerRegistryAddress).isPlayerRegistered(msg.sender),
            "Player not registered"
        );
        _;
    }
    
    modifier validCropType(uint8 cropType) {
        require(cropConfigs[cropType].enabled, "Invalid or disabled crop type");
        _;
    }
    
    modifier validTileId(uint256 tileId) {
        require(tiles[tileId].exists, "Tile does not exist");
        _;
    }
    
    modifier onlyTileOwner(uint256 tileId) {
        require(tiles[tileId].owner == msg.sender, "Not the tile owner");
        _;
    }
    
    function initializePlayer(address playerAddress) external {
        require(msg.sender == playerRegistryAddress, "Only player registry can initialize");
        
        (
            ,
            ,
            bool exists,
            uint8 waterBuckets,
            uint8 initialSeedType,
            uint8 initialSeedCount,
            uint8 ownedTiles
        ) = IPlayerRegistry(playerRegistryAddress).getPlayer(playerAddress);
        
        require(exists, "Player does not exist");
        
        playerInventories[playerAddress].waterBuckets = waterBuckets;
        playerInventories[playerAddress].seeds[initialSeedType] = initialSeedCount;
        
        for (uint8 i = 0; i < ownedTiles; i++) {
            _addTile(playerAddress);
        }
    }
    
    modifier onlyAuthorized() {
        require(authorizedContracts[msg.sender] || msg.sender == owner() || msg.sender == address(this), "Not authorized");
        _;
    }
    
    function authorizeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = true;
    }
    
    function deauthorizeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = false;
    }
    
    function addSeedsToPlayer(address playerAddress, uint8 cropType, uint8 amount) external onlyAuthorized {
        require(cropConfigs[cropType].enabled, "Invalid crop type");
        
        playerInventories[playerAddress].seeds[cropType] += amount;
        
        emit ItemAdded(playerAddress, cropType, amount);
    }
    
    function plantCrop(uint8 tileIndex, uint8 cropType) 
        external
        whenNotPaused
        onlyRegisteredPlayer
        validCropType(cropType) 
    {
        uint256 tileId = playerTiles[msg.sender][tileIndex];
        require(tileId != 0, "Tile not owned by player");
        require(!tiles[tileId].crop.exists, "Tile already has a crop");
        require(playerInventories[msg.sender].seeds[cropType] > 0, "Not enough seeds");
        
        playerInventories[msg.sender].seeds[cropType]--;
        
        tiles[tileId].crop = CropState({
            cropType: cropType,
            plantedTime: block.timestamp,
            isWatered: false,
            exists: true
        });
        
        ILeaderboard(leaderboardAddress).addPoints(msg.sender, 1, 10);
        
        emit CropPlanted(msg.sender, tileId, cropType, block.timestamp);
    }
    
    function waterCrop(uint8 tileIndex) 
        external
        whenNotPaused
        onlyRegisteredPlayer 
    {
        uint256 tileId = playerTiles[msg.sender][tileIndex];
        require(tileId != 0, "Tile not owned by player");
        require(tiles[tileId].crop.exists, "No crop on this tile");
        require(!tiles[tileId].crop.isWatered, "Crop already watered");
        require(playerInventories[msg.sender].waterBuckets > 0, "No water buckets");
        
        uint8 currentBuckets = playerInventories[msg.sender].waterBuckets;
        playerInventories[msg.sender].waterBuckets = currentBuckets - 1;
        
        tiles[tileId].crop.isWatered = true;
        
        ILeaderboard(leaderboardAddress).addPoints(msg.sender, 2, 5);
        
        emit CropWatered(msg.sender, tileId, block.timestamp);
    }
    
    function harvestCrop(uint8 tileIndex) 
        external
        whenNotPaused
        onlyRegisteredPlayer 
    {
        uint256 tileId = playerTiles[msg.sender][tileIndex];
        require(tileId != 0, "Tile not owned by player");
        require(tiles[tileId].crop.exists, "No crop on this tile");
        
        CropState storage crop = tiles[tileId].crop;
        CropConfig storage config = cropConfigs[crop.cropType];
        
        require(crop.isWatered, "Crop not watered");
        require(
            block.timestamp >= crop.plantedTime + config.growthTime,
            "Crop not ready for harvest"
        );
        
        uint256 yield = config.yield;
        
        delete tiles[tileId].crop;
        
        ICropsToken(cropsTokenAddress).mint(msg.sender, yield);
        
        ILeaderboard(leaderboardAddress).addPoints(msg.sender, 3, 15);
        
        emit CropHarvested(msg.sender, tileId, crop.cropType, yield, block.timestamp);
    }
    
    function adminInitializePlayer(address playerAddress) external onlyOwner {
        uint8 currentTileCount = playerTileCount[playerAddress];
        
        (,,bool exists, uint8 waterBuckets, uint8 initialSeedType, uint8 initialSeedCount, uint8 ownedTiles) = 
            IPlayerRegistry(playerRegistryAddress).getPlayer(playerAddress);
        
        require(exists, "Player does not exist in registry");
        
        playerInventories[playerAddress].waterBuckets = waterBuckets;
        playerInventories[playerAddress].seeds[initialSeedType] = initialSeedCount;
        
        for (uint8 i = currentTileCount; i < ownedTiles; i++) {
            _addTile(playerAddress);
        }
    }
    
    function useFertilizer(uint8 tileIndex) 
        external
        whenNotPaused
        onlyRegisteredPlayer 
    {
        uint256 tileId = playerTiles[msg.sender][tileIndex];
        require(tileId != 0, "Tile not owned by player");
        require(tiles[tileId].crop.exists, "No crop on this tile");
        require(playerInventories[msg.sender].fertilizerCharges > 0, "No fertilizer charges");
        
        CropState storage crop = tiles[tileId].crop;
        CropConfig storage config = cropConfigs[crop.cropType];
        require(
            !crop.isWatered || block.timestamp < crop.plantedTime + config.growthTime,
            "Crop already ready for harvest"
        );
        
        playerInventories[msg.sender].fertilizerCharges--;
        
        tiles[tileId].crop.isWatered = true;
        tiles[tileId].crop.plantedTime = block.timestamp - config.growthTime;
        
        ILeaderboard(leaderboardAddress).addPoints(msg.sender, 4, 8);
        
        emit FertilizerUsed(msg.sender, tileId);
    }
    
    function _addTile(address playerAddress) internal returns (uint256) {
        uint8 tileIndex = playerTileCount[playerAddress];
        uint256 tileId = nextTileId++;
        
        tiles[tileId] = Tile({
            owner: playerAddress,
            crop: CropState({
                cropType: 0,
                plantedTime: 0,
                isWatered: false,
                exists: false
            }),
            exists: true
        });
        
        playerTiles[playerAddress][tileIndex] = tileId;
        playerTileCount[playerAddress]++;
        
        emit TileAdded(playerAddress, tileId, tileIndex);
        
        return tileId;
    }
    
    function addTile(address playerAddress) external onlyAuthorized returns (bool) {
        
        _addTile(playerAddress);
        return true;
    }
    
    function updateWaterBuckets(address playerAddress, uint8 bucketCount) external onlyAuthorized {
        
        playerInventories[playerAddress].waterBuckets = bucketCount;
        
        emit ItemAdded(playerAddress, 100, bucketCount);
    }
    
    function updateFertilizerCharges(address playerAddress, uint8 charges, uint256 purchaseTime) external onlyAuthorized {
        
        playerInventories[playerAddress].fertilizerCharges = charges;
        if (purchaseTime > 0) {
            playerInventories[playerAddress].lastFertilizerPurchase = purchaseTime;
        }
        
        emit ItemAdded(playerAddress, 101, charges);
    }
    
    function getTileInfo(address playerAddress, uint8 tileIndex) 
        external 
        view
        returns (
            bool exists,
            uint8 cropType,
            uint256 plantedTime,
            bool isWatered,
            bool cropExists,
            bool isReady
        ) 
    {
        uint256 tileId = playerTiles[playerAddress][tileIndex];
        
        if (tileId == 0) {
            return (false, 0, 0, false, false, false);
        }
        
        Tile storage tile = tiles[tileId];
        CropState storage crop = tile.crop;
        
        bool ready = false;
        if (crop.exists && crop.isWatered) {
            ready = block.timestamp >= crop.plantedTime + cropConfigs[crop.cropType].growthTime;
        }
        
        return (
            true,
            crop.cropType,
            crop.plantedTime,
            crop.isWatered,
            crop.exists,
            ready
        );
    }
    
    function getPlayerTileCount(address playerAddress) external view returns (uint8) {
        return playerTileCount[playerAddress];
    }
    
    function getPlayerInventory(address playerAddress) 
        external 
        view 
        returns (
            uint8 potatoSeeds,
            uint8 tomatoSeeds,
            uint8 strawberrySeeds,
            uint8 waterBuckets,
            uint8 fertilizerCharges,
            uint256 lastFertilizerPurchase
        ) 
    {
        PlayerInventory storage inventory = playerInventories[playerAddress];
        
        return (
            inventory.seeds[POTATO],
            inventory.seeds[TOMATO],
            inventory.seeds[STRAWBERRY],
            inventory.waterBuckets,
            inventory.fertilizerCharges,
            inventory.lastFertilizerPurchase
        );
    }
    
    function getCropConfig(uint8 cropType) 
        external 
        view 
        returns (
            uint256 cost,
            uint256 growthTime,
            uint256 yield,
            bool enabled
        ) 
    {
        CropConfig storage config = cropConfigs[cropType];
        return (
            config.cost,
            config.growthTime,
            config.yield,
            config.enabled
        );
    }
    
    function updateCropConfig(
        uint8 cropType,
        uint256 cost,
        uint256 growthTime,
        uint256 yield,
        bool enabled
    ) 
        external 
        onlyOwner 
    {
        cropConfigs[cropType] = CropConfig({
            cost: cost,
            growthTime: growthTime,
            yield: yield,
            enabled: enabled
        });
    }
    
    function updatePlayerRegistry(address _playerRegistry) external onlyOwner {
        playerRegistryAddress = _playerRegistry;
    }
    
    function updateCropsToken(address _cropsToken) external onlyOwner {
        cropsTokenAddress = _cropsToken;
    }
    
    function updateLeaderboard(address _leaderboard) external onlyOwner {
        leaderboardAddress = _leaderboard;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
