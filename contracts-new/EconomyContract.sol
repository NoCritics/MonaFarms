// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GlobalEnumsAndStructs.sol";
import "./CROPS_Token.sol";
import "./PlayerRegistryInventory.sol";
import "./TimeOracle.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EconomyContract is Ownable, GlobalEnumsAndStructs {
    CROPS_Token public cropsToken;
    PlayerRegistryInventory public playerRegistry;
    TimeOracle public timeOracle;

    address public treasuryAddress; // This contract itself can be the treasury initially, or a separate Gnosis Safe / EOA.

    uint256 public constant DAILY_FAUCET_AMOUNT = 50;
    uint256 public constant INITIAL_PLAYER_CROPS = 100;

    event CropsMintedForPlayer(address indexed player, uint256 amount);
    event FaucetClaimed(address indexed player, uint256 amount);
    event TreasuryAddressChanged(address indexed newTreasury);
    event PlayerInitialCropsGranted(address indexed player, uint256 amount);

    // Modifiers to restrict functions to other specific contracts
    // These would require the caller contracts to have a known, fixed address or implement an interface
    // For now, using onlyOwner or public/internal as appropriate, with comments on intended callers.

    constructor(address initialOwner, address _cropsTokenAddress, address _playerRegistryAddress, address _timeOracleAddress)
    {
        _transferOwnership(initialOwner);
        require(_cropsTokenAddress != address(0), "Invalid CROPS token address");
        require(_playerRegistryAddress != address(0), "Invalid PlayerRegistry address");
        require(_timeOracleAddress != address(0), "Invalid TimeOracle address");

        cropsToken = CROPS_Token(_cropsTokenAddress);
        playerRegistry = PlayerRegistryInventory(_playerRegistryAddress);
        timeOracle = TimeOracle(_timeOracleAddress);
        treasuryAddress = address(this); // This contract is the treasury by default

        // The EconomyContract needs to be the owner of CROPS_Token to mint.
        // This transfer of ownership must happen in the deployment script.
        // cropsToken.transferOwnership(address(this)); // Example, actual call in deploy script
    }

    function setTreasuryAddress(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury address");
        treasuryAddress = _newTreasury;
        emit TreasuryAddressChanged(_newTreasury);
    }

    function claimDailyFaucet() external {
        // Ensure player is registered (implicitly handled by PlayerRegistry calls if any)
        require(!timeOracle.isCooldownActive(msg.sender, TimeOracle.CooldownType.DAILY_FAUCET), "Faucet cooldown active");

        cropsToken.mint(msg.sender, DAILY_FAUCET_AMOUNT * (10**cropsToken.decimals()));
        timeOracle.startCooldown(msg.sender, TimeOracle.CooldownType.DAILY_FAUCET);

        playerRegistry._addItem(msg.sender, ItemID.CROPS_CURRENCY, DAILY_FAUCET_AMOUNT * (10**cropsToken.decimals()));

        emit FaucetClaimed(msg.sender, DAILY_FAUCET_AMOUNT);
    }

    // Called by FarmManager on harvest
    function mintCropsForHarvest(address player, uint256 amount) external {
        // Add access control: only FarmManager
        // For now, ensure it's a registered player receiving crops, though FarmManager should guarantee this.
        PlayerProfile memory profile = playerRegistry.getPlayerProfile(player);
        require(bytes(profile.nickname).length != 0, "Player not registered");
        // Consider adding a check that msg.sender is the FarmManager contract address once known.

        cropsToken.mint(player, amount); // Amount should already be adjusted for decimals by FarmManager
        playerRegistry._addItem(player, ItemID.CROPS_CURRENCY, amount);
        emit CropsMintedForPlayer(player, amount);
    }

    // Called by ShopManager on purchase
    function receiveCropsFromPurchase(address /*player*/, uint256 amount) external {
        // Add access control: only ShopManager
        // Player sends CROPS to ShopManager, ShopManager transfers them here.
        // Or player approves ShopManager, ShopManager calls transferFrom to this contract.
        // Assuming ShopManager has the CROPS and transfers them here.
        // This requires ShopManager to call cropsToken.transfer(address(this), amount)
        // For now, this function is a placeholder for the CROPS transfer logic that will occur within ShopManager
        // and this contract (as treasury) will be the recipient.
        // The actual CROPS transfer from player to treasury happens in ShopManager.
        // This function could be used to log or verify if needed, but direct transfer to treasuryAddress is simpler.
        require(cropsToken.transferFrom(msg.sender, treasuryAddress, amount), "CROPS transfer failed");
        // The above assumes msg.sender is ShopManager, who is transferring *on behalf of* the player to the treasury.
        // More accurately, ShopManager would call: cropsToken.transferFrom(PLAYER_ADDRESS, treasuryAddress, amount)
        // For player direct payment: player calls cropsToken.approve(shopManagerAddress, amount) then shopManager calls this.

        // No, the ShopManager should ensure the player has paid, then transfer to the treasuryAddress (this contract).
        // So, ShopManager will call: cropsToken.transferFrom(player, treasuryAddress (which is address(this)), amount);
        // This function isn't strictly needed if treasuryAddress is public and ShopManager transfers directly.
        // However, keeping it allows for potential future logic/event emission here.
    }

    // Function to grant initial CROPS to newly registered players
    // This can be called by PlayerRegistryInventory after registration or by an admin role.
    // To make it callable by PlayerRegistryInventory, PlayerRegistryInventory would need a known address, or this becomes onlyOwner.
    function grantInitialPlayerCrops(address player) external onlyOwner { // Or restricted to PlayerRegistry
        PlayerProfile memory profile = playerRegistry.getPlayerProfile(player);
        require(bytes(profile.nickname).length != 0, "Player not registered");
        // Check if already granted to prevent double minting if there's a re-trigger somehow.
        // PlayerRegistryInventory can have a flag like `initialCropsGranted` or check balance.
        // For now, PlayerRegistryInventory's `grantInitialCrops` handles the balance check.

        uint256 initialAmount = INITIAL_PLAYER_CROPS * (10**cropsToken.decimals());
        cropsToken.mint(player, initialAmount);
        // Update PlayerRegistryInventory directly instead of it calling back to avoid re-entrancy / complexity
        playerRegistry.grantInitialCrops(player, initialAmount); // This will call _addItem internally

        emit PlayerInitialCropsGranted(player, INITIAL_PLAYER_CROPS);
    }


    function withdrawTreasury(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        require(cropsToken.balanceOf(treasuryAddress) >= amount, "Insufficient treasury balance");
        if (treasuryAddress == address(this)) {
            cropsToken.transfer(to, amount);
        } else {
            // If treasury is an external address, this contract can't directly send from it.
            // This function would only make sense if this contract *is* the treasury.
            // Or, the owner of the external treasury address would call withdraw on that.
            revert("Withdrawal only possible if this contract is the treasury");
        }
    }

    // Allow owner to transfer CROPS_Token ownership to this EconomyContract
    // This is a convenience if deployer doesn't do it manually.
    function claimCropsTokenOwnership() external onlyOwner {
        Ownable(address(cropsToken)).transferOwnership(address(this));
    }

    // Admin function to mint CROPS for any account (callable by EconomyContract owner)
    function adminMint(address recipient, uint256 amountInCropsDecimalUnit) external onlyOwner {
        require(recipient != address(0), "Recipient cannot be zero address");
        require(amountInCropsDecimalUnit > 0, "Amount must be positive");
        // No need to adjust for decimals here, assume caller provides amount in smallest unit (like WEI for ETH)
        cropsToken.mint(recipient, amountInCropsDecimalUnit);
        // Also update player's internal CROPS_CURRENCY balance in PlayerRegistryInventory
        playerRegistry._addItem(recipient, ItemID.CROPS_CURRENCY, amountInCropsDecimalUnit);
        emit CropsMintedForPlayer(recipient, amountInCropsDecimalUnit); // Reusing existing event
    }

    function setExternalContracts(address _cropsTokenAddress, address _playerRegistryAddress, address _timeOracleAddress) external onlyOwner {
        require(_cropsTokenAddress != address(0));
        require(_playerRegistryAddress != address(0));
        require(_timeOracleAddress != address(0));
        cropsToken = CROPS_Token(_cropsTokenAddress);
        playerRegistry = PlayerRegistryInventory(_playerRegistryAddress);
        timeOracle = TimeOracle(_timeOracleAddress);
    }
} 