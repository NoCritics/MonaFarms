// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GlobalEnumsAndStructs.sol";
import "./PlayerRegistryInventory.sol";
// FarmEnhancementContract might be needed if tier updates directly trigger complex logic there.
// For now, PlayerRegistryInventory handles simple upgrade flag updates based on tier.

import "@openzeppelin/contracts/access/Ownable.sol";

contract PlayerLeaderboard is Ownable, GlobalEnumsAndStructs {
    PlayerRegistryInventory public playerRegistry;
    // address public farmEnhancementContract; // If direct calls are needed

    mapping(address => uint256) public playerPoints;
    mapping(AchievementTier => uint256) public tierPointThresholds;

    // Leaderboard tracking
    address[] public leaderboardPlayers;
    uint256 public constant MAX_LEADERBOARD_SIZE = 1000;
    
    // Action points (configurable by owner)
    mapping(string => uint256) public actionBasePoints;

    event PointsAwarded(address indexed player, string action, uint256 points, uint256 totalPoints);
    event TierThresholdSet(AchievementTier indexed tier, uint256 points);
    event ActionPointsSet(string actionName, uint256 points);
    event LeaderboardUpdated(address indexed player, uint256 newRank);

    modifier onlyKnownAction(string calldata actionName) {
        require(actionBasePoints[actionName] > 0, "Unknown or zero-point action");
        _;
    }

    constructor(address initialOwner, address _playerRegistryAddress)
    {
        _transferOwnership(initialOwner);
        require(_playerRegistryAddress != address(0), "Invalid PlayerRegistry address");
        playerRegistry = PlayerRegistryInventory(_playerRegistryAddress);

        // Initialize tier thresholds
        tierPointThresholds[AchievementTier.BEGINNER] = 0;
        tierPointThresholds[AchievementTier.INTERMEDIATE] = 501;
        tierPointThresholds[AchievementTier.EXPERT] = 1501;
        tierPointThresholds[AchievementTier.MASTER] = 3001;
        tierPointThresholds[AchievementTier.LEGENDARY] = 6001;
        tierPointThresholds[AchievementTier.EPOCHAL] = 10001;
        // Max points for Epochal tier is 20000, but the threshold is the start.

        // Initialize default action points
        actionBasePoints["PLANT_CROP"] = 5;
        actionBasePoints["HARVEST_CROP"] = 10;
        actionBasePoints["WATER_CROP"] = 7;
        actionBasePoints["FERTILIZE_CROP"] = 8;
        actionBasePoints["PURCHASE_ITEM"] = 7; // General shop purchase
        actionBasePoints["PURCHASE_TILE"] = 15; // Specific for tiles
        actionBasePoints["CRAFT_ITEM"] = 9;
        // Points for specific achievements from achieve.txt will be handled by calling addPoints directly.
    }

    function setTierThreshold(AchievementTier tier, uint256 points) external onlyOwner {
        tierPointThresholds[tier] = points;
        emit TierThresholdSet(tier, points);
    }

    function setActionBasePoints(string calldata actionName, uint256 points) external onlyOwner {
        actionBasePoints[actionName] = points;
        emit ActionPointsSet(actionName, points);
    }

    function addPointsForAction(address player, string calldata actionName) external {
        // Access control: Only callable by game contracts (FarmManager, ShopManager, CraftingManager)
        // For now, assumes these contracts are trusted and will call this correctly.
        // A more robust system might involve role-based access or contract address checks.
        PlayerProfile memory profile = playerRegistry.getPlayerProfile(player);
        require(bytes(profile.nickname).length != 0, "Player not registered");
        uint256 pointsToAdd = actionBasePoints[actionName];
        require(pointsToAdd > 0, "Action has no points value or is unknown");

        _addPointsInternal(player, pointsToAdd, actionName);
    }

    // For specific achievement milestones that grant a fixed number of points
    function awardAchievementPoints(address player, uint256 points, string calldata achievementName) external onlyOwner { // Or restricted caller
        PlayerProfile memory profile = playerRegistry.getPlayerProfile(player);
        require(bytes(profile.nickname).length != 0, "Player not registered");
        require(points > 0, "Points must be positive");

        _addPointsInternal(player, points, achievementName);
    }

    function _addPointsInternal(address player, uint256 pointsToAdd, string calldata sourceAction) private {
        uint256 oldPoints = playerPoints[player];
        playerPoints[player] += pointsToAdd;

        emit PointsAwarded(player, sourceAction, pointsToAdd, playerPoints[player]);

        AchievementTier oldTier = getTierForPoints(oldPoints);
        AchievementTier newTier = getTierForPoints(playerPoints[player]);

        if (newTier != oldTier) {
            playerRegistry._updatePlayerTier(player, newTier);
            // If FarmEnhancementContract needs direct notification beyond PlayerRegistry updating flags:
            // IFarmEnhancement(farmEnhancementContract).onPlayerTierUp(player, newTier);
        }
        
        // Update player in leaderboard
        _updateLeaderboard(player);
    }
    
    // Update player position in leaderboard
    function _updateLeaderboard(address player) private {
        uint256 playerPosition = _findPlayerPosition(player);
        uint256 newPoints = playerPoints[player];
        
        // If player is not in leaderboard yet
        if (playerPosition == leaderboardPlayers.length) {
            // If leaderboard is not full or player has more points than the last player
            if (leaderboardPlayers.length < MAX_LEADERBOARD_SIZE || 
                (leaderboardPlayers.length > 0 && newPoints > playerPoints[leaderboardPlayers[leaderboardPlayers.length - 1]])) {
                
                // Add player to leaderboard if not full
                if (leaderboardPlayers.length < MAX_LEADERBOARD_SIZE) {
                    leaderboardPlayers.push(player);
                    playerPosition = leaderboardPlayers.length - 1;
                } else {
                    // Replace last player with current player
                    leaderboardPlayers[leaderboardPlayers.length - 1] = player;
                    playerPosition = leaderboardPlayers.length - 1;
                }
            } else {
                // Player doesn't qualify for leaderboard yet
                return;
            }
        }
        
        // Bubble up the player to the correct position
        while (playerPosition > 0 && newPoints > playerPoints[leaderboardPlayers[playerPosition - 1]]) {
            // Swap with the player above
            address temp = leaderboardPlayers[playerPosition - 1];
            leaderboardPlayers[playerPosition - 1] = leaderboardPlayers[playerPosition];
            leaderboardPlayers[playerPosition] = temp;
            playerPosition--;
        }
        
        emit LeaderboardUpdated(player, playerPosition + 1); // +1 for 1-based ranking
    }
    
    // Find player position in leaderboard array
    function _findPlayerPosition(address player) private view returns (uint256) {
        for (uint256 i = 0; i < leaderboardPlayers.length; i++) {
            if (leaderboardPlayers[i] == player) {
                return i;
            }
        }
        return leaderboardPlayers.length; // Not found
    }

    function getTierForPoints(uint256 points) public view returns (AchievementTier) {
        if (points >= tierPointThresholds[AchievementTier.EPOCHAL] && points <= 20000) return AchievementTier.EPOCHAL;
        if (points >= tierPointThresholds[AchievementTier.LEGENDARY]) return AchievementTier.LEGENDARY;
        if (points >= tierPointThresholds[AchievementTier.MASTER]) return AchievementTier.MASTER;
        if (points >= tierPointThresholds[AchievementTier.EXPERT]) return AchievementTier.EXPERT;
        if (points >= tierPointThresholds[AchievementTier.INTERMEDIATE]) return AchievementTier.INTERMEDIATE;
        return AchievementTier.BEGINNER;
    }

    function getCurrentPlayerTier(address player) external view returns (AchievementTier) {
        PlayerProfile memory profile = playerRegistry.getPlayerProfile(player);
        require(bytes(profile.nickname).length != 0, "Player not registered");
        return getTierForPoints(playerPoints[player]);
    }

    function getPlayerPoints(address player) external view returns (uint256) {
        PlayerProfile memory profile = playerRegistry.getPlayerProfile(player);
        require(bytes(profile.nickname).length != 0, "Player not registered");
        return playerPoints[player];
    }
    
    // Get player's rank (1-based) - returns 0 if not in top leaderboard
    function getPlayerRank(address player) external view returns (uint256) {
        for (uint256 i = 0; i < leaderboardPlayers.length; i++) {
            if (leaderboardPlayers[i] == player) {
                return i + 1; // 1-based ranking
            }
        }
        return 0; // Not in the leaderboard
    }
    
    // Get total number of players on the leaderboard
    function getLeaderboardSize() external view returns (uint256) {
        return leaderboardPlayers.length;
    }
    
    // Get top N players (up to MAX_LEADERBOARD_SIZE)
    function getTopPlayers(uint256 count) external view returns (address[] memory, uint256[] memory) {
        uint256 resultCount = count > leaderboardPlayers.length ? leaderboardPlayers.length : count;
        
        address[] memory players = new address[](resultCount);
        uint256[] memory points = new uint256[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            players[i] = leaderboardPlayers[i];
            points[i] = playerPoints[leaderboardPlayers[i]];
        }
        
        return (players, points);
    }
    
    function setExternalContracts(address _playerRegistryAddress) external onlyOwner {
        require(_playerRegistryAddress != address(0));
        playerRegistry = PlayerRegistryInventory(_playerRegistryAddress);
    }
} 