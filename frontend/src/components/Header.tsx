import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import UserProfile from './UserProfile';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
                {/* Desktop buttons */}
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
                  className="hidden sm:block"
                >
                  Logout
                </Button>

                {/* Mobile menu button */}
                <div className="sm:hidden">
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="p-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-colors duration-150"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
      
      {/* Mobile side panel */}
      {showMobileMenu && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
            onClick={() => setShowMobileMenu(false)}
            style={{
              animation: 'fadeInBackdrop 0.3s ease-out forwards'
            }}
          />
          
          {/* Side panel */}
          <div 
            className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 sm:hidden"
            style={{
              animation: 'slideInFromRight 0.3s ease-out forwards'
            }}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Menu</h3>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors duration-150"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* User info section */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
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
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user?.username}</div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                  </div>
                </div>
              </div>
              
              {/* Menu items */}
              <div className="flex-1 py-4">
                <nav className="space-y-2 px-4">
                  <button
                    onClick={() => {
                      setShowUserProfile(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 transition-colors duration-150"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profile</span>
                  </button>

                  <Link
                    to="/dashboard"
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                      isActive('/dashboard')
                        ? 'bg-gray-100 text-black'
                        : 'text-gray-600 hover:text-black hover:bg-gray-50'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V7a2 2 0 012-2h4a2 2 0 012 2v0" />
                    </svg>
                    <span>Dashboard</span>
                  </Link>
                </nav>
              </div>
              
              {/* Logout button at bottom */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    logout();
                    setShowMobileMenu(false);
                    window.location.href = '/';
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors duration-150"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      <UserProfile 
        isOpen={showUserProfile} 
        onClose={() => setShowUserProfile(false)} 
      />
    </header>
  );
};

export default Header;
