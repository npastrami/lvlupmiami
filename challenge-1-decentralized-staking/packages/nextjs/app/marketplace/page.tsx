"use client";

import React, { useEffect, useState } from "react";
import MarketListingCard from "./_components/MarketListingCard";
import CreateListingButton from "./_components/CreateListingButton"; // Assuming you have a CreateListingButton component

type MarketListing = {
  listing_id: number;
  nft_id: string;
  seller_address: string;
  price: number;
  listed_at: string;
  image_url: string;
};

const Marketplace: React.FC = () => {
  const [marketListings, setMarketListings] = useState<MarketListing[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchMarketListings = async () => {
      try {
        const response = await fetch("/api/marketplace");
        if (!response.ok) throw new Error("Failed to fetch listings");

        const data = await response.json();
        setMarketListings(data);
      } catch (error) {
        console.error("Error fetching market listings:", error);
      }
    };

    fetchMarketListings();
  }, []);

  // Filter listings by price if maxPrice is set
  const filteredListings = maxPrice
    ? marketListings.filter((listing) => listing.price <= maxPrice)
    : marketListings;

  return (
    <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center w-full max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center w-full px-6 lg:px-10">
        <h2 className="text-3xl font-bold">Marketplace Listings</h2>
        <CreateListingButton />
      </div>

      {/* Max Price Filter */}
      <div className="flex mb-4 items-center px-6 lg:px-10 w-full">
        <label htmlFor="priceFilter" className="mr-2 text-lg">
          Max Price (ETH):
        </label>
        <input
          type="number"
          id="priceFilter"
          className="input input-bordered"
          value={maxPrice ?? ""}
          onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : null)}
          placeholder="Enter max price"
        />
      </div>

      {/* Listings */}
      {filteredListings.length === 0 ? (
        <p className="text-2xl mt-14">No marketplace listings found!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 w-full max-w-7xl px-6 lg:px-10 overflow-y-scroll max-h-screen">
          {filteredListings.map((listing) => (
            <MarketListingCard
              key={listing.listing_id}
              nftId={listing.nft_id}
              sellerAddress={listing.seller_address}
              price={listing.price}
              url={listing.image_url}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
