import React, { useState } from 'react';
import { Button, YStack, XStack, Input, Text } from 'tamagui';

interface CreateNewListingProps {
  onAddListing: () => void;
}

const CreateNewListing: React.FC<CreateNewListingProps> = ({ onAddListing }) => {
  const [showCreateListingModal, setShowCreateListingModal] = useState(false);
  const [newListing, setNewListing] = useState({
    nftId: '',
    sellerAddress: '',
    price: '',
    image_url: '',
  });

  const handleCreateListing = async () => {
    try {
      const response = await fetch('/api/marketplace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nftId: newListing.nftId,
          sellerAddress: newListing.sellerAddress,
          price: parseFloat(newListing.price),
          image_url: newListing.image_url,
        }),
      });

      if (response.ok) {
        alert('Listing created successfully!');
        setShowCreateListingModal(false);
        setNewListing({ nftId: '', sellerAddress: '', price: '', image_url: '' }); // Reset form

        // Call onAddListing to refresh the marketplace listings in the parent component
        if (onAddListing) {
          onAddListing();
        }
      } else {
        alert('Failed to create listing.');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
    }
  };

  return (
    <div>
      {/* Create New Listing Button */}
      <Button
        theme="purple"
        size="$2"
        backgroundColor="#BA68C8"
        hoverStyle={{ backgroundColor: "#AB47BC" }}
        borderRadius="$6"
        onPress={() => setShowCreateListingModal(true)}
      >
        Create New Listing
      </Button>

      {/* Modal for Creating New Listing */}
      {showCreateListingModal && (
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          alignItems="center"
          justifyContent="center"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          zIndex={50}
        >
          <YStack
            width={400}
            backgroundColor="#F8EAF6"
            padding="$6"
            borderRadius="$6"
            elevation="$4"
            space="$4"
          >
            <Text fontSize="$6" fontWeight="bold" color="#6A1B9A">
              Create New Listing
            </Text>
            <Input
              placeholder="NFT ID"
              value={newListing.nftId}
              onChangeText={(text) => setNewListing({ ...newListing, nftId: text })}
              borderColor="#6A1B9A"
              marginBottom="$4"
            />
            <Input
              placeholder="Seller Address"
              value={newListing.sellerAddress}
              onChangeText={(text) => setNewListing({ ...newListing, sellerAddress: text })}
              borderColor="#6A1B9A"
              marginBottom="$4"
            />
            <Input
              placeholder="Price (ETH)"
              value={newListing.price}
              onChangeText={(text) => setNewListing({ ...newListing, price: text })}
              borderColor="#6A1B9A"
              marginBottom="$4"
            />
            <Input
              placeholder="File Path"
              value={newListing.image_url}
              onChangeText={(text) => setNewListing({ ...newListing, image_url: text })}
              borderColor="#6A1B9A"
              marginBottom="$4"
            />
            <XStack justifyContent="flex-end" space="$4">
              <Button
                theme="purple"
                backgroundColor="#BA68C8"
                hoverStyle={{ backgroundColor: "#AB47BC" }}
                borderRadius="$4"
                onPress={handleCreateListing}
              >
                Submit
              </Button>
              <Button
                theme="gray"
                borderRadius="$4"
                onPress={() => setShowCreateListingModal(false)}
              >
                Cancel
              </Button>
            </XStack>
          </YStack>
        </YStack>
      )}
    </div>
  );
};

export default CreateNewListing;
