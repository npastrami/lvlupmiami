import React, { useState } from 'react';

const ReleaseSubmissionForm: React.FC = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    releaseTitle: '',
    releaseDate: '',
    description: '',
    attachment: null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, attachment: e.target.files?.[0] || null }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting:', formData);
    // Add your submission logic here (e.g., API call or blockchain transaction)
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields here */}
      <button type="submit">Submit</button>
    </form>
  );
};

export default ReleaseSubmissionForm;
