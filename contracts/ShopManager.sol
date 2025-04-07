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
    function updateOwnedTiles(address playerAddress, uint8 newTileCount) external;
}

interface ICropsToken {
    function burnFrom(address from, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
}

interface IFarmManager {
    function addSeedsToPlayer(address playerAddress, uint8 cropType, uint8 amount) external;
    function updateWaterBuckets(address playerAddress, uint8 bucketCount) external;
    function updateFertilizerCharges(address playerAddress, uint8 charges, uint256 purchaseTime) external;
    function addTile(address playerAddress) external returns (bool);
    function getPlayerInventory(address playerAddress) external view returns (
        uint8 potatoSeeds,
        uint8 tomatoSeeds,
        uint8 strawberrySeeds,
        uint8 waterBuckets,
        uint8 fertilizerCharges,
        uint256 lastFertilizerPurchase
    );
}

interface ILeaderboard {
    function addPoints(address player, uint8 actionType, uint256 points) external;
}

contract ShopManager is Ownable, Pausable {
    uint8 public constant POTATO = 0;
    uint8 public constant TOMATO = 1;
    uint8 public constant STRAWBERRY = 2;
    
    uint256 public constant WATER_BUCKET_PRICE = 50 * 10**18;
    uint256 public constant FERTILIZER_PRICE = 100 * 10**18;
    uint256 public constant FERTILIZER_COOLDOWN = 24 hours;
    uint8 public constant MAX_TILES = 24;
    
    address public playerRegistryAddress;
    address public cropsTokenAddress;
    address public farmManagerAddress;
    address public leaderboardAddress;
    
    mapping(uint8 => uint256) private seedPrices;
    
    event SeedsPurchased(address indexed player, uint8 cropType, uint8 amount, uint256 price);
    event WaterBucketPurchased(address indexed player, uint256 price);
    event FertilizerPurchased(address indexed player, uint256 price);
    event TilePurchased(address indexed player, uint8 tileNumber, uint256 price);
    
    constructor(
        address _playerRegistry,
        address _cropsToken,
        address _farmManager,
        address _leaderboard
    ) {
        playerRegistryAddress = _playerRegistry;
        cropsTokenAddress = _cropsToken;
        farmManagerAddress = _farmManager;
        leaderboardAddress = _leaderboard;
        
        seedPrices[POTATO] = 10 * 10**18;
        seedPrices[TOMATO] = 30 * 10**18;
        seedPrices[STRAWBERRY] = 50 * 10**18;
    }
    
    modifier onlyRegisteredPlayer() {
        require(
            IPlayerRegistry(playerRegistryAddress).isPlayerRegistered(msg.sender),
            "Player not registered"
        );
        _;
    }
    
    modifier validCropType(uint8 cropType) {
        require(cropType <= STRAWBERRY, "Invalid crop type");
        _;
    }
    
    function buySeeds(uint8 cropType, uint8 amount) 
        external
        whenNotPaused
        onlyRegisteredPlayer
        validCropType(cropType) 
    {
        require(amount > 0, "Amount must be greater than zero");
        
        uint256 totalPrice = seedPrices[cropType] * amount;
        
        require(
            ICropsToken(cropsTokenAddress).balanceOf(msg.sender) >= totalPrice,
            "Insufficient tokens"
        );
        
        ICropsToken(cropsTokenAddress).burnFrom(msg.sender, totalPrice);
        IFarmManager(farmManagerAddress).addSeedsToPlayer(msg.sender, cropType, amount);
        ILeaderboard(leaderboardAddress).addPoints(msg.sender, 5, 5);
        
        emit SeedsPurchased(msg.sender, cropType, amount, totalPrice);
    }
    
    function buyWaterBucket() 
        external 
        whenNotPaused
        onlyRegisteredPlayer 
    {
        require(
            ICropsToken(cropsTokenAddress).balanceOf(msg.sender) >= WATER_BUCKET_PRICE,
            "Insufficient tokens"
        );
        
        (
            ,
            ,
            ,
            uint8 waterBuckets,
            ,
        ) = IFarmManager(farmManagerAddress).getPlayerInventory(msg.sender);
        
        ICropsToken(cropsTokenAddress).burnFrom(msg.sender, WATER_BUCKET_PRICE);
        IFarmManager(farmManagerAddress).updateWaterBuckets(msg.sender, waterBuckets + 6);
        ILeaderboard(leaderboardAddress).addPoints(msg.sender, 6, 5);
        
        emit WaterBucketPurchased(msg.sender, WATER_BUCKET_PRICE);
    }
    
    function buyFertilizer() 
        external 
        whenNotPaused
        onlyRegisteredPlayer 
    {
        require(
            ICropsToken(cropsTokenAddress).balanceOf(msg.sender) >= FERTILIZER_PRICE,
            "Insufficient tokens"
        );
        
        (
            ,
            ,
            ,
            ,
            uint8 fertilizerCharges,
            uint256 lastFertilizerPurchase
        ) = IFarmManager(farmManagerAddress).getPlayerInventory(msg.sender);
        
        require(
            lastFertilizerPurchase == 0 || block.timestamp >= lastFertilizerPurchase + FERTILIZER_COOLDOWN,
            "Fertilizer already purchased today"
        );
        
        ICropsToken(cropsTokenAddress).burnFrom(msg.sender, FERTILIZER_PRICE);
        
        IFarmManager(farmManagerAddress).updateFertilizerCharges(
            msg.sender, 
            fertilizerCharges + 4,
            block.timestamp
        );
        
        ILeaderboard(leaderboardAddress).addPoints(msg.sender, 7, 10);
        
        emit FertilizerPurchased(msg.sender, FERTILIZER_PRICE);
    }
    
    function buyTile() 
        external 
        whenNotPaused
        onlyRegisteredPlayer 
    {
        (
            ,
            ,
            ,
            ,
            ,
            ,
            uint8 ownedTiles
        ) = IPlayerRegistry(playerRegistryAddress).getPlayer(msg.sender);
        
        require(ownedTiles < MAX_TILES, "Maximum tile count reached");
        
        uint256 tilePrice = 250 * 10**18;
        
        require(
            ICropsToken(cropsTokenAddress).balanceOf(msg.sender) >= tilePrice,
            "Insufficient tokens"
        );
        
        ICropsToken(cropsTokenAddress).burnFrom(msg.sender, tilePrice);
        
        bool tileAdded = IFarmManager(farmManagerAddress).addTile(msg.sender);
        require(tileAdded, "Failed to add tile");
        
        IPlayerRegistry(playerRegistryAddress).updateOwnedTiles(msg.sender, ownedTiles + 1);
        ILeaderboard(leaderboardAddress).addPoints(msg.sender, 8, 20);
        
        emit TilePurchased(msg.sender, ownedTiles, tilePrice);
    }
    
    function getSeedPrice(uint8 cropType) external view validCropType(cropType) returns (uint256) {
        return seedPrices[cropType];
    }
    
    function getTilePrice(uint8 currentTileCount) external pure returns (uint256) {
        require(currentTileCount < MAX_TILES, "Maximum tile count reached");
        return 250 * 10**18;
    }
    
    function getWaterBucketPrice() external pure returns (uint256) {
        return WATER_BUCKET_PRICE;
    }
    
    function getFertilizerPrice() external pure returns (uint256) {
        return FERTILIZER_PRICE;
    }
    
    function timeUntilNextFertilizer(address player) external view returns (uint256) {
        (
            ,
            ,
            ,
            ,
            ,
            uint256 lastFertilizerPurchase
        ) = IFarmManager(farmManagerAddress).getPlayerInventory(player);
        
        if (lastFertilizerPurchase == 0 || block.timestamp >= lastFertilizerPurchase + FERTILIZER_COOLDOWN) {
            return 0;
        }
        
        return (lastFertilizerPurchase + FERTILIZER_COOLDOWN) - block.timestamp;
    }
    
    function updateSeedPrice(uint8 cropType, uint256 newPrice) external onlyOwner validCropType(cropType) {
        seedPrices[cropType] = newPrice;
    }
    
    function updatePlayerRegistry(address _playerRegistry) external onlyOwner {
        playerRegistryAddress = _playerRegistry;
    }
    
    function updateCropsToken(address _cropsToken) external onlyOwner {
        cropsTokenAddress = _cropsToken;
    }
    
    function updateFarmManager(address _farmManager) external onlyOwner {
        farmManagerAddress = _farmManager;
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
