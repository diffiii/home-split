import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { userAPI } from '../services/api';

interface UserAvatarProps {
  user?: User | null;
  userId?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, userId, size = 'md', className = '' }) => {
  const [fetchedUser, setFetchedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user && userId) {
      const fetchUser = async () => {
        setIsLoading(true);
        try {
          const userData = await userAPI.getUser(userId);
          setFetchedUser(userData);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          setFetchedUser(null);
        } finally {
          setIsLoading(false);
        }
      };

      fetchUser();
    }
  }, [user, userId]);

  const currentUser = user || fetchedUser;

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 sm:w-20 sm:h-20 text-xl sm:text-2xl'
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
    const parent = e.currentTarget.parentElement;
    if (parent && currentUser?.username) {
      parent.innerHTML = `<span class="text-white font-medium">${currentUser.username.charAt(0).toUpperCase()}</span>`;
    }
  };

  if (!user && userId && isLoading) {
    return (
      <div className={`bg-gray-300 rounded-full flex items-center justify-center animate-pulse ${sizeClasses[size]} ${className}`}>
        <div className="w-full h-full bg-gray-400 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-full flex items-center justify-center overflow-hidden ${sizeClasses[size]} ${className}`}>
      {currentUser?.profile_picture ? (
        <img
          src={currentUser.profile_picture}
          alt={currentUser.username}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <span className="text-white font-medium">
          {currentUser?.username?.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
};

export default UserAvatar;
