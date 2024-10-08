import React, { useState } from 'react';
import { TamaguiProvider } from 'tamagui';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import tamaguiConfig from './tamagui.config';
import './assets/fonts/fonts.css';
// Importing pages
import HomePage from './pages/Home/home';
import Login from './pages/Profile/login';
import SignUp from './pages/Profile/signUp';
import Profile from './pages/Profile/profile';
import MarketHome from './pages/Marketplace/marketHome';
import LevelUp from './pages/Staking/levelup';
import Logout from './pages/Profile/logout';
import Navbar from './pages/Navbar';  // Assuming Navbar is in a components folder
import CreatorApp from './pages/Profile/creatorapp';
import ReleaseForm from './pages/Profile/releaseform';

import { Stack } from 'tamagui';

// Import Particle Background
import ParticlesBackground from './ParticlesBackground';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('authToken'));

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    window.location.href = 'http://localhost:5173/pages/Profile/login';
  };

  return (
    <TamaguiProvider config={tamaguiConfig}>
      <Router>
        <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
          {/* Particle Background */}
          <ParticlesBackground />

          {/* Navbar */}
          <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />

          {/* Application Routes */}
          <Stack style={{ marginTop: '70px', padding: '20px', position: 'relative', zIndex: 2 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/pages/Profile/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
              <Route path="/pages/Profile/signUp" element={<SignUp />} />
              <Route path="/pages/Profile/profile" element={<Profile />} />
              <Route path="/profile/creator_application" element={<CreatorApp />} />
              <Route path="/release_request" element={<ReleaseForm />} />
              <Route path="/pages/Marketplace/marketHome" element={<MarketHome />} />
              <Route path="/pages/Staking/levelup" element={<LevelUp />} />
              <Route path="/pages/Profile/logout" element={<Logout />} />
            </Routes>
          </Stack>
        </div>
      </Router>
    </TamaguiProvider>
  );
};

export default App;
