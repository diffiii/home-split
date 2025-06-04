import React, { useState } from 'react';
import { membershipAPI } from '../services/api';
import Button from './Button';
import Input from './Input';

interface InviteMemberProps {
  householdId: number;
  onInviteSent: () => void;
  onCancel: () => void;
}

const InviteMember: React.FC<InviteMemberProps> = ({ 
  householdId, 
  onInviteSent, 
  onCancel 
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await membershipAPI.inviteUser(householdId, email);
      setEmail('');
      onInviteSent();
    } catch (err: any) {
      if (err.message === 'User not found') {
        setError('No user found with this email address');
      } else if (err.response?.status === 400) {
        setError('This user is already a member or has a pending invitation');
      } else {
        setError('Failed to send invitation. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter user's email address"
            required
            disabled={isLoading}
          />
        </div>

        <div className="flex space-x-3 pt-2">
          <Button 
            type="submit"
            variant="primary"
            disabled={isLoading || !email.trim()}
            className="flex-1"
          >
            {isLoading ? 'Sending...' : 'Send Invitation'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InviteMember;
