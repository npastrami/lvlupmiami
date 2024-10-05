import React from 'react';
import { View, Text } from 'tamagui';
import TamaguiCarousel from './TamaguiCarousel'; // Import the carousel component

const HomePage: React.FC = () => {
  return (
    <View style={{ color: 'white', alignItems: 'center', textAlign: 'center', paddingBottom: '40px' }}>
      {/* Welcome Section */}
      <View padding="$4" alignItems="center">
        <Text fontSize="$6" color="white">
          Welcome to the Home Page!
        </Text>
        <Text color="white">
          This is your decentralized staking and marketplace platform.
        </Text>
      </View>

      {/* Fresh Off The Press Carousel Section */}
      <View padding="$4" alignItems="center" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
        <Text fontSize="$6" color="white" marginBottom="$2">
          Fresh Off The Press:
        </Text>
        <TamaguiCarousel imageRange={{ start: 1, end: 5 }} showPurchaseButton={true} />
      </View>

      {/* Upcoming Releases Carousel Section */}
      <View padding="$4" alignItems="center" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
        <Text fontSize="$6" color="white" marginBottom="$2">
          Upcoming Releases:
        </Text>
        <TamaguiCarousel imageRange={{ start: 6, end: 10 }} />
      </View>

      {/* About Us Section */}
      <View padding="$4" alignItems="center">
        <Text fontSize="$6" color="white">
          About Us
        </Text>
        <Text color="white">
         Level-Up connects People with Experiences. Through community collaboration and blockchain technology,
         we hope to add new utility for NFTs on the Ethereum blockchain. Users can mint new, or use the market place to acquire upgradeable NFT passes.
        </Text>
      </View>
    </View>
  );
};

export default HomePage;
