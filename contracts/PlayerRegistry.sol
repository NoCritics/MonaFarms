// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface IFarmManager {
    function initializePlayer(address playerAddress) external;
}

contract PlayerRegistry is Ownable, Pausable {
    struct Player {
        string nickname;
        uint256 registrationTime;
        bool exists;
        uint8 waterBuckets;
        uint8 initialSeedType; 
        uint8 initialSeedCount;
        uint8 ownedTiles;
    }
    
    mapping(address => Player) private players;
    mapping(string => address) private nicknameToAddress;
    address[] private registeredPlayers;
    
    mapping(address => bool) private authorizedContracts;
    
    address public farmManagerAddress;
    
    event PlayerRegistered(address indexed playerAddress, string nickname, uint256 timestamp);
    event NicknameChanged(address indexed playerAddress, string oldNickname, string newNickname);
    event ContractAuthorized(address indexed contractAddress);
    event ContractDeauthorized(address indexed contractAddress);
    
    constructor() {}
    
    modifier onlyAuthorized() {
        require(authorizedContracts[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    modifier playerExists(address playerAddress) {
        require(players[playerAddress].exists, "Player does not exist");
        _;
    }
    
    modifier playerDoesNotExist(address playerAddress) {
        require(!players[playerAddress].exists, "Player already exists");
        _;
    }
    
    modifier validNickname(string memory nickname) {
        require(bytes(nickname).length >= 3 && bytes(nickname).length <= 16, "Invalid nickname length");
        require(nicknameToAddress[nickname] == address(0), "Nickname already taken");
        _;
    }
    
    function authorizeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = true;
        emit ContractAuthorized(contractAddress);
    }
    
    function setFarmManager(address _farmManagerAddress) external onlyOwner {
        farmManagerAddress = _farmManagerAddress;
    }
    
    function deauthorizeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = false;
        emit ContractDeauthorized(contractAddress);
    }
    
    function registerPlayer(string calldata nickname) 
        external 
        whenNotPaused 
        playerDoesNotExist(msg.sender) 
        validNickname(nickname) 
    {
        uint8 seedType;
        uint8 seedCount;
        
        uint256 randomValue = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 3;
        
        if (randomValue == 0) {
            seedType = 0; // Tomato
            seedCount = 3;
        } else if (randomValue == 1) {
            seedType = 1; // Potato
            seedCount = 2;
        } else {
            seedType = 2; // Strawberry
            seedCount = 1;
        }
        
        players[msg.sender] = Player({
            nickname: nickname,
            registrationTime: block.timestamp,
            exists: true,
            waterBuckets: 6,
            initialSeedType: seedType,
            initialSeedCount: seedCount,
            ownedTiles: 3
        });
        
        nicknameToAddress[nickname] = msg.sender;
        registeredPlayers.push(msg.sender);
        
        emit PlayerRegistered(msg.sender, nickname, block.timestamp);
        
        if (farmManagerAddress != address(0)) {
            IFarmManager(farmManagerAddress).initializePlayer(msg.sender);
        }
    }
    
    function updateNickname(string calldata newNickname) 
        external 
        whenNotPaused 
        playerExists(msg.sender) 
        validNickname(newNickname) 
    {
        string memory oldNickname = players[msg.sender].nickname;
        
        nicknameToAddress[oldNickname] = address(0);
        players[msg.sender].nickname = newNickname;
        nicknameToAddress[newNickname] = msg.sender;
        
        emit NicknameChanged(msg.sender, oldNickname, newNickname);
    }
    
    function getPlayer(address playerAddress) 
        external 
        view 
        returns (
            string memory nickname,
            uint256 registrationTime,
            bool exists,
            uint8 waterBuckets,
            uint8 initialSeedType,
            uint8 initialSeedCount,
            uint8 ownedTiles
        ) 
    {
        Player storage player = players[playerAddress];
        return (
            player.nickname,
            player.registrationTime,
            player.exists,
            player.waterBuckets,
            player.initialSeedType,
            player.initialSeedCount,
            player.ownedTiles
        );
    }
    
    function isPlayerRegistered(address playerAddress) external view returns (bool) {
        return players[playerAddress].exists;
    }
    
    function getAddressByNickname(string calldata nickname) external view returns (address) {
        return nicknameToAddress[nickname];
    }
    
    function getRegisteredPlayerCount() external view returns (uint256) {
        return registeredPlayers.length;
    }
    
    function getRegisteredPlayersPaginated(uint256 startIndex, uint256 count) 
        external 
        view 
        returns (address[] memory) 
    {
        uint256 totalPlayers = registeredPlayers.length;
        
        if (startIndex >= totalPlayers) {
            return new address[](0);
        }
        
        uint256 endIndex = startIndex + count;
        if (endIndex > totalPlayers) {
            endIndex = totalPlayers;
            count = endIndex - startIndex;
        }
        
        address[] memory result = new address[](count);
        
        for (uint256 i = 0; i < count; i++) {
            result[i] = registeredPlayers[startIndex + i];
        }
        
        return result;
    }

    function updateOwnedTiles(address playerAddress, uint8 newTileCount) 
        external
        onlyAuthorized
        playerExists(playerAddress)
    {
        players[playerAddress].ownedTiles = newTileCount;
    }
    
    function updateWaterBuckets(address playerAddress, uint8 newWaterBucketCount) 
        external
        onlyAuthorized
        playerExists(playerAddress)
    {
        players[playerAddress].waterBuckets = newWaterBucketCount;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}
