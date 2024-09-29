// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import the ERC721 standard and extensions from OpenZeppelin
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title FreshMint NFT Contract
contract FreshMint is ERC721URIStorage, Ownable {
    // Token ID counter
    uint256 private _tokenIds;

    /// @notice Constructor sets the name and symbol of the NFT collection
    constructor() ERC721("FreshMint Collection", "FRESH") {}

    /// @notice Mint a new NFT
    /// @param recipient The address that will receive the NFT
    /// @param tokenURI The IPFS link to the token's metadata
    /// @return tokenId The newly minted token ID
    function mintNFT(address recipient, string memory tokenURI)
        public
        returns (uint256)
    {
        _tokenIds += 1; // Increment the token ID counter
        uint256 tokenId = _tokenIds;

        _mint(recipient, tokenId); // Mint the NFT to the recipient
        _setTokenURI(tokenId, tokenURI); // Set the token's URI

        return tokenId;
    }
}
