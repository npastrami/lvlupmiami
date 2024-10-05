import React from 'react';
import { Card, Button, Text, View, XStack, YStack } from 'tamagui';

const LevelUp: React.FC = () => {
  return (
    <View
      justifyContent="center"
      alignItems="center"
      style={{
        height: '100vh',
        // backgroundColor: '#F3E5F5', // Light purple background
        padding: '20px',
      }}
    >
      <Card
        size="$6"
        bordered
        elevate
        style={{
          width: '400px',
          padding: '30px',
          borderRadius: '20px',
          backgroundColor: '#F8EAF6', // Lighter purple shade for card background
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Header Section */}
        <YStack alignItems="center" marginBottom="$4">
          <Text fontWeight="bold" fontSize="$7" color="#6A1B9A">
            Staker Contract
          </Text>
          <XStack alignItems="center" space="$1">
            <img
              src="/src/assets/user-avatar.png" // Replace with your image path
              alt="Avatar"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
              }}
            />
            <Text color="#6A1B9A">0xc3e...3690</Text>
          </XStack>
        </YStack>

        {/* Info Section */}
        <XStack justifyContent="space-between" marginBottom="$4">
          <YStack alignItems="center">
            <Text color="#6A1B9A" fontSize="$5" fontWeight="bold">
              Time Left
            </Text>
            <Text color="#6A1B9A">19 seconds left</Text>
          </YStack>
          <YStack alignItems="center">
            <Text color="#6A1B9A" fontSize="$5" fontWeight="bold">
              You Staked
            </Text>
            <Text color="#6A1B9A">0.5 ETH</Text>
          </YStack>
        </XStack>

        {/* Total Staked Section */}
        <YStack alignItems="center" marginBottom="$4">
          <Text color="#6A1B9A" fontWeight="bold" fontSize="$6">
            Total Staked
          </Text>
          <Text color="#6A1B9A">2.5000 ETH / 1.0000 ETH</Text>
        </YStack>

        {/* Action Buttons Section */}
        <XStack justifyContent="space-between" space="$2" marginBottom="$4">
          <Button
            backgroundColor="#E1BEE7"
            borderRadius="$4"
            width="45%"
            hoverStyle={{ backgroundColor: '#BA68C8' }}
          >
            EXECUTE!
          </Button>
          <Button
            backgroundColor="#E1BEE7"
            borderRadius="$4"
            width="45%"
            hoverStyle={{ backgroundColor: '#BA68C8' }}
          >
            WITHDRAW
          </Button>
        </XStack>

        {/* Stake Button Section */}
        <Button
          backgroundColor="#CE93D8"
          borderRadius="$10"
          width="100%"
          paddingVertical="$3"
          hoverStyle={{ backgroundColor: '#AB47BC' }}
          // icon={<img src="/src/assets/stake-icon.png" alt="Stake Icon" style={{ width: '20px', marginRight: '8px' }} />}
        >
          🥩 STAKE 0.5 ETHER!
        </Button>
      </Card>
    </View>
  );
};

export default LevelUp;
