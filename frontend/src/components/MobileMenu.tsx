import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import UserAvatar from './UserAvatar';
import Button from './Button';

interface MobileMenuProps {
  isOpen: boolean;
  user?: User | null;
  onClose: () => void;
  onShowUserProfile: () => void;
  onLogout: () => void;
  isActive: (path: string) => boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  user,
  onClose,
  onShowUserProfile,
  onLogout,
  isActive
}) => {
  if (!isOpen) return null;

  const handleProfileClick = () => {
    onShowUserProfile();
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
        onClick={onClose}
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
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Menu</h3>
            <button
              onClick={onClose}
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
              <UserAvatar user={user} size="md" />
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
                onClick={handleProfileClick}
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
                onClick={onClose}
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
              onClick={handleLogout}
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
  );
};

export default MobileMenu;
