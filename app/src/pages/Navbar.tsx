import React from 'react';
import { Link } from 'react-router-dom';
import { XStack } from 'tamagui';
import '../assets/fonts/fonts.css'; // Import the CSS file containing the font-face definitions

interface NavbarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, onLogout }) => {
  return (
    <div style={{ 
        backgroundColor: '#4a148c', // Deep purple for a modern look
        padding: '20px', // Increased padding to double the navbar size
        position: 'fixed', 
        width: '100%', 
        zIndex: 3 
      }}>
      <XStack space="$6" alignItems="center">
        {/* Left-Justified Navigation Links */}
        <XStack space="$6" alignItems="center">
          <Link 
            to="/" 
            style={{ 
              color: 'white', 
              textDecoration: 'none', 
              marginRight: '24px', // Increased spacing between items
              fontSize: '2rem', // Double the font size
              fontWeight: 'bold', // Make text bold for better readability
              fontFamily: 'Paladins Laser' // Ensure the correct font-family is applied
            }}>
            Level-Up
          </Link>
          <Link 
            to="/pages/Marketplace/marketHome" 
            style={{ 
              color: 'white', 
              textDecoration: 'none', 
              marginRight: '24px',
              fontSize: '1.25rem',
              // fontWeight: 'bold',
              fontFamily: 'Paladins' // Ensure the correct font-family is applied
            }}>
            Marketplace
          </Link>
          <Link 
            to="/pages/Staking/levelup" 
            style={{ 
              color: 'white', 
              textDecoration: 'none', 
              marginRight: '24px',
              fontSize: '1.25rem',
              // fontWeight: 'bold',
              fontFamily: 'Paladins' // Correct usage of font-family
            }}>
            Staking
          </Link>
        </XStack>

        {/* Right-Justified Authentication Links */}
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
                  // fontWeight: 'bold',
                  fontFamily: 'Paladins'
                }}>
                Login
              </Link>
              <Link 
                to="/pages/Profile/signUp" 
                style={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  fontSize: '1.5rem',
                  marginRight: '24px',
                  // fontWeight: 'bold',
                  fontFamily: 'Paladins' 
                }}>
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
                  // fontWeight: 'bold',
                  fontFamily: 'Paladins' 
                }}>
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
                  // fontWeight: 'bold',
                  fontFamily: 'Paladins' 
                }}>
                Logout
              </button>
            </>
          )}
        </div>
      </XStack>
    </div>
  );
};

export default Navbar;
