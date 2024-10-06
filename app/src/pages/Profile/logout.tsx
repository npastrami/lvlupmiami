import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear the token and redirect to login
    localStorage.removeItem('authToken');
    navigate('/pages/Profile/login');
    window.location.href = 'http://localhost:5173/pages/Profile/login';
  }, [navigate]);

  return null;
};

export default Logout;
