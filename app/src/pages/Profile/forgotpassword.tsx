import axios from 'axios';
import { useState } from 'react';
import { YStack, Card, Text, Input, Button } from 'tamagui';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleForgotPassword = async () => {
    if (!email || !email.includes("@")) {
      setMessage('');
      setError('Please enter a valid email.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/forgot_password', {
        email
      });
      setError('');
      setMessage(response.data.message);
    } catch (error) {
      console.log(error);
      setError('There was an error, try again later.')
    }
  };

  return (
    <YStack alignItems="center" justifyContent="center" height="90vh">
      <Card
        bordered
        elevate
        padding="$6"
        width={600}
        height={400}
        backgroundColor="#F8EAF6"
        borderRadius="$6"
        elevation="$4"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="$7" color="#6A1B9A" fontWeight="bold" marginBottom="$4">
          Forgot Password
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
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
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
            onPress={handleForgotPassword}
          >
            Send Reset Link
          </Button>
        </YStack>
      </Card>
    </YStack>
  );
}
