// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Using OpenZeppelin contracts for robust and secure ERC20 implementation
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CROPS_Token is ERC20, Ownable {
    constructor(address initialOwner) ERC20("CROPS Token", "CROPS") {
        _transferOwnership(initialOwner);
        // No initial supply is minted here; EconomyContract will handle minting.
    }

    /**
     * @dev Creates `amount` tokens and assigns them to `account`,
     * increasing the total supply.
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - Only callable by the owner (EconomyContract).
     */
    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens.
     * - Only callable by the owner (EconomyContract or main game owner for specific scenarios).
     */
    function burn(address account, uint256 amount) public onlyOwner {
        _burn(account, amount);
    }
} 