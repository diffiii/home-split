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

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-black transition-all duration-200 group">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-medium text-lg">
                {household.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-medium text-black group-hover:text-gray-700 transition-colors duration-200">
                {household.name}
              </h3>
              <span className="text-sm text-gray-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {activeMembers.length} member{activeMembers.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          {isOwner && (
            <div className="flex items-center space-x-2">
                <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded-full">
                Owner
                </span>
            </div>
          )}
        </div>
        
        {household.description && (
          <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
            {household.description}
          </p>
        )}
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {household.owner.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              Owner: <span className="font-medium text-black">{household.owner.username}</span>
            </span>
          </div>
          <div className="flex flex-col space-y-2">
            {isOwner && (
                <Button 
                onClick={() => setShowInviteForm(true)}
                variant="outline" 
                size="sm"
                className="w-full flex justify-center"
                >
                <span className="flex items-center justify-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Invite member</span>
                </span>
                </Button>
            )}
            <Button 
              onClick={() => onViewHousehold(household)} 
              variant="outline" 
              size="sm"
              className="w-full flex justify-center"
            >
              <span className="flex items-center space-x-1">
                <span>View</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
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
