import React, { useState } from 'react';
import axios from 'axios';
import { YStack, Input, Text, Button, Card } from 'tamagui';

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null); // New state for the message

  const handleSignup = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/signup', {
        username,
        password,
        email,
      });

      if (response.status === 201) {
        // Display the message instead of navigating directly
        setMessage('User was registered successfully! Please check your email to verify your account.');
        setError(null);

        // Wait for 10 seconds, then refresh the page
        setTimeout(() => {
          window.location.reload();
        }, 10000);
      }
    } catch (err) {
      setError('Failed to create account. Please try again.');
    }
  };

  return (
    <YStack
      alignItems="center"
      justifyContent="center"
      height="90vh" // Dark background for the whole page
    >
      <Card
        bordered
        elevate
        padding="$6"
        width={600}
        height={600}
        backgroundColor="#F8EAF6" // Light purple card background
        borderRadius="$6"
        elevation="$4" // Use elevation to create shadow instead of boxShadow
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="$7" color="#6A1B9A" fontWeight="bold" marginBottom="$4">
          Signup
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
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
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
            onPress={handleSignup}
          >
            Signup
          </Button>
        </YStack>
      </Card>
    </YStack>
  );
};

export default Signup;
