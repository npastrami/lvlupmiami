// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "./LevelUpNFT.sol";

contract NFTStaker is ERC721Holder {
    LevelUpNFT public nftContract;
    mapping(address => uint256[]) public stakedTokens;
    uint256 public deadline;
    bool public completed;

    event NFTStaked(address indexed staker, uint256 tokenId);
    event NFTUnstaked(address indexed staker, uint256 tokenId);
    event LevelUp(address indexed staker, uint256 tokenId, uint256 newLevel);

    constructor(address _nftContract) {
        nftContract = LevelUpNFT(_nftContract);
        deadline = block.timestamp + 3 hours;
    }

    modifier notCompleted() {
        require(!completed, "Operation cannot be performed after completion");
        _;
    }

    // Stake an NFT
    function stakeNFT(uint256 tokenId) external notCompleted {
        require(block.timestamp < deadline, "Staking period has ended");
        nftContract.safeTransferFrom(msg.sender, address(this), tokenId);
        stakedTokens[msg.sender].push(tokenId);

        emit NFTStaked(msg.sender, tokenId);
    }

    // Execute level up after deadline
    function executeLevelUp(uint256 tokenId) external notCompleted {
        require(block.timestamp >= deadline, "Deadline has not been reached yet");
        require(isTokenStaked(msg.sender, tokenId), "Token not staked by sender");

        nftContract.incrementTokenLevel(tokenId);
        emit LevelUp(msg.sender, tokenId, nftContract.getTokenLevel(tokenId));

        completed = true;
    }

    // Withdraw an NFT
    function withdrawNFT(uint256 tokenId) external notCompleted {
        require(block.timestamp >= deadline, "Deadline has not been reached yet");
        require(isTokenStaked(msg.sender, tokenId), "Token not staked by sender");

        uint256 index = findTokenIndex(msg.sender, tokenId);
        stakedTokens[msg.sender][index] = stakedTokens[msg.sender][stakedTokens[msg.sender].length - 1];
        stakedTokens[msg.sender].pop();

        nftContract.safeTransferFrom(address(this), msg.sender, tokenId);
        emit NFTUnstaked(msg.sender, tokenId);
    }

    // Check if a token is staked by a user
    function isTokenStaked(address staker, uint256 tokenId) internal view returns (bool) {
        uint256[] memory tokens = stakedTokens[staker];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                return true;
            }
        }
        return false;
    }

    // Find the index of a staked token
    function findTokenIndex(address staker, uint256 tokenId) internal view returns (uint256) {
        uint256[] memory tokens = stakedTokens[staker];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                return i;
            }
        }
        revert("Token not found");
    }
}
