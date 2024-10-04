"use client";

import { FC, useState } from "react";
import { useScaffoldWriteContract, useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useAccount, usePublicClient, useChainId } from "wagmi";
import axios from 'axios';

const pinataApiKey = '72ec6afffc64e575a574';
const pinataSecretApiKey = 'b90a504f88ec18fe8f7d7bbf95ed2615c7792b358e3e3c4ef14f15fe6deec392';

const Mint: FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const chainId = useChainId(); // Get the current network chain ID
  const { data: deployedContractData } = useDeployedContractInfo("FreshMint"); // Get the deployed contract info

  // Correctly initialize the contract interaction
  const { writeContractAsync, isMining } = useScaffoldWriteContract("FreshMint");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const uploadImageToIPFS = async (imageFile: File) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    let data = new FormData();
    data.append('file', imageFile);

    const response = await axios.post(url, data, {
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretApiKey,
      },
    });

    return response.data.IpfsHash; // The IPFS hash of the uploaded image
  };

  const uploadMetadataToIPFS = async (imageHash: string, name: string, description: string) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

    const metadata = {
      name: name,
      description: description,
      image: `https://gateway.pinata.cloud/ipfs/${imageHash}`, // Link to the image file
      attributes: [],
    };

    const response = await axios.post(url, metadata, {
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretApiKey,
      },
    });

    return response.data.IpfsHash; // The IPFS hash of the uploaded metadata
  };

  const handleMint = async () => {
    if (!file) {
      alert("Please upload an image file.");
      return;
    }

    if (!recipientAddress) {
      alert("Please enter the recipient wallet address.");
      return;
    }

    if (!address) {
      alert("Please connect your wallet.");
      return;
    }

    if (!publicClient) {
      alert("Unable to access blockchain client. Please try again later.");
      return;
    }

    // Check if the user is connected to the correct network
    const expectedChainId = 31337; // For example, localhost testnet
    console.log("Chain ID:", chainId);
    if (chainId !== expectedChainId) {
      alert(`You are on the wrong network. Please switch to the correct network.`);
      return;
    }
    console.log("TEST");
    try {
      // Step 1: Upload the image to IPFS using Pinata
      const imageHash = await uploadImageToIPFS(file);
      console.log("Image uploaded to IPFS:", imageHash);

      // Step 2: Create and upload metadata to IPFS
      const metadataHash = await uploadMetadataToIPFS(imageHash, "My NFT", "This is my NFT description");
      console.log("Metadata uploaded to IPFS:", metadataHash);

      // Step 3: Mint the NFT with the recipient address and the metadata URI
      const tokenURI = `https://gateway.pinata.cloud/ipfs/${metadataHash}`;
      const txHash = await writeContractAsync({
        functionName: "mintNFT",
        args: [recipientAddress, tokenURI],
      });

      if (!txHash) {
        alert("Transaction hash is undefined. Please try again.");
        return;
      }

      // Wait for the transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      if (receipt.status === 'success') {
        alert("NFT minted successfully!");
      } else {
        alert("Transaction failed. Please try again.");
      }
    } catch (error) {
      console.error("Error minting NFT:", error);
      alert("Error minting NFT. See console for details.");
    }
  };

  return (
    <div className="flex flex-col items-center mt-5">
      <input
        type="file"
        onChange={handleFileChange}
        className="mb-3"
      />
      <input
        type="text"
        placeholder="Enter recipient wallet address"
        value={recipientAddress}
        onChange={(e) => setRecipientAddress(e.target.value)}
        className="input input-bordered w-full max-w-xs mb-3"
      />
      <button
        className={`btn btn-primary ${isMining ? "loading" : ""}`}
        onClick={handleMint}
        disabled={isMining}
      >
        {isMining ? "Minting..." : "Mint New NFT"}
      </button>
    </div>
  );
};

export default Mint;
