import axios from 'axios';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { YStack, Card, Text, Input, Button } from 'tamagui';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  // Extract the token from the URL
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromURL = params.get('token');
    if (tokenFromURL) {
      setToken(tokenFromURL);
    } else {
      setError('Invalid or missing token.');
    }
  }, [location.search]);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please enter both password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/reset_password', {
        token,
        new_password: newPassword,
      });
      setMessage(response.data.message);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Error resetting password. Please try again.');
    }
  };

  return (
    <YStack alignItems="center" justifyContent="center" height="90vh">
      <Card
        bordered
        elevate
        padding="$6"
        width={600}
        height={500}
        backgroundColor="#F8EAF6"
        borderRadius="$6"
        elevation="$4"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="$7" color="#6A1B9A" fontWeight="bold" marginBottom="$4">
          Reset Password
        </Text>

        {message && (
          <Text color="green" marginBottom="$4">
            {message}
          </Text>
        )}

        {error && (
          <Text color="red" marginBottom="$4">
            {error}
          </Text>
        )}

        <YStack space="$4" width="80%">
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
          <Input
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
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
            onPress={handleResetPassword}
          >
            Reset Password
          </Button>
        </YStack>
      </Card>
    </YStack>
  );
}