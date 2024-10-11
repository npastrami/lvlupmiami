import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { XStack, YStack, Text, Popover, Button } from 'tamagui';
import '../assets/fonts/fonts.css';
import levelUpLogo from '../assets/leveluplogo1.png';

interface NavbarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, onLogout }) => {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      style={{
        backgroundColor: '#4a148c',
        padding: '20px',
        position: 'fixed',
        width: '100%',
        zIndex: 3,
      }}
    >
      <XStack space="$6" alignItems="center" justifyContent="space-between">
        <XStack alignItems="center">
          {/* Logo Section */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              marginRight: '24px',
            }}
          >
            <img
              src={levelUpLogo}
              alt="Level-Up Logo"
              width={32}
              height={32}
              style={{ marginRight: '8px' }}
            />
            <Text
              style={{
                color: 'white',
                fontSize: isMobile ? '1.5rem' : '2rem',
                fontWeight: 'bold',
                fontFamily: 'Paladins Laser',
              }}
            >
              Level-Up
            </Text>
          </Link>

          {!isMobile && (
            <>
              {/* Left-Justified Navigation Links for Desktop */}
              <Link
                to="/pages/Marketplace/marketHome"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  marginRight: '24px',
                  fontSize: '1.25rem',
                  fontFamily: 'Paladins',
                }}
              >
                Marketplace
              </Link>
              <Link
                to="/pages/Staking/levelup"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  marginRight: '24px',
                  fontSize: '1.25rem',
                  fontFamily: 'Paladins',
                }}
              >
                Inventory
              </Link>
            </>
          )}
        </XStack>

        {/* Right-Justified Authentication Links */}
        {isMobile ? (
          // Mobile View: Accordion Menu Button
          <Popover open={menuOpen} onOpenChange={() => setMenuOpen(!menuOpen)}>
            <Popover.Trigger>
              <Button
                size="$2"
                theme="purple"
                backgroundColor="#6A1B9A"
                marginRight="40px"
                hoverStyle={{ backgroundColor: '#8E24AA' }}
              >
                ☰
              </Button>
            </Popover.Trigger>
            <Popover.Content
              style={{
                backgroundColor: '#4a148c',
                borderRadius: '8px',
                padding: '10px',
              }}
            >
              <YStack space="$3">
                <Link
                  to="/pages/Marketplace/marketHome"
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    fontFamily: 'Paladins',
                    fontSize: '16px',
                    padding: '8px',
                    display: 'block',
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  Marketplace
                </Link>
                <Link
                  to="/pages/Staking/levelup"
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    fontFamily: 'Paladins',
                    fontSize: '16px',
                    padding: '8px',
                    display: 'block',
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  Inventory
                </Link>
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/pages/Profile/login"
                      style={{
                        color: 'white',
                        textDecoration: 'none',
                        fontFamily: 'Paladins',
                        padding: '8px',
                        fontSize: '16px',
                        marginBottom: '8px',
                        display: 'block',
                      }}
                      onClick={() => setMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/pages/Profile/signUp"
                      style={{
                        color: 'white',
                        textDecoration: 'none',
                        fontFamily: 'Paladins',
                        padding: '8px',
                        fontSize: '16px',
                        marginBottom: '4px',
                        display: 'block',
                      }}
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign-Up
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/pages/Profile/profile"
                      style={{
                        color: 'white',
                        textDecoration: 'none',
                        fontFamily: 'Paladins',
                        padding: '8px',
                        fontSize: '16px',
                        display: 'block',
                      }}
                      onClick={() => setMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Button
                      size="$2"
                      backgroundColor="transparent"
                      color="white"
                      hoverStyle={{ backgroundColor: '#6A1B9A' }}
                      borderRadius="$4"
                      padding="8px"
                      onPress={() => {
                        onLogout();
                        setMenuOpen(false);
                      }}
                      style={{
                        fontFamily: 'Paladins',
                        textAlign: 'left',
                      }}
                    >
                      Logout
                    </Button>
                  </>
                )}
              </YStack>
            </Popover.Content>
          </Popover>
        ) : (
          // Desktop View: Standard Links
          <div style={{ marginLeft: 'auto' }}>
            {!isAuthenticated ? (
              <>
                <Link
                  to="/pages/Profile/login"
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    marginRight: '24px',
                    fontSize: '1.5rem',
                    fontFamily: 'Paladins',
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/pages/Profile/signUp"
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '1.5rem',
                    marginRight: '24px',
                    fontFamily: 'Paladins',
                  }}
                >
                  Sign-Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/pages/Profile/profile"
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    marginRight: '24px',
                    fontSize: '1.5rem',
                    fontFamily: 'Paladins',
                  }}
                >
                  Profile
                </Link>
                <button
                  onClick={onLogout}
                  style={{
                    color: 'white',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    marginRight: '24px',
                    fontSize: '1.5rem',
                    fontFamily: 'Paladins',
                  }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </XStack>
    </div>
  );
};

export default Navbar;
