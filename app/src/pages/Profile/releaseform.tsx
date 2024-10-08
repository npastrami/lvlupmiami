import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { YStack, Input, Button, Card, Text } from 'tamagui';

const ReleaseForm: React.FC = () => {
  const location = useLocation();
  const { username } = location.state || {}; // Get username from the navigation state
  const [releaseTitle, setReleaseTitle] = useState('');
  const [releaseDate, setReleaseDate] = useState<string>('');
  const [estimatedCount, setEstimatedCount] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [releaseNotes, setReleaseNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (!username) {
        setError('Username is missing. Please log in again.');
        return;
      }

      // Build the query parameters from the form values
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('release_title', releaseTitle);
      if (releaseDate) params.append('release_date', releaseDate);
      params.append('estimated_count', estimatedCount);
      params.append('release_notes', releaseNotes);

      // Handle file separately using FormData
      const formData = new FormData();
      if (media) {
        formData.append('media', media);
      }

      const response = await axios.post(`http://localhost:3000/api/release_request?${params.toString()}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setMessage('Release request submitted successfully!\n\tBe on the lookout for an email!');
        setTimeout(() => {
          setMessage(null);
          navigate('/pages/Profile/profile');
        }, 5000);
      }
    } catch (err) {
      setError('Failed to submit release request. Please try again.');
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <YStack alignItems="center" justifyContent="center" height="90vh">
      <Card
        bordered
        elevate
        padding="$6"
        width={600}
        backgroundColor="#F8EAF6"
        borderRadius="$6"
        elevation="$4"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="$7" color="#6A1B9A" fontWeight="bold" marginBottom="$8">
          Release Form
        </Text>

        {error && <Text color="red" marginBottom="$4">{error}</Text>}
        {message && <Text color="green" marginBottom="$4">{message}</Text>}

        <YStack space="$4" width="80%">
          <Input
            placeholder="Release Title"
            value={releaseTitle}
            onChangeText={setReleaseTitle}
            borderColor="#6A1B9A"
            borderWidth={1}
            borderRadius="$3"
            padding="$3"
          />
          <input
            type="date"
            value={releaseDate}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setReleaseDate(event.target.value)}
            style={{
              width: '94%',
              padding: '12px',
              borderColor: '#6A1B9A',
              borderWidth: '1px',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          />
          <Input
            placeholder="Estimated Count"
            value={estimatedCount}
            onChangeText={setEstimatedCount}
            borderColor="#6A1B9A"
            borderWidth={1}
            borderRadius="$3"
            padding="$3"
          />
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/gif"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setMedia(event.target.files?.[0] || null)}
            style={{
              width: '100%',
              padding: '12px',
              borderColor: '#6A1B9A',
              borderWidth: '1px',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          />
          <Input
            placeholder="Release Notes"
            value={releaseNotes}
            onChangeText={setReleaseNotes}
            multiline
            borderColor="#6A1B9A"
            borderWidth={1}
            borderRadius="$3"
            padding="$3"
            minHeight="$4"
          />
          <Button
            size="$2"
            backgroundColor="#BA68C8"
            hoverStyle={{ backgroundColor: '#AB47BC' }}
            borderRadius="$4"
            onPress={handleSubmit}
          >
            Submit Release Request
          </Button>
        </YStack>
      </Card>
    </YStack>
  );
};

export default ReleaseForm;
