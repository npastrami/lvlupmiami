"use client";

import React, { useEffect, useState } from "react";
import MarketListing from "./MarketListing";
import CreateNewListing from "./createNewListing";
import TamaguiCarousel from "../Home/TamaguiCarousel";
import { YStack, XStack, Card, Input, Text, Button, Slider } from "tamagui";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type MarketListingType = {
  listing_id: number;
  release_name: string;
  seller_address: string;
  price: number;
  listed_at: string;
  image_url: string;
};

const MarketHome: React.FC = () => {
  const [marketListings, setMarketListings] = useState<MarketListingType[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>(""); // Filter for "creator", "owner", "release"
  const [releaseDate, setReleaseDate] = useState<Date | null>(null);
  const [releaseFilterType, setReleaseFilterType] = useState<string>("");

  const fetchMarketListings = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/marketplace/listings");
      if (!response.ok) throw new Error("Failed to fetch listings");

      const data = await response.json();
      console.log(data)
      setMarketListings(data);
    } catch (error) {
      console.error("Error fetching market listings:", error);
    }
  };

  useEffect(() => {
    fetchMarketListings();
  }, []);

  // Filter listings by search term, price, creator, and owner options
  const filteredListings = marketListings.filter((listing) => {
    const meetsPriceCriteria =
      listing.price >= minPrice && listing.price <= maxPrice;
    const meetsSearchCriteria =
      searchTerm === "" ||
      listing.release_name.toLowerCase().includes(searchTerm.toLowerCase());
    const meetsTypeCriteria =
      filterType === "" ||
      (filterType === "creator" && listing.seller_address.includes("creator")) ||
      (filterType === "owner" && listing.seller_address.includes("owner")) ||
      (filterType === "release" && listing.release_name.includes(searchTerm));
    const meetsDateCriteria =
      !releaseDate ||
      (releaseFilterType === "before" &&
        new Date(listing.listed_at) < releaseDate) ||
      (releaseFilterType === "after" &&
        new Date(listing.listed_at) > releaseDate) ||
      (releaseFilterType === "on" &&
        new Date(listing.listed_at).toDateString() ===
          releaseDate.toDateString());

    return (
      meetsPriceCriteria &&
      meetsSearchCriteria &&
      meetsTypeCriteria &&
      meetsDateCriteria
    );
  });

  return (
    <XStack className="w-full max-w-7xl mx-auto" style={{ padding: 20, gap: 20 }}>
      {/* Left Column - Filters Section */}
      <YStack
        className="w-1/4"
        style={{
          padding: 20,
          borderRadius: 15,
          backgroundColor: "#f0f0f0",
          maxHeight: "80vh",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        {/* Create New Listing Button */}
        <CreateNewListing onAddListing={fetchMarketListings} />

        {/* Filters */}
        <Text fontSize="$5" fontWeight="bold" marginBottom="$4" style={{ color: "#6A1B9A" }}>
          Filter Listings
        </Text>

        {/* Search Bar */}
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChangeText={(text) => setSearchTerm(text)}
          style={{
            borderWidth: 1,
            borderColor: "#6A1B9A",
            color: "#6A1B9A",
            backgroundColor: "#E1BEE7",
            padding: 10,
            borderRadius: 8,
            marginBottom: 16,
          }}
        />

        {/* Toggle Filters */}
        <Text fontSize="$4" marginBottom="$2" style={{ color: "#6A1B9A" }}>
          Toggle Filters:
        </Text>
        <YStack space="$2" marginBottom="$4">
          {["creator", "owner", "release"].map((type) => (
            <Button
              key={type}
              size="$2"
              theme="purple"
              borderWidth={1}
              borderColor={filterType === type ? "#6A1B9A" : "#ccc"}
              backgroundColor={filterType === type ? "#E1BEE7" : "#f0f0f0"}
              onPress={() => setFilterType(filterType === type ? "" : type)}
              hoverStyle={{ backgroundColor: "#D1C4E9" }}
              textAlign="left"
            >
              {`Only ${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </Button>
          ))}
        </YStack>

        {/* Price Range Slider */}
        <Text fontSize="$4" marginBottom="$2" style={{ color: "#6A1B9A" }}>
          Price Range (ETH):
        </Text>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[minPrice, maxPrice]}
          onValueChange={(value: number[]) => {
            setMinPrice(value[0]);
            setMaxPrice(value[1]);
          }}
          style={{ marginBottom: 16 }}
        >
          <Slider.Track backgroundColor="#D1C4E9" height={8}>
            <Slider.TrackActive backgroundColor="#6A1B9A" />
          </Slider.Track>
          <Slider.Thumb index={0} backgroundColor="#6A1B9A" />
          <Slider.Thumb index={1} backgroundColor="#6A1B9A" />
        </Slider>
        <Text>
          Min Price: {minPrice} ETH - Max Price: {maxPrice} ETH
        </Text>

        {/* Release Date Filter */}
        <Text fontSize="$4" marginBottom="$2" style={{ color: "#6A1B9A" }}>
          Release Date:
        </Text>
        <DatePicker
          selected={releaseDate}
          onChange={(date: Date | null) => setReleaseDate(date)}
          dateFormat="yyyy-MM-dd"
          className="react-datepicker"
          style={{
            borderWidth: 1,
            borderColor: "#6A1B9A",
            backgroundColor: "#E1BEE7",
            padding: 10,
            borderRadius: 8,
            color: "#6A1B9A",
          }}
        />
        <YStack space="$2" marginTop="$4">
          {["before", "after", "on"].map((type) => (
            <Button
              key={type}
              size="$2"
              theme="purple"
              borderWidth={1}
              borderColor={releaseFilterType === type ? "#6A1B9A" : "#ccc"}
              backgroundColor={releaseFilterType === type ? "#E1BEE7" : "#f0f0f0"}
              onPress={() =>
                setReleaseFilterType(releaseFilterType === type ? "" : type)
              }
              hoverStyle={{ backgroundColor: "#D1C4E9" }}
              textAlign="left"
            >
              {`Release Date ${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </Button>
          ))}
        </YStack>
      </YStack>

      {/* Main Content Section */}
      <YStack className="w-3/4" space="$8">
        {/* Fresh Mints Carousel */}
        <Card
          bordered
          padding="$4"
          backgroundColor="#EDE7F6"
          borderRadius="$8"
          elevation="$4"
          marginBottom="$6"
          maxWidth={140}
        >
          <Text fontSize="$6" fontWeight="bold" color="#6A1B9A" marginBottom="$2">
            Fresh Mints
          </Text>
          </Card>
          <TamaguiCarousel imageRange={{ start: 1, end: 5 }} showPurchaseButton={true} />

        {/* Creators Profile Cards Carousel */}
        <Card
          bordered
          padding="$4"
          backgroundColor="#EDE7F6"
          borderRadius="$8"
          elevation="$4"
          maxWidth={115}
        >
          <Text fontSize="$6" fontWeight="bold" color="#6A1B9A" marginBottom="$2">
            Creators
          </Text>
          </Card>
          <TamaguiCarousel imageRange={{ start: 6, end: 10 }} />
        

        {/* Marketplace Listings */}
        <Card
          bordered
          padding="$4"
          borderRadius="$8"
          elevation="$4"
          maxWidth={220}
        >
          <Text fontSize="$6" fontWeight="bold" color="#6A1B9A" marginBottom="$2">
            Marketplace Listings
          </Text>
          </Card>
          <XStack
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            style={{
              overflowY: "scroll",
              maxHeight: "90vh",
              padding: 15,
              borderRadius: 15,
            }}
          >
            {filteredListings.length === 0 ? (
              <Text color="#6A1B9A">No listings found!</Text>
            ) : (
              filteredListings.map((listing) => (
                // <Card
                //   key={listing.listing_id}
                //   padding="$4"
                //   bordered
                //   borderRadius="$6"
                //   elevation="$3"
                //   style={{
                //     color: "#333",
                //     transition: "transform 0.2s",
                //   }}
                //   hoverStyle={{
                //     transform: "scale(1.05)",
                //   }}
                // >
                  <MarketListing
                    release_name={listing.release_name}
                    sellerAddress={listing.seller_address}
                    price={listing.price}
                    url={listing.image_url}
                  />
                
              ))
            )}
          </XStack>
      </YStack>
    </XStack>
  );
};

export default MarketHome;
