import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { YStack, Input, Text, Button, Card } from 'tamagui';

interface LoginProps {
  setIsAuthenticated: (auth: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/login', {
        username,
        password,
      });

      if (response.status === 200) {
        // Store the token in local storage
        localStorage.setItem('authToken', response.data.token);
        setIsAuthenticated(true);
        navigate('/');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 403) {
          setError('Please verify your email before logging in.');
        } else if (err.response.status === 401) {
          setError('Invalid username or password.');
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }

      // Set a timeout to remove the error message after 10 seconds
      setTimeout(() => {
        setError(null);
      }, 10000);
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
          Login
        </Text>
        {error && (
          <Text color="red" marginBottom="$4">
            {error}
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
            onPress={handleLogin}
          >
            Login
          </Button>
        </YStack>
      </Card>
    </YStack>
  );
};

export default Login;
