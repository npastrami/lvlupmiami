import React from 'react';
import { Link } from 'react-router-dom';
import { XStack } from 'tamagui';

interface NavbarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, onLogout }) => {
  return (
    <div style={{ backgroundColor: 'grey', padding: '10px', position: 'fixed', width: '100%', zIndex: 2 }}>
      <XStack space="$4" alignItems="center">
        {/* Left-Justified Navigation Links */}
        <XStack space="$4" alignItems="center">
          <Link to="/" style={{ color: 'white', textDecoration: 'none', marginRight: '16px' }}>
            Home
          </Link>
          <Link to="/pages/Marketplace/marketHome" style={{ color: 'white', textDecoration: 'none', marginRight: '16px' }}>
            Marketplace
          </Link>
          <Link to="/pages/Staking/levelup" style={{ color: 'white', textDecoration: 'none', marginRight: '16px' }}>
            Staking
          </Link>
        </XStack>

        {/* Right-Justified Authentication Links */}
        <div style={{ marginLeft: 'auto' }}>
          {!isAuthenticated ? (
            <>
              <Link to="/pages/Profile/login" style={{ color: 'white', textDecoration: 'none', marginRight: '16px' }}>
                Login
              </Link>
              <Link to="/pages/Profile/signUp" style={{ color: 'white', textDecoration: 'none' }}>
                Sign-Up
              </Link>
            </>
          ) : (
            <>
              <Link to="/pages/Profile/profile" style={{ color: 'white', textDecoration: 'none', marginRight: '16px' }}>
                Profile
              </Link>
              <button onClick={onLogout} style={{ color: 'white', background: 'transparent', border: 'none', cursor: 'pointer' }}>
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
