import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { YStack, Input, Text, Button, Card } from 'tamagui';
import axios from 'axios';

let launchImageLibrary: any = null;

const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';

if (!isWeb) {
  launchImageLibrary = require('react-native-image-picker').launchImageLibrary;
}

const KYC: React.FC = () => {
  const [fullLegalName, setFullLegalName] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [documentFileName, setDocumentFileName] = useState<string | null>(null);
  const [faceImageFileName, setFaceImageFileName] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Function to handle file selection
  const handleFileSelection = (
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    setFileName: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (isWeb) {
      // Web file input
      const input = window.document.createElement('input');
      input.type = 'file';
      input.onchange = () => {
        if (input.files && input.files.length > 0) {
          const selectedFile = input.files[0];
          setter(selectedFile);
          setFileName(selectedFile.name);
        }
      };
      input.click();
    } else if (launchImageLibrary) {
      // Mobile image picker (React Native)
      const options = {
        mediaType: 'photo',
      };
      launchImageLibrary(options, (response: any) => {
        if (response.assets && response.assets.length > 0) {
          const selectedFile = response.assets[0] as unknown as File;
          setter(selectedFile);
          setFileName(selectedFile.name);
        }
      });
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('full_legal_name', fullLegalName);
    formData.append('address', address);
    formData.append('country', country);
    formData.append('email', email);
    formData.append('phone_number', phoneNumber);
    formData.append('date_of_birth', dateOfBirth);
    if (documentFile) formData.append('document', documentFile);
    if (faceImage) formData.append('face_image', faceImage);

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post('http://localhost:3000/api/account/kyc_verification', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setMessage('KYC verification request submitted successfully!');
        setTimeout(() => {
          setMessage(null);
          navigate('/profile');
        }, 5000);
      }
    } catch (err) {
      setMessage('Failed to submit KYC verification request. Please try again.');
      setTimeout(() => setMessage(null), 5000);
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
        <Text fontSize="$7" color="#6A1B9A" fontWeight="bold" marginBottom="$4">
          KYC Verification
        </Text>
        {message && (
          <Text color="green" marginBottom="$4">
            {message}
          </Text>
        )}
        <YStack space="$4" width="80%">
          <Input
            placeholder="Full Legal Name"
            value={fullLegalName}
            onChangeText={(text) => setFullLegalName(text)}
          />
          <Input placeholder="Address" value={address} onChangeText={(text) => setAddress(text)} />
          <Input placeholder="Country" value={country} onChangeText={(text) => setCountry(text)} />
          <Input placeholder="Email" value={email} onChangeText={(text) => setEmail(text)} />
          <Input
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={(text) => setPhoneNumber(text)}
          />
          <Input
            placeholder="Date of Birth"
            value={dateOfBirth}
            onChangeText={(text) => setDateOfBirth(text)}
          />

          <Button
            size="$2"
            backgroundColor="#BA68C8"
            hoverStyle={{ backgroundColor: '#AB47BC' }}
            borderRadius="$4"
            marginBottom="16px"
            onPress={() => handleFileSelection(setDocumentFile, setDocumentFileName)}
          >
            Upload Document
          </Button>
          {documentFileName && (
            <Text color="#6A1B9A" fontSize="$4" marginBottom="$2">
              Selected Document: {documentFileName}
            </Text>
          )}

          <Button
            size="$2"
            backgroundColor="#BA68C8"
            hoverStyle={{ backgroundColor: '#AB47BC' }}
            borderRadius="$4"
            marginBottom="16px"
            onPress={() => handleFileSelection(setFaceImage, setFaceImageFileName)}
          >
            Upload Face Image
          </Button>
          {faceImageFileName && (
            <Text color="#6A1B9A" fontSize="$4" marginBottom="$2">
              Selected Face Image: {faceImageFileName}
            </Text>
          )}

          <Button
            size="$2"
            backgroundColor="#BA68C8"
            hoverStyle={{ backgroundColor: '#AB47BC' }}
            borderRadius="$4"
            marginTop="16px"
            onPress={handleSubmit}
          >
            Submit KYC
          </Button>
        </YStack>
      </Card>
    </YStack>
  );
};

export default KYC;
