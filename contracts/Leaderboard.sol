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
}

contract Leaderboard is Ownable, Pausable {
    event PointsAdded(address indexed player, uint8 actionType, uint256 points, uint256 newTotal);
    
    address public playerRegistryAddress;
    mapping(address => bool) private authorizedContracts;
    mapping(address => uint256) private playerPoints;
    address[] private players;
    mapping(address => bool) private isInLeaderboard;
    
    constructor(address _playerRegistry) {
        playerRegistryAddress = _playerRegistry;
    }
    
    modifier onlyAuthorized() {
        require(authorizedContracts[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    function authorizeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = true;
    }
    
    function deauthorizeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = false;
    }
    
    function addPoints(address player, uint8 actionType, uint256 points) 
        external 
        whenNotPaused
        onlyAuthorized 
    {
        require(IPlayerRegistry(playerRegistryAddress).isPlayerRegistered(player), "Player not registered");
        
        if (!isInLeaderboard[player]) {
            players.push(player);
            isInLeaderboard[player] = true;
        }
        
        playerPoints[player] += points;
        
        emit PointsAdded(player, actionType, points, playerPoints[player]);
    }
    
    function getPlayerPoints(address player) external view returns (uint256) {
        return playerPoints[player];
    }
    
    function getTopPlayers(uint8 count) 
        external 
        view 
        returns (address[] memory, uint256[] memory) 
    {
        uint256 resultCount = count;
        if (players.length < resultCount) {
            resultCount = players.length;
        }
        
        if (resultCount == 0) {
            return (new address[](0), new uint256[](0));
        }
        
        address[] memory tempAddresses = new address[](players.length);
        uint256[] memory tempPoints = new uint256[](players.length);
        
        for (uint256 i = 0; i < players.length; i++) {
            tempAddresses[i] = players[i];
            tempPoints[i] = playerPoints[players[i]];
        }
        
        for (uint256 i = 0; i < players.length; i++) {
            for (uint256 j = i + 1; j < players.length; j++) {
                if (tempPoints[i] < tempPoints[j]) {
                    uint256 tempPoint = tempPoints[i];
                    tempPoints[i] = tempPoints[j];
                    tempPoints[j] = tempPoint;
                    
                    address tempAddr = tempAddresses[i];
                    tempAddresses[i] = tempAddresses[j];
                    tempAddresses[j] = tempAddr;
                }
            }
        }
        
        address[] memory topAddresses = new address[](resultCount);
        uint256[] memory topPoints = new uint256[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            topAddresses[i] = tempAddresses[i];
            topPoints[i] = tempPoints[i];
        }
        
        return (topAddresses, topPoints);
    }
    
    function getPlayerRank(address player) external view returns (uint256) {
        if (!isInLeaderboard[player]) {
            return 0;
        }
        
        uint256 playerPoint = playerPoints[player];
        uint256 rank = 1;
        
        for (uint256 i = 0; i < players.length; i++) {
            if (playerPoints[players[i]] > playerPoint) {
                rank++;
            }
        }
        
        return rank;
    }
    
    function getPlayerCount() external view returns (uint256) {
        return players.length;
    }
    
    function getPlayersPaginated(uint256 startIndex, uint256 count) 
        external 
        view 
        returns (address[] memory, uint256[] memory) 
    {
        if (startIndex >= players.length) {
            return (new address[](0), new uint256[](0));
        }
        
        uint256 endIndex = startIndex + count;
        if (endIndex > players.length) {
            endIndex = players.length;
        }
        
        uint256 resultCount = endIndex - startIndex;
        
        address[] memory resultAddresses = new address[](resultCount);
        uint256[] memory resultPoints = new uint256[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            resultAddresses[i] = players[startIndex + i];
            resultPoints[i] = playerPoints[players[startIndex + i]];
        }
        
        return (resultAddresses, resultPoints);
    }
    
    function updatePlayerRegistry(address _playerRegistry) external onlyOwner {
        playerRegistryAddress = _playerRegistry;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
