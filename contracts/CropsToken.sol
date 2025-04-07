// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract CropsToken is ERC20, Ownable, Pausable {
    uint256 public constant DAILY_FAUCET_AMOUNT = 50 * 10**18;
    uint256 public constant FAUCET_COOLDOWN = 24 hours;

    mapping(address => bool) private authorizedContracts;
    mapping(address => uint256) private lastFaucetClaim;
    
    event FaucetClaimed(address indexed player, uint256 amount, uint256 timestamp);
    event ContractAuthorized(address indexed contractAddress);
    event ContractDeauthorized(address indexed contractAddress);
    
    constructor() ERC20("CROPS Token", "CROPS") {}
    
    modifier onlyAuthorized() {
        require(authorizedContracts[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    function authorizeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = true;
        emit ContractAuthorized(contractAddress);
    }
    
    function deauthorizeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = false;
        emit ContractDeauthorized(contractAddress);
    }
    
    function mint(address to, uint256 amount) external onlyAuthorized whenNotPaused {
        _mint(to, amount);
    }
    
    function burnFrom(address from, uint256 amount) external onlyAuthorized whenNotPaused {
        _burn(from, amount);
    }
    
    function claimDailyFaucet() external whenNotPaused {
        require(
            block.timestamp >= lastFaucetClaim[msg.sender] + FAUCET_COOLDOWN,
            "Faucet already claimed today"
        );
        
        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, DAILY_FAUCET_AMOUNT);
        
        emit FaucetClaimed(msg.sender, DAILY_FAUCET_AMOUNT, block.timestamp);
    }
    
    function timeUntilNextFaucet(address player) external view returns (uint256) {
        uint256 lastClaim = lastFaucetClaim[player];
        
        if (lastClaim == 0 || block.timestamp >= lastClaim + FAUCET_COOLDOWN) {
            return 0;
        }
        
        return (lastClaim + FAUCET_COOLDOWN) - block.timestamp;
    }
    
    function getLastClaimTime(address player) external view returns (uint256) {
        return lastFaucetClaim[player];
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function transfer(address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }
    
    function transferFrom(address from, address to, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }
}
