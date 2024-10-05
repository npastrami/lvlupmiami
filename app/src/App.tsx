import React, { useState } from 'react';
import { TamaguiProvider } from 'tamagui';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import tamaguiConfig from './tamagui.config';

// Importing pages
import HomePage from './pages/Home/home';
import Login from './pages/Profile/login';
import SignUp from './pages/Profile/signUp';
import Profile from './pages/Profile/profile';
import MarketHome from './pages/Marketplace/marketHome';
import LevelUp from './pages/Staking/levelup';

// Import Tamagui components for consistency with Navbar
import { Stack, XStack, Button } from 'tamagui';

// Import Particle Background
import ParticlesBackground from './ParticlesBackground';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogout = () => {
    setIsAuthenticated(false);
    window.location.href = '/pages/Profile/login';
  };

  return (
    <TamaguiProvider config={tamaguiConfig}>
      <Router>
        <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
          {/* Particle Background */}
          <ParticlesBackground />

          {/* Navbar stays persistent and fixed at the top */}
          <XStack
            backgroundColor="#333"
            padding="$3"
            height={60}
            justifyContent="space-between"
            alignItems="center"
            position="absolute"
            top={0}
            left={0}
            right={0}
            zIndex={2}
            style={{ width: '100%' }}
          >
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Button
                backgroundColor="$lightBlue"
                hoverStyle={{ backgroundColor: '$blue' }}
                color="$color"
                borderRadius="$2"
                fontWeight="bold"
              >
                Home
              </Button>
            </Link>
            <XStack space="$3">
              <Link to="/pages/Marketplace/marketHome" style={{ textDecoration: 'none' }}>
                <Button
                  backgroundColor="$lightBlue"
                  hoverStyle={{ backgroundColor: '$blue' }}
                  color="$color"
                  borderRadius="$2"
                >
                  Marketplace
                </Button>
              </Link>
              <Link to="/pages/Staking/levelup" style={{ textDecoration: 'none' }}>
                <Button
                  backgroundColor="$lightBlue"
                  hoverStyle={{ backgroundColor: '$blue' }}
                  color="$color"
                  borderRadius="$2"
                >
                  Staking
                </Button>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/pages/Profile/profile" style={{ textDecoration: 'none' }}>
                    <Button
                      backgroundColor="$lightBlue"
                      hoverStyle={{ backgroundColor: '$blue' }}
                      color="$color"
                      borderRadius="$2"
                    >
                      Profile
                    </Button>
                  </Link>
                  <Button
                    backgroundColor="$lightBlue"
                    hoverStyle={{ backgroundColor: '$blue' }}
                    color="$color"
                    borderRadius="$2"
                    onPress={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/pages/Profile/login" style={{ textDecoration: 'none' }}>
                    <Button
                      backgroundColor="$lightBlue"
                      hoverStyle={{ backgroundColor: '$blue' }}
                      color="$color"
                      borderRadius="$2"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/pages/Profile/signUp" style={{ textDecoration: 'none' }}>
                    <Button
                      backgroundColor="$lightBlue"
                      hoverStyle={{ backgroundColor: '$blue' }}
                      color="$color"
                      borderRadius="$2"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </XStack>
          </XStack>

          {/* Application Routes */}
          <Stack style={{ marginTop: '70px', padding: '20px', position: 'relative', zIndex: 2 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/pages/Profile/login" element={<Login />} />
              <Route path="/pages/Profile/signUp" element={<SignUp />} />
              <Route path="/pages/Profile/profile" element={<Profile />} />
              <Route path="/pages/Marketplace/marketHome" element={<MarketHome />} />
              <Route path="/pages/Staking/levelup" element={<LevelUp />} />
            </Routes>
          </Stack>
        </div>
      </Router>
    </TamaguiProvider>
  );
};

export default App;