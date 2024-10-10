import React from 'react';
import { YStack, Text, Button, Image } from 'tamagui';

type MarketListingProps = {
  release_name: string;
  sellerAddress: string;
  price: number;
  url: string;
};

const MarketListing: React.FC<MarketListingProps> = ({ release_name, sellerAddress, price, url }) => {
  return (
    <YStack
      padding="$4"
      borderRadius="$6"
      elevation="$3"
      transition="transform 0.2s ease"
      hoverStyle={{
        transform: "scale(1.05)",
      }}
      space="$4"
      style={{
        width: 240,
        height: 360,
        borderWidth: 1,
        borderColor: "#ccc", // Add a border to simulate 'bordered'
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Add a subtle shadow
      }}
    >
      {/* Image Section */}
      <YStack height={150} borderRadius="$4" overflow="hidden">
        {url ? (
          <Image
            src={url}
            alt={`NFT ${release_name}`}
            width="100%"
            height="100%"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <Text fontSize="$4" color="#6A1B9A" textAlign="center" padding="$3">
            No Image Available
          </Text>
        )}
      </YStack>

      {/* Information Section */}
      <YStack space="$2">
        <Text fontSize="$5" fontWeight="bold" color="#6A1B9A">
          NFT ID: {release_name}
        </Text>
        <Text fontSize="$4" color="#9E9E9E">
          Seller: {sellerAddress}
        </Text>
        <Text fontSize="$4" color="#6A1B9A">
          Price: {price} ETH
        </Text>
      </YStack>

      {/* Buy Button */}
      <Button
        theme="purple"
        backgroundColor="#6A1B9A"
        borderRadius="$4"
        paddingHorizontal="$6"
        paddingVertical="$3"
        alignSelf="center"
        hoverStyle={{
          backgroundColor: "#8E24AA",
        }}
      >
        Buy Now
      </Button>
    </YStack>
  );
};

export default MarketListing;
