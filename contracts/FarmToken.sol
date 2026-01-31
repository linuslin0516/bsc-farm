// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FarmToken
 * @dev Test $FARM token for BSC Happy Farm game
 *
 * This is a TEST token for development purposes.
 * For production, you would deploy via FLAP with proper tokenomics.
 */
contract FarmToken is ERC20, Ownable {
    // Initial supply: 1,000,000 FARM (with 18 decimals)
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18;

    // Treasury wallet for game exchanges
    address public treasury;

    // Events
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    constructor(address _treasury) ERC20("Happy Farm Token", "FARM") Ownable(msg.sender) {
        require(_treasury != address(0), "Treasury cannot be zero address");
        treasury = _treasury;

        // Mint initial supply to deployer
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @dev Update treasury address (only owner)
     */
    function setTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Treasury cannot be zero address");
        address oldTreasury = treasury;
        treasury = _newTreasury;
        emit TreasuryUpdated(oldTreasury, _newTreasury);
    }

    /**
     * @dev Mint additional tokens (only owner, for testing)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from sender
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
