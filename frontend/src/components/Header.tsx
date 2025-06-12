import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHousehold } from '../context/HouseholdContext';
import Button from './Button';
import UserProfile from './UserProfile';
import UserAvatar from './UserAvatar';
import MobileMenu from './MobileMenu';
import NavLink from './NavLink';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { currentHousehold } = useHousehold();
  const location = useLocation();
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-150"
            >
              <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-sm">HS</span>
              </div>
              <h1 className="text-xl font-bold text-black tracking-tight">HomeSplit</h1>
            </Link>

            {isAuthenticated && (
              <nav className="hidden md:flex space-x-1">
                <NavLink to="/dashboard" isActive={isActive('/dashboard')}>
                  Dashboard
                </NavLink>
                {currentHousehold && (
                  <>
                    <svg 
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 -5 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M14.526 6.10576C15.0265 6.33917 15.2667 6.88343 15.0625 7.3214L9.88541 18.4237C9.68118 18.8616 9.10985 19.0275 8.60931 18.7941C8.10877 18.5607 7.86857 18.0164 8.0728 17.5784L13.2499 6.47616C13.4541 6.03819 14.0254 5.87235 14.526 6.10576Z"
                        fill="#616161"
                      />
                    </svg>
                    <span className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors duration-150">
                      {currentHousehold.name}
                    </span>
                  </>
                )}
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Desktop buttons */}
                <button
                  onClick={() => setShowUserProfile(true)}
                  className="hidden sm:flex items-center space-x-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors duration-150"
                >
                  <UserAvatar user={user} size="sm" />
                  <span className="text-sm text-gray-700">{user?.username}</span>
                </button>

                <Button onClick={handleLogout} variant="secondary" className="hidden sm:block">
                  Logout
                </Button>

                {/* Mobile menu button */}
                <div className="sm:hidden">
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="p-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-colors duration-150"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="secondary">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileMenu
        isOpen={showMobileMenu}
        user={user}
        onClose={() => setShowMobileMenu(false)}
        onShowUserProfile={() => setShowUserProfile(true)}
        onLogout={handleLogout}
        isActive={isActive}
      />

      <UserProfile isOpen={showUserProfile} onClose={() => setShowUserProfile(false)} />
    </header>
  );
};

export default Header;
