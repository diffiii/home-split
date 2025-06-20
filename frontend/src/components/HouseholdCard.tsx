import React, { useState } from 'react';
import { Household } from '../types';
import Button from './Button';
import InviteMember from './InviteMember';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';

interface HouseholdCardProps {
  household: Household;
  onViewHousehold: (household: Household) => void;
  onHouseholdUpdated?: () => void;
}

const HouseholdCard: React.FC<HouseholdCardProps> = ({
  household,
  onViewHousehold,
  onHouseholdUpdated
}) => {
  const { user } = useAuth();
  const [showInviteForm, setShowInviteForm] = useState(false);

  const isOwner = user?.id === household.owner.id;
  const activeMembers = household.members.filter(member => member.is_active !== false);

  const handleInviteSent = () => {
    setShowInviteForm(false);
    if (onHouseholdUpdated) {
      onHouseholdUpdated();
    }
  };

  const UsersIcon = () => (
    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );

  const ArrowIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:border-black transition-all duration-200 group">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium text-base sm:text-lg">
                {household.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-medium text-black group-hover:text-gray-700 transition-colors duration-200 truncate">
                {household.name}
              </h3>
              <span className="text-xs sm:text-sm text-gray-600 flex items-center">
                <UsersIcon />
                {activeMembers.length} member{activeMembers.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          {isOwner && (
            <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded-full flex-shrink-0">
              Owner
            </span>
          )}
        </div>

        {/* Description Section */}
        <div className="mb-2 h-6 sm:h-8 flex items-start">
          {household.description && (
            <p className="text-gray-600 line-clamp-2 text-xs sm:text-sm leading-relaxed">
              {household.description}
            </p>
          )}
        </div>

        {/* Footer Section */}
        <div className="mt-2 pt-3 sm:pt-4 border-t border-gray-200">
          <div className="mb-4 sm:mb-6">
            <span className="text-xs sm:text-sm text-gray-600">
              Owner: <span className="font-medium text-black">{household.owner.username}</span>
            </span>
          </div>

          <div className="flex flex-col space-y-2">
            {isOwner && (
              <Button
                onClick={() => setShowInviteForm(true)}
                variant="outline"
                size="sm"
                className="w-full text-xs sm:text-sm"
              >
                Invite member
              </Button>
            )}
            <Button
              onClick={() => onViewHousehold(household)}
              variant="primary"
              size="sm"
              className="w-full flex items-center justify-center space-x-1 text-xs sm:text-sm"
            >
              <span>View</span>
              <ArrowIcon />
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showInviteForm}
        onClose={() => setShowInviteForm(false)}
        title="Invite New Member"
      >
        <InviteMember
          householdId={household.id}
          onInviteSent={handleInviteSent}
          onCancel={() => setShowInviteForm(false)}
        />
      </Modal>
    </>
  );
};

export default HouseholdCard;
