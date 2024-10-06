import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { YStack, Input, Text, Button, Card } from 'tamagui';

const Profile: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [accountType, setAccountType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:3000/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setUsername(response.data.username);
        setEmail(response.data.email);
        setAccountType(response.data.account_type); // Set accountType without checking if it is 'user'
      } catch (err) {
        setError('Failed to fetch profile. Please log in again.');
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!currentPassword) {
        setError('Please confirm your current password.');
        return;
      }

      const response = await axios.put(
        'http://localhost:3000/api/account/update',
        {
          username,
          current_password: currentPassword,
          new_email: email,
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setMessage('Profile updated successfully!');
        setError(null);
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
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
          Profile
        </Text>
        
        {/* Display account type if it is 'creator' or 'admin' */}
        {accountType && accountType !== 'user' && (
          <Text fontSize="$6" color="#AB47BC" marginBottom="$4">
            {accountType}
          </Text>
        )}
        
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
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            borderColor="#6A1B9A"
            borderWidth={1}
            borderRadius="$3"
            padding="$3"
          />
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            borderColor="#6A1B9A"
            borderWidth={1}
            borderRadius="$3"
            padding="$3"
          />
          <Input
            placeholder="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            borderColor="#6A1B9A"
            borderWidth={1}
            borderRadius="$3"
            padding="$3"
          />
          <Input
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
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
            onPress={handleUpdateProfile}
          >
            Update Profile
          </Button>
        </YStack>
      </Card>
    </YStack>
  );
};

export default Profile;
