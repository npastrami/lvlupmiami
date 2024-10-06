import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { YStack, Input, Text, Button, Card } from 'tamagui';

const CreatorApplication: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract the username from state passed from the profile page
  const { username } = location.state as { username: string };

  const [creatorName, setCreatorName] = useState('');
  const [website, setWebsite] = useState('');
  const [socialMedia1, setSocialMedia1] = useState('');
  const [socialMedia2, setSocialMedia2] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!creatorName || !website || !reason) {
        setError('Please fill in all required fields.');
        return;
      }

      const response = await axios.post(
        'http://localhost:3000/api/creator_application',
        {
          username,
          creator_name: creatorName,
          website,
          social_media_1: socialMedia1,
          social_media_2: socialMedia2,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        setMessage('Application submitted successfully!');
        setError(null);
        setTimeout(() => {
          navigate('/pages/Profile/profile');
        }, 5000);
      }
    } catch (err) {
      setError('Failed to submit application. Please try again.');
    }
  };

  return (
    <YStack alignItems="center" justifyContent="center" height="90vh">
      <Card
        bordered
        elevate
        padding="$6"
        width={600}
        height={600}
        backgroundColor="#F8EAF6"
        borderRadius="$6"
        elevation="$4"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="$7" color="#6A1B9A" fontWeight="bold" marginBottom="$4">
          Creator Application
        </Text>
        {error && (
          <Text color="red" marginBottom="$4">
            {error}
          </Text>
        )}
        {message && (
          <Text color="green" marginBottom="$4">
            {message}
          </Text>
        )}
        <YStack space="$4" width="80%">
          <Input
            placeholder="Creator/Company Name (required)"
            value={creatorName}
            onChangeText={setCreatorName}
            borderColor="#6A1B9A"
            borderWidth={1}
            borderRadius="$3"
            padding="$3"
          />
          <Input
            placeholder="Website (required)"
            value={website}
            onChangeText={setWebsite}
            borderColor="#6A1B9A"
            borderWidth={1}
            borderRadius="$3"
            padding="$3"
          />
          <Input
            placeholder="Social Media 1 (optional)"
            value={socialMedia1}
            onChangeText={setSocialMedia1}
            borderColor="#6A1B9A"
            borderWidth={1}
            borderRadius="$3"
            padding="$3"
          />
          <Input
            placeholder="Social Media 2 (optional)"
            value={socialMedia2}
            onChangeText={setSocialMedia2}
            borderColor="#6A1B9A"
            borderWidth={1}
            borderRadius="$3"
            padding="$3"
          />
          <Input
            placeholder="Why do you want to release Level-Up NFTs? (required)"
            value={reason}
            onChangeText={setReason}
            multiline
            rows={4}
            borderColor="#6A1B9A"
            borderWidth={1}
            borderRadius="$3"
            padding="$3"
          />
          <Button
            size="$2"
            backgroundColor="#BA68C8"
            hoverStyle={{ backgroundColor: '#AB47BC' }}
            borderRadius="$4"
            onPress={handleSubmit}
          >
            Submit Application
          </Button>
        </YStack>
      </Card>
    </YStack>
  );
};

export default CreatorApplication;
