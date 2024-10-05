import React from 'react';

type MarketListingProps = {
  nftId: string;
  sellerAddress: string;
  price: number;
  url: string;
};

const MarketListing: React.FC<MarketListingProps> = ({ nftId, sellerAddress, price, url }) => {
  return (
    <div className="border border-secondary rounded-lg p-4 bg-base-100 w-60 h-[380px] shadow-md flex flex-col justify-between">
      <div className="w-full h-40 relative mb-4">
        {/* Standard HTML img tag to replace the Next.js Image component */}
        <img
          src={url}
          alt={`NFT ${nftId}`}
          className="rounded-md w-full h-full object-cover"
          style={{ height: '100%', width: '100%' }}
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

export default MarketListing;
