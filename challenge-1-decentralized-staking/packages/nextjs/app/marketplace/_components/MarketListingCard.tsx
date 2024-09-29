import Image from "next/image";
import React from "react";

type MarketListingCardProps = {
  nftId: string;
  sellerAddress: string;
  price: number;
  url: string;
};

const MarketListingCard: React.FC<MarketListingCardProps> = ({ nftId, sellerAddress, price, url }) => {
  return (
    <div className="border border-secondary rounded-lg p-4 bg-base-100 w-60 h-[380px] shadow-md flex flex-col justify-between">
      <div className="w-full h-40 relative mb-4">
        <Image
          src={`/${url}`}
          alt={`NFT ${nftId}`}
          layout="fill"
          objectFit="cover"
          className="rounded-md"
        />
      </div>
      <div>
        <h3 className="text-lg font-bold mt-2">NFT ID: {nftId}</h3>
        <p className="text-sm text-gray-500 truncate">Seller: {sellerAddress}</p>
        <p className="text-sm">Price: {price} ETH</p>
      </div>
      <button className="btn btn-primary btn-sm mt-4 self-center">Buy Now</button>
    </div>
  );
};

export default MarketListingCard;
