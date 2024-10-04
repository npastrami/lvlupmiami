"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import {
  useDeployedContractInfo,
  useScaffoldWriteContract,
  useScaffoldReadContract,
} from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import humanizeDuration from "humanize-duration";

export const StakeContractInteraction = ({ address }: { address?: string }) => {
  const { address: connectedAddress } = useAccount();
  const { data: StakerContract } = useDeployedContractInfo("NFTStaker");

  const [tokenId, setTokenId] = useState<string>("");

  const { targetNetwork } = useTargetNetwork();

  // Contract Write Actions
  const stakeNFT = useScaffoldWriteContract("NFTStaker");
  const executeLevelUp = useScaffoldWriteContract("NFTStaker");
  const withdrawNFT = useScaffoldWriteContract("NFTStaker");

  // Fixing read contract data
  const { data: deadline } = useScaffoldReadContract({
    contractName: "NFTStaker",
    functionName: "deadline",
    watch: true,
  });

  const { data: isStakingCompleted } = useScaffoldReadContract({
    contractName: "NFTStaker",
    functionName: "completed",
    watch: true,
  });

  const handleStakeNFT = async () => {
    try {
      const tokenIdBigInt = BigInt(tokenId);
      await stakeNFT.writeContractAsync({
        functionName: "stakeNFT",
        args: [tokenIdBigInt],
      });
      console.log("NFT staked successfully");
    } catch (err) {
      console.error("Error staking NFT", err);
    }
  };

  const handleExecuteLevelUp = async () => {
    try {
      const tokenIdBigInt = BigInt(tokenId);
      await executeLevelUp.writeContractAsync({
        functionName: "executeLevelUp",
        args: [tokenIdBigInt],
      });
      console.log("Level up executed successfully");
    } catch (err) {
      console.error("Error executing level up", err);
    }
  };

  const handleWithdrawNFT = async () => {
    try {
      const tokenIdBigInt = BigInt(tokenId);
      await withdrawNFT.writeContractAsync({
        functionName: "withdrawNFT",
        args: [tokenIdBigInt],
      });
      console.log("NFT withdrawn successfully");
    } catch (err) {
      console.error("Error withdrawing NFT", err);
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow w-full px-4 gap-12">
      {isStakingCompleted && (
        <div className="flex flex-col items-center gap-2 bg-base-100 shadow-lg border-8 border-secondary rounded-xl p-6 mt-12 w-full max-w-lg">
          <p className="font-semibold">
            🎉 &nbsp; Staking App completed successfully &nbsp; 🎉
          </p>
        </div>
      )}
      <div
        className={`flex flex-col items-center space-y-8 bg-base-100 shadow-lg border-8 border-secondary rounded-xl p-6 w-full max-w-lg ${
          !isStakingCompleted ? "mt-24" : ""
        }`}
      >
        <div className="flex flex-col w-full items-center">
          <p className="text-2xl font-semibold">NFT Staker Contract</p>
          <Address address={address as `0x${string}`} size="xl" />
        </div>

        <div className="flex flex-col items-center w-full space-y-4">
          <input
            type="text"
            placeholder="Token ID"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className="input input-bordered w-full max-w-xs"
          />

          <button className="btn btn-primary" onClick={handleStakeNFT}>
            Stake NFT
          </button>

          <button className="btn btn-primary" onClick={handleExecuteLevelUp}>
            Execute Level Up
          </button>

          <button className="btn btn-primary" onClick={handleWithdrawNFT}>
            Withdraw NFT
          </button>
        </div>

        <div className="flex items-start justify-around w-full">
          <div className="flex flex-col items-center justify-center w-1/2">
            <p className="text-xl font-semibold">Time Left</p>
            <p>{deadline ? humanizeDuration(Number(deadline) * .0001) : "0"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
