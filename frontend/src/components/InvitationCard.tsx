import React, { useState } from 'react';
import { Membership } from '../types';
import { membershipAPI } from '../services/api';
import Button from './Button';

interface InvitationCardProps {
  invitation: Membership;
  onAccept: (membershipId: number) => void;
  onDecline: (membershipId: number) => void;
}

const InvitationCard: React.FC<InvitationCardProps> = ({ invitation, onAccept, onDecline }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await membershipAPI.acceptInvitation(invitation.id);
      onAccept(invitation.id);
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    try {
      await membershipAPI.declineInvitation(invitation.id);
      onDecline(invitation.id);
    } catch (error) {
      console.error('Failed to decline invitation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-black rounded-lg p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-medium text-base sm:text-lg">
              {invitation.household?.name?.charAt(0)?.toUpperCase() || 'H'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
              Invitation to {invitation.household?.name || 'Unknown Household'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              Invited by {invitation.household?.owner?.username || 'Unknown User'}
            </p>
            {invitation.household?.description && (
              <p
                className="text-xs sm:text-sm text-gray-500 mt-1 overflow-hidden"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.3em',
                  maxHeight: '2.6em'
                }}
              >
                {invitation.household.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center ml-2 flex-shrink-0">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button
          onClick={handleAccept}
          variant="primary"
          size="sm"
          disabled={isLoading}
          className="flex-1 text-sm"
        >
          {isLoading ? 'Processing...' : 'Accept'}
        </Button>
        <Button
          onClick={handleDecline}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="flex-1 text-sm"
        >
          {isLoading ? 'Processing...' : 'Decline'}
        </Button>
      </div>
    </div>
  );
};

export default InvitationCard;
