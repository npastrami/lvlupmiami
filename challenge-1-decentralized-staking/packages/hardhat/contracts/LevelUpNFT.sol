// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LevelUpNFT is ERC721URIStorage, Ownable {
    // Mapping to store the level of each token
    mapping(uint256 => uint256) private tokenLevels;

    constructor() ERC721("LevelUpNFT", "LUNFT") {}

    // Mint new NFTs
    function mint(address to, uint256 tokenId, string memory tokenURI) external onlyOwner {
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        tokenLevels[tokenId] = 1; // Initial level set to 1
    }

    // Get the level of a token
    function getTokenLevel(uint256 tokenId) external view returns (uint256) {
        return tokenLevels[tokenId];
    }

    // Increment the level of the token
    function incrementTokenLevel(uint256 tokenId) external {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not authorized");
        tokenLevels[tokenId] += 1;
    }
}
