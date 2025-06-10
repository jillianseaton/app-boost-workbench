
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract WithdrawalContract is ReentrancyGuard, Ownable, Pausable {
    struct Withdrawal {
        address user;
        uint256 amount;
        uint256 timestamp;
        bool completed;
        string transactionId;
    }
    
    mapping(bytes32 => Withdrawal) public withdrawals;
    mapping(address => uint256) public userWithdrawalCount;
    
    uint256 public minWithdrawalAmount = 0.001 ether;
    uint256 public maxWithdrawalAmount = 10 ether;
    uint256 public dailyWithdrawalLimit = 5 ether;
    
    event WithdrawalRequested(
        bytes32 indexed withdrawalId,
        address indexed user,
        uint256 amount,
        string transactionId
    );
    
    event WithdrawalCompleted(
        bytes32 indexed withdrawalId,
        address indexed user,
        uint256 amount
    );
    
    modifier validAmount(uint256 amount) {
        require(amount >= minWithdrawalAmount, "Amount below minimum");
        require(amount <= maxWithdrawalAmount, "Amount exceeds maximum");
        _;
    }
    
    constructor() {}
    
    function requestWithdrawal(
        address user,
        uint256 amount,
        string memory transactionId
    ) external onlyOwner validAmount(amount) whenNotPaused nonReentrant {
        bytes32 withdrawalId = keccak256(
            abi.encodePacked(user, amount, block.timestamp, transactionId)
        );
        
        require(withdrawals[withdrawalId].user == address(0), "Withdrawal already exists");
        require(address(this).balance >= amount, "Insufficient contract balance");
        
        withdrawals[withdrawalId] = Withdrawal({
            user: user,
            amount: amount,
            timestamp: block.timestamp,
            completed: false,
            transactionId: transactionId
        });
        
        userWithdrawalCount[user]++;
        
        emit WithdrawalRequested(withdrawalId, user, amount, transactionId);
    }
    
    function executeWithdrawal(bytes32 withdrawalId) 
        external 
        onlyOwner 
        whenNotPaused 
        nonReentrant 
    {
        Withdrawal storage withdrawal = withdrawals[withdrawalId];
        require(withdrawal.user != address(0), "Withdrawal does not exist");
        require(!withdrawal.completed, "Withdrawal already completed");
        require(address(this).balance >= withdrawal.amount, "Insufficient balance");
        
        withdrawal.completed = true;
        
        (bool success, ) = withdrawal.user.call{value: withdrawal.amount}("");
        require(success, "Transfer failed");
        
        emit WithdrawalCompleted(withdrawalId, withdrawal.user, withdrawal.amount);
    }
    
    function depositFunds() external payable onlyOwner {
        require(msg.value > 0, "Must send ETH");
    }
    
    function withdrawFunds(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner()).transfer(amount);
    }
    
    function setWithdrawalLimits(
        uint256 _minAmount,
        uint256 _maxAmount,
        uint256 _dailyLimit
    ) external onlyOwner {
        minWithdrawalAmount = _minAmount;
        maxWithdrawalAmount = _maxAmount;
        dailyWithdrawalLimit = _dailyLimit;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    receive() external payable {}
}
