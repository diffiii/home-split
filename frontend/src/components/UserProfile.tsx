import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import ProfilePictureUpload from './ProfilePictureUpload';
import { userAPI } from '../services/api';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPictureLoading, setIsPictureLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (showPasswordChange) {
      if (!currentPassword) {
        setError('Current password is required');
        return;
      }
      if (!newPassword) {
        setError('New password is required');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setIsLoading(true);

      try {
        const isCurrentPasswordValid = await userAPI.validateCurrentPassword(currentPassword);
        if (!isCurrentPasswordValid) {
          setError('Current password is incorrect');
          setIsLoading(false);
          return;
        }
      } catch (err) {
        setError('Failed to validate current password');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    }

    setIsLoading(true);

    try {
      const updateData: any = {
        username,
        email
      };

      if (showPasswordChange && newPassword) {
        updateData.password = newPassword;
        updateData.current_password = currentPassword;
      }

      const updatedUser = await userAPI.updateProfile(updateData);
      updateUser(updatedUser);
      setSuccess(
        showPasswordChange
          ? 'Profile and password updated successfully!'
          : 'Profile updated successfully!'
      );

      if (showPasswordChange) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordChange(false);
      }

      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      console.error('Profile update error:', err);

      const capitalizeFirstLetter = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
      };

      setError(
        capitalizeFirstLetter(
          err.response?.data?.current_password?.[0] ||
            err.response?.data?.password?.[0] ||
            err.response?.data?.email?.[0] ||
            err.response?.data?.username?.[0] ||
            err.response?.data?.detail ||
            err.response?.data?.non_field_errors?.[0] ||
            'Profile update failed. Please try again.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureUpload = async (file: File) => {
    setError('');
    setSuccess('');
    setIsPictureLoading(true);

    try {
      const updatedUser = await userAPI.uploadProfilePicture(file);
      updateUser(updatedUser);
      setSuccess('Profile picture updated successfully!');
    } catch (err: any) {
      console.error('Profile picture upload error:', err);
      setError(
        err.response?.data?.profile_picture?.[0] ||
          err.response?.data?.detail ||
          'Failed to upload profile picture. Please try again.'
      );
    } finally {
      setIsPictureLoading(false);
    }
  };

  const handleProfilePictureRemove = async () => {
    setError('');
    setSuccess('');
    setIsPictureLoading(true);

    try {
      const updatedUser = await userAPI.removeProfilePicture();
      updateUser(updatedUser);
      setSuccess('Profile picture removed successfully!');
    } catch (err: any) {
      console.error('Profile picture removal error:', err);
      setError(err.response?.data?.detail || 'Failed to remove profile picture. Please try again.');
    } finally {
      setIsPictureLoading(false);
    }
  };

  const handleClose = () => {
    setUsername(user?.username || '');
    setEmail(user?.email || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordChange(false);
    setError('');
    setSuccess('');
    setIsPictureLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-800 px-4 py-3 rounded-xl backdrop-blur-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500/30 text-green-800 px-4 py-3 rounded-xl backdrop-blur-sm">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Picture Section */}
          <div className="pb-4 border-gray-200">
            <ProfilePictureUpload
              user={user}
              onUpload={handleProfilePictureUpload}
              onRemove={handleProfilePictureRemove}
              isLoading={isPictureLoading}
            />
          </div>

          {/* Profile Information */}
          <div>
            <div className="space-y-4">
              <Input
                label="Username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
              />

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password Change Section */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">Change Password</h3>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowPasswordChange(!showPasswordChange)}
              >
                {showPasswordChange ? 'Cancel' : 'Change Password'}
              </Button>
            </div>

            {showPasswordChange && (
              <div className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter your current password"
                />

                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password (min 8 characters)"
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading
              ? 'Saving...'
              : showPasswordChange
                ? 'Save Changes & Update Password'
                : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserProfile;
