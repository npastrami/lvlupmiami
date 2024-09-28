// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;  // Do not change the solidity version as it negatively impacts submission grading

import "hardhat/console.sol";
import "./ExampleExternalContract.sol";

contract Staker {

  ExampleExternalContract public exampleExternalContract;

  constructor(address exampleExternalContractAddress) {
      exampleExternalContract = ExampleExternalContract(exampleExternalContractAddress);
  }

  // Mapping to track individual balances
  mapping(address => uint256) public balances;

  // Threshold set to 1 ether
  uint256 public constant threshold = 1 ether;

  // Deadline to execute the contract
  uint public deadline = block.timestamp + 3 hours;

  // Flag to indicate if the contract has been completed
  bool public completed;

  // Event to emit for the frontend
  event Stake(address indexed staker, uint256 amount);

  // Modifier to check that the contract is not completed
  modifier notCompleted() {
      require(!completed, "Operation cannot be performed after completion");
      _;
  }

  // Collect funds in a payable `stake()` function and track individual `balances` with a mapping:
  // (Make sure to add a `Stake(address,uint256)` event and emit it for the frontend `All Stakings` tab to display)
  function stake() public payable notCompleted {
    require(block.timestamp < deadline, "Staking period has ended");
    require(msg.value > 0, "Must send ETH to stake");

    // Update balance mapping
    balances[msg.sender] += msg.value;

    // Emit the event 
    emit Stake(msg.sender, msg.value);

    // Log to console for debugging
    console.log("Staked:", msg.sender, "amount:", msg.value);
  }

  // After some `deadline` allow anyone to call an `execute()` function
  // If the deadline has passed and the threshold is met, it should call `exampleExternalContract.complete{value: address(this).balance}()`
  // Function to execute staking after the deadline
  function execute() public notCompleted {
      require(block.timestamp >= deadline, "Deadline has not been reached yet");
      require(address(this).balance >= threshold, "Threshold not met");

      // Mark as completed
      completed = true;

      // Call complete function of ExampleExternalContract with all contract balance
      exampleExternalContract.complete{value: address(this).balance}();
  }

  // Function to withdraw if the threshold was not met
  function withdraw() public notCompleted {
      require(block.timestamp >= deadline, "Deadline has not been reached yet");
      require(address(this).balance < threshold, "Threshold met, cannot withdraw");

      uint256 userBalance = balances[msg.sender];
      require(userBalance > 0, "No balance to withdraw");

      // Set user's balance to zero before transfer to prevent re-entrancy
      balances[msg.sender] = 0;

      // Transfer balance back to user
      (bool success, ) = msg.sender.call{value: userBalance}("");
      require(success, "Transfer failed");
  }

  // View function to get the time left before the deadline
  function timeLeft() public view returns (uint256) {
      if (block.timestamp >= deadline) {
          return 0;
      } else {
          return deadline - block.timestamp;
      }
  }

  // Special function to receive ETH and call stake()
  receive() external payable {
      stake();
  }
}
