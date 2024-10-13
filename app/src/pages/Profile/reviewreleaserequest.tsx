import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { YStack, Card, Text, Button } from 'tamagui';

const ReviewReleaseRequest: React.FC = () => {
  const [releaseRequests, setReleaseRequests] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchReleaseRequests = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('No authentication token found. Please login again.');
          return;
        }

        const response = await axios.get('http://localhost:3000/api/review_release_requests', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setReleaseRequests(response.data || []);
        console.log(response.data);
      } catch (err) {
        console.error('Fetch Error:', err);
        setError('Failed to fetch release requests. Please try again.');
        setTimeout(() => setError(null), 5000);
      }
    };

    fetchReleaseRequests();
  }, []);

  const handleApprove = async (releaseId: number, releaseTitle: string) => {
    if (window.confirm('Are you sure you want to approve this release request?')) {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('No authentication token found. Please login again.');
          return;
        }

        await axios.post(`http://localhost:3000/api/approve_release`, { release_id: releaseId }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Remove the approved request from the state
        setReleaseRequests(releaseRequests.filter(request => request.ReleaseID !== releaseId));
        
        // Set success message
        setSuccessMessage(`${releaseTitle} sent to queued mints`);
        setTimeout(() => setSuccessMessage(null), 5000); // Remove the message after 5 seconds
      } catch (err) {
        console.error('Approval Error:', err);
        setError('Failed to approve the release request. Please try again.');
        setTimeout(() => setError(null), 5000);
      }
    }
  };

  return (
    <YStack alignItems="center" justifyContent="center" height="100vh" padding="$6">
      <Card
        bordered
        elevate
        padding="$6"
        width={900}
        backgroundColor="#F8EAF6"
        borderRadius="$6"
        elevation="$4"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="$7" color="#6A1B9A" fontWeight="bold" marginBottom="$4">
          Review Release Requests
        </Text>
        {error && (
          <Text color="red" marginBottom="$4">
            {error}
          </Text>
        )}
        {successMessage && (
          <Text color="green" marginBottom="$4">
            {successMessage}
          </Text>
        )}
        <YStack
          space="$4"
          width="100%"
          maxHeight="60vh" // Limit height for scrolling
          overflow="scroll" // Add scrolling if content exceeds max height
          padding="$2"
        >
          {releaseRequests.length > 0 ? (
            releaseRequests.map((request, index) => (
              <Card
                key={index}
                bordered
                padding="$4"
                backgroundColor="#ffffff"
                borderRadius="$4"
                elevation="$3"
                marginBottom="$4"
                alignItems="center"
              >
                <Text fontSize="$5" color="#6A1B9A" fontWeight="bold">
                  {request.ReleaseTitle ? request.ReleaseTitle : "Untitled Release"}
                </Text>
                <Text color="#444" marginBottom="$2">
                  Username: {request.Username ? request.Username : "N/A"}
                </Text>
                <Text color="#444" marginBottom="$2">
                  Release Date: {request.ReleaseDate ? new Date(request.ReleaseDate).toLocaleDateString() : "Invalid Date"}
                </Text>
                <Text color="#444" marginBottom="$2">
                  Estimated Count: {request.EstimatedCount ? request.EstimatedCount : "N/A"}
                </Text>
                <Text color="#444" marginBottom="$2">
                  Notes: {request.Notes ? request.Notes : "No Notes Provided"}
                </Text>
                <Button
                  size="$2"
                  backgroundColor="#4CAF50"
                  hoverStyle={{ backgroundColor: '#388E3C' }}
                  borderRadius="$4"
                  onPress={() => handleApprove(request.ReleaseID, request.ReleaseTitle)}
                >
                  Approve
                </Button>
              </Card>
            ))
          ) : (
            <Text>No release requests available</Text>
          )}
        </YStack>
      </Card>
    </YStack>
  );
};

export default ReviewReleaseRequest;
