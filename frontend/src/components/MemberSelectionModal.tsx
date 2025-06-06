import React, { useState, useEffect } from 'react';
import { User, SplitMember } from '../types';
import UserAvatar from './UserAvatar';
import Button from './Button';

interface MemberSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  allMembers: User[];
  selectedMembers: SplitMember[];
  onConfirm: (members: SplitMember[]) => void;
}

const MemberSelectionModal: React.FC<MemberSelectionModalProps> = ({
  isOpen,
  onClose,
  allMembers,
  selectedMembers,
  onConfirm
}) => {
  const [tempSelectedMembers, setTempSelectedMembers] = useState<SplitMember[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTempSelectedMembers(selectedMembers);
    }
  }, [isOpen, selectedMembers]);

  const handleMemberToggle = (userId: number) => {
    setTempSelectedMembers(prev => {
      const isSelected = prev.some(m => m.user_id === userId);
      if (isSelected) {
        return prev.filter(m => m.user_id !== userId);
      } else {
        const user = allMembers.find(u => u.id === userId)!;
        return [...prev, {
          user_id: userId,
          user,
          value: 0
        }];
      }
    });
  };

  const handleSelectAll = () => {
    const allMembersSplit = allMembers.map(user => ({
      user_id: user.id,
      user,
      value: 0
    }));
    setTempSelectedMembers(allMembersSplit);
  };

  const handleDeselectAll = () => {
    setTempSelectedMembers([]);
  };

  const handleConfirm = () => {
    onConfirm(tempSelectedMembers);
    onClose();
  };

  if (!isOpen) return null;

  const allSelected = tempSelectedMembers.length === allMembers.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Select Members</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600">
            {tempSelectedMembers.length} of {allMembers.length} selected
          </span>
          <div className="space-x-2">
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={allSelected}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              disabled={tempSelectedMembers.length === 0}
              className="text-sm text-red-600 hover:text-red-800 disabled:text-gray-400"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mb-4">
          <div className="space-y-2">
            {allMembers.map(user => {
              const isSelected = tempSelectedMembers.some(m => m.user_id === user.id);
              return (
                <div key={user.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleMemberToggle(user.id)}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <UserAvatar userId={user.id} size="sm" />
                  <span className="text-gray-900 font-medium flex-1">{user.username}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            disabled={tempSelectedMembers.length === 0}
            className="flex-1"
          >
            Select ({tempSelectedMembers.length})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MemberSelectionModal;
