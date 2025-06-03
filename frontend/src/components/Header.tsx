import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import UserProfile from './UserProfile';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [showUserProfile, setShowUserProfile] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-150">
              <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-sm">HS</span>
              </div>
              <h1 className="text-xl font-bold text-black tracking-tight">
                HomeSplit
              </h1>
            </Link>
            
            {isAuthenticated && (
              <nav className="hidden md:flex space-x-1">
                <Link 
                  to="/dashboard" 
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                    isActive('/dashboard') 
                      ? 'bg-gray-100 text-black' 
                      : 'text-gray-600 hover:text-black hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </Link>
              </nav>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowUserProfile(true)}
                  className="hidden sm:flex items-center space-x-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors duration-150"
                >
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={user.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `<span class="text-white text-sm font-medium">${user?.username?.charAt(0).toUpperCase()}</span>`;
                        }}
                      />
                    ) : (
                      <span className="text-white text-sm font-medium">
                        {user?.username?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-700">
                    {user?.username}
                  </span>
                </button>
                <Button 
                  onClick={() => {
                    logout();
                    window.location.href = '/';
                  }} 
                  variant="secondary"
                >
                  Logout
                </Button>
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
      
      <UserProfile 
        isOpen={showUserProfile} 
        onClose={() => setShowUserProfile(false)} 
      />
    </header>
  );
};

export default Header;
