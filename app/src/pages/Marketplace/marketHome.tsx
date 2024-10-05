"use client";

import React, { useEffect, useState } from "react";
import MarketListing from "./MarketListing";
import CreateNewListing from "./createNewListing"; // Assuming you have a CreateNewListing component

type MarketListingType = {
  listing_id: number;
  nft_id: string;
  seller_address: string;
  price: number;
  listed_at: string;
  image_url: string;
};

const MarketHome: React.FC = () => {
  const [marketListings, setMarketListings] = useState<MarketListingType[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

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

  useEffect(() => {
    fetchMarketListings();
  }, []);

  // Filter listings by price if maxPrice is set
  const filteredListings = maxPrice
    ? marketListings.filter((listing) => listing.price <= maxPrice)
    : marketListings;

  return (
    <div
      className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center w-full max-w-7xl mx-auto"
      style={{
        padding: "20px",
        borderRadius: "20px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      }}
    >
      {/* Header Section */}
      <div
        className="flex flex-col items-center"
        style={{
          backgroundColor: "#F8EAF6",
          padding: "20px",
          borderRadius: "15px",
          marginBottom: "20px",
          maxWidth: "500px", // Reduced width for header card
          textAlign: "center",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h2
          className="text-3xl font-bold"
          style={{ color: "#6A1B9A" }}
        >
          Marketplace Listings
        </h2>
        <CreateNewListing onAddListing={fetchMarketListings} />
      </div>

      {/* Max Price Filter */}
      <div
        className="flex mb-4 items-center"
        style={{
          backgroundColor: "#E1BEE7",
          padding: "15px",
          borderRadius: "10px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          maxWidth: "500px", // Reduced width for filter card
          width: "100%", // Makes sure the input stays within bounds
        }}
      >
        <label htmlFor="priceFilter" className="mr-2 text-lg" style={{ color: "#6A1B9A" }}>
          Max Price (ETH):
        </label>
        <input
          type="number"
          id="priceFilter"
          className="input input-bordered p-2 rounded-md"
          style={{
            border: "1px solid #6A1B9A",
            color: "#6A1B9A",
            backgroundColor: "#F8EAF6",
            padding: "10px",
            borderRadius: "5px",
          }}
          value={maxPrice ?? ""}
          onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : null)}
          placeholder="Enter max price"
        />
      </div>

      {/* Listings */}
      {filteredListings.length === 0 ? (
        <p className="text-2xl mt-14" style={{ color: "#6A1B9A" }}>
          No marketplace listings found!
        </p>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 w-full max-w-7xl px-6 lg:px-10"
          style={{
            overflowY: "scroll",
            maxHeight: "75vh",
            backgroundColor: "#F8EAF6",
            padding: "15px",
            borderRadius: "15px",
          }}
        >
          {filteredListings.map((listing) => (
            <MarketListing
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

export default MarketHome;
