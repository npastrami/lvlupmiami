import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { YStack, Input, Text, Button, Card } from 'tamagui';

// Declare global to extend window object with ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

const Profile: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [walletID, setWalletID] = useState<string | null>(null);
  const [currentWallet, setCurrentWallet] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [accountType, setAccountType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

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
        setAccountType(response.data.account_type);
        setWalletID(response.data.wallet_id || null);
        
        // If wallet_id exists in the response, set it as the current wallet
        if (response.data.wallet_id) {
          setCurrentWallet(response.data.wallet_id);
        }
      } catch (err) {
        setError('Failed to fetch profile. Please log in again.');
        setTimeout(() => setError(null), 5000);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!currentPassword) {
        setError('Please confirm your current password.');
        setTimeout(() => setError(null), 5000);
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
        setTimeout(() => setMessage(null), 5000);
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleConnectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        setError('MetaMask is not installed, please install MetaMask.');
        setTimeout(() => setError(null), 5000);
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        setError('No wallet accounts found.');
        setTimeout(() => setError(null), 5000);
        return;
      }

      const newWalletID = accounts[0];
      const token = localStorage.getItem('authToken');

      const response = await axios.put(
        'http://localhost:3000/api/account/update-wallet',
        { wallet_id: newWalletID },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setMessage('Wallet linked successfully!');
        setTimeout(() => setMessage(null), 5000);
        setWalletID(newWalletID);
        setCurrentWallet(newWalletID);
      }
    } catch (err) {
      setError('Failed to link wallet. Please try again.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleCreatorApplication = () => {
    navigate('/profile/creator_application', { state: { username } });
  };

  const handleRefreshWalletConnection = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        setError('MetaMask is not installed, please install MetaMask.');
        setTimeout(() => setError(null), 5000);
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        setError('No wallet accounts found.');
        setTimeout(() => setError(null), 5000);
        return;
      }

      const newWalletID = accounts[0];

      // If the wallet connected is different from the one saved in the database, update it
      if (newWalletID !== walletID) {
        const token = localStorage.getItem('authToken');

        const response = await axios.put(
          'http://localhost:3000/api/account/update-wallet',
          { wallet_id: newWalletID },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setMessage('Wallet connection refreshed successfully!');
          setTimeout(() => setMessage(null), 5000);
          setWalletID(newWalletID);
          setCurrentWallet(newWalletID);
        }
      } else {
        setMessage('Wallet is already up to date.');
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (err) {
      setError('Failed to refresh wallet connection. Please try again.');
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
        height={600}
        backgroundColor="#F8EAF6"
        borderRadius="$6"
        elevation="$4"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="$7" color="#6A1B9A" fontWeight="bold" marginBottom="$8">
          Profile
        </Text>

        {accountType === 'user' && (
          <Button
            size="$2"
            backgroundColor="#BA68C8"
            hoverStyle={{ backgroundColor: '#AB47BC' }}
            borderRadius="$4"
            marginBottom="$4"
            onPress={handleCreatorApplication}
          >
            Creator Application
          </Button>
        )}
        
        {/* Display account type if it is 'creator' or 'admin' */}
        {accountType && accountType !== 'user' && (
          <Text fontSize="$6" color="#AB47BC" marginBottom="$4">
            {accountType}
          </Text>
        )}

        {walletID && (
          <Text fontSize="$6" color="#6A1B9A" marginBottom="$4">
            Linked Wallet: {walletID}
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

        {walletID ? (
          <Button
            size="$2"
            backgroundColor="#BA68C8"
            hoverStyle={{ backgroundColor: '#AB47BC' }}
            borderRadius="$4"
            onPress={handleRefreshWalletConnection}
          >
            {currentWallet === walletID ? 'Change Wallet' : 'Refresh Wallet Connection'}
          </Button>
        ) : (
          <Button
            size="$2"
            backgroundColor="#BA68C8"
            hoverStyle={{ backgroundColor: '#AB47BC' }}
            borderRadius="$4"
            onPress={handleConnectWallet}
          >
            Connect MetaMask Wallet
          </Button>
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
