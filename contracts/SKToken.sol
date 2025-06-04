// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SKToken is ERC20, Ownable {
    uint256 public constant EXCHANGE_RATE = 10000; // 1 ETH = 10000 SK tokens
    
    event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 tokenAmount);
    event TokensWithdrawn(address indexed owner, uint256 amount);
    
    constructor() ERC20("SK Token", "SK") Ownable(msg.sender) {
        // Initial supply can be minted by owner if needed
    }
    
    /**
     * @dev Purchase SK tokens with ETH
     * Exchange rate: 1 ETH = 10000 SK tokens
     */
    function purchaseTokens() external payable {
        require(msg.value > 0, "Must send ETH to purchase tokens");
        
        uint256 tokenAmount = msg.value * EXCHANGE_RATE;
        _mint(msg.sender, tokenAmount);
        
        emit TokensPurchased(msg.sender, msg.value, tokenAmount);
    }
    
    /**
     * @dev Owner can withdraw collected ETH
     */
    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        
        payable(owner()).transfer(balance);
        emit TokensWithdrawn(owner(), balance);
    }
    
    /**
     * @dev Get contract ETH balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Calculate token amount for given ETH amount
     */
    function calculateTokenAmount(uint256 ethAmount) external pure returns (uint256) {
        return ethAmount * EXCHANGE_RATE;
    }
} 