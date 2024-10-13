import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Text, Button, YStack, XStack, Card, Separator } from 'tamagui'; // Assuming you're using Tamagui components

interface KYCRequest {
  kyc_id: number;
  username: string;
  full_legal_name: string;
  address: string;
  country: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
}

const KYCReview: React.FC = () => {
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>([]);

  useEffect(() => {
    const fetchKYCRequests = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:3000/api/review_kyc', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setKycRequests(response.data || []);
      } catch (err) {
        console.error('Failed to fetch KYC requests', err);
      }
    };

    fetchKYCRequests();
  }, []);

  const handleApprove = async (kycId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('http://localhost:3000/api/approve_kyc', { kyc_id: kycId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setKycRequests(kycRequests.filter((req) => req.kyc_id !== kycId));
    } catch (err) {
      console.error('Failed to approve KYC request', err);
    }
  };

  const handleDecline = async (kycId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post('http://localhost:3000/api/decline_kyc', { kyc_id: kycId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setKycRequests(kycRequests.filter((req) => req.kyc_id !== kycId));
    } catch (err) {
      console.error('Failed to decline KYC request', err);
    }
  };

  return (
    <YStack alignItems="center" justifyContent="center" padding="$4">
      <Text fontSize="$7" color="#6A1B9A" fontWeight="bold" marginBottom="$4">
        Review KYC Requests
      </Text>

      <XStack
        flexWrap="wrap"
        justifyContent="center"
        gap="$4"
        width="100%"
        maxWidth="1200px"
      >
        {kycRequests.map((request) => (
          <Card
            key={request.kyc_id}
            borderRadius="$4"
            width="100%"
            maxWidth="400px"
            backgroundColor="#FFF"
            padding="$4"
            marginBottom="$4"
          >
            <YStack>
              <Text fontWeight="bold" color="#333" fontSize="$6" marginBottom="$2">
                {request.full_legal_name}
              </Text>
              <Text color="#666">Username: {request.username}</Text>
              <Text color="#666">Country: {request.country}</Text>
              <Text color="#666">Email: {request.email}</Text>
              <Text color="#666">Phone: {request.phone_number}</Text>
              <Text color="#666">Date of Birth: {request.date_of_birth}</Text>
              <Separator marginVertical="$2" />
              <XStack gap="$2">
                <Button onPress={() => handleApprove(request.kyc_id)}>Approve</Button>
                <Button onPress={() => handleDecline(request.kyc_id)}>Decline</Button>
              </XStack>
            </YStack>
          </Card>
        ))}
      </XStack>
    </YStack>
  );
};

export default KYCReview;
