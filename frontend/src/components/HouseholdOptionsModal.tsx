import React, { useState, useEffect } from 'react';
import { Household, User } from '../types';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import UserAvatar from './UserAvatar';
import { householdAPI, membershipAPI, settlementAPI, expenseAPI } from '../services/api';

interface HouseholdOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  household: Household;
  currentUser: User;
  onHouseholdUpdated: (updatedHousehold: Household) => void;
  onHouseholdDeleted: () => void;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isDestructive?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  isDestructive = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-gray-600">{message}</p>
        <div className="flex space-x-3">
          <Button
            onClick={onConfirm}
            variant={isDestructive ? 'danger' : 'primary'}
            className="flex-1"
          >
            {confirmText}
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const HouseholdOptionsModal: React.FC<HouseholdOptionsModalProps> = ({
  isOpen,
  onClose,
  household,
  currentUser,
  onHouseholdUpdated,
  onHouseholdDeleted
}) => {
  const [activeTab, setActiveTab] = useState<'name' | 'members' | 'delete'>('name');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [canDeleteHousehold, setCanDeleteHousehold] = useState(true);

  const [newName, setNewName] = useState(household.name);
  const [newDescription, setNewDescription] = useState(household.description || '');

  const [showRemoveMemberConfirm, setShowRemoveMemberConfirm] = useState<number | null>(null);
  const [showDeleteHouseholdConfirm, setShowDeleteHouseholdConfirm] = useState(false);

  const activeMembers = household.members.filter(member => member.is_active !== false);
  const isOwner = currentUser.id === household.owner.id;

  if (!isOwner) {
    return null;
  }

  const handleSaveName = async () => {
    if (!newName.trim()) {
      setError('Household name is required');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const updatedHousehold = await householdAPI.updateHousehold(household.id, {
        name: newName.trim(),
        description: newDescription.trim() || undefined
      });
      onHouseholdUpdated(updatedHousehold);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.name?.[0] || 'Failed to update household name');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    const member = activeMembers.find(m => m.id === memberId);

    if (!member || !member.membership_id) return;

    try {
      setIsLoading(true);
      setError('');
      await membershipAPI.removeMember(member.membership_id);

      const updatedMembers = household.members.filter(m => m.id !== memberId);
      const updatedHousehold = { ...household, members: updatedMembers };

      onHouseholdUpdated(updatedHousehold);
      setShowRemoveMemberConfirm(null);
    } catch (err: any) {
      setError('Failed to remove member');
    } finally {
      setIsLoading(false);
    }
  };

  const checkCanDeleteMember = async (memberId: number): Promise<boolean> => {
    if (memberId === household.owner.id) {
      return false;
    }

    try {
      const balancesData = await settlementAPI.getHouseholdBalances(household.id);
      const memberBalance = balancesData.balances.find(b => b.user_id === memberId)?.balance || 0;
      return memberBalance === 0;
    } catch (error) {
      return false;
    }
  };

  const checkCanDeleteHousehold = async () => {
    try {
      const summary = await expenseAPI.getHouseholdExpenseSummary(household.id);
      console.log(summary.total_unsettled)
      setCanDeleteHousehold(summary.total_unsettled === 0);
    } catch (error) {
      setError('Failed to check household expenses. Please try again later.');
      setCanDeleteHousehold(false);
    }
  };

  const handleDeleteHousehold = async () => {
    try {
      setIsLoading(true);
      setError('');
      await householdAPI.deleteHousehold(household.id);
      setShowDeleteHouseholdConfirm(false);
      onHouseholdDeleted();
      onClose();
    } catch (err: any) {
      setError('Failed to delete household. Make sure all expenses are settled.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderNameTab = () => (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-800 p-3 rounded-xl backdrop-blur-sm text-sm">
          {error}
        </div>
      )}
      <div>
        <Input
          type="text"
          label="Household Name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Enter household name"
          disabled={isLoading}
          noMargin={true}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (optional)
        </label>
        <textarea
          value={newDescription}
          onChange={e => setNewDescription(e.target.value)}
          placeholder="Enter household description"
          disabled={isLoading}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-all resize-none text-sm"
        />
      </div>
      <div className="flex space-x-3">
        <Button
          onClick={handleSaveName}
          disabled={
            isLoading ||
            (newName === household.name && newDescription === (household.description || ''))
          }
          className="flex-1"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button onClick={onClose} variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );

  const renderMembersTab = () => (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-800 p-3 rounded-xl backdrop-blur-sm text-sm">
          {error}
        </div>
      )}
      <div className="space-y-3">
        {activeMembers.map(member => {
          const isCurrentUser = member.id === currentUser.id;
          const canRemoveMember = member.id !== household.owner.id;

          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <UserAvatar userId={member.id} size="md" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{member.username}</span>
                    {member.id === household.owner.id && (
                      <span className="text-xs bg-gray-600 text-white px-1 py-0.3 rounded-full">
                        Owner
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{member.email}</div>
                </div>
              </div>

              {!isCurrentUser && (
                <div className="flex items-center space-x-2">
                  {!canRemoveMember && (
                    <span className="text-xs text-gray-500">Owner</span>
                  )}
                  <Button
                    onClick={async () => {
                      const canDelete = await checkCanDeleteMember(member.id);
                      if (canDelete) {
                        setShowRemoveMemberConfirm(member.id);
                      } else {
                        setError('Cannot remove member: they have unsettled balances');
                      }
                    }}
                    variant="outline"
                    size="sm"
                    disabled={isLoading || !canRemoveMember}
                    className={`${
                      canRemoveMember
                        ? 'text-red-600 border-red-300 hover:bg-red-500'
                        : 'text-gray-400 border-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Note: Members can only be removed if they have settled all balances. Balance will be checked when you click Remove.
        </p>
      </div>
    </div>
  );

  const renderDeleteTab = () => (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-800 p-3 rounded-xl backdrop-blur-sm text-sm">
          {error}
        </div>
      )}
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-red-600 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-red-800">Delete Household</h4>
            <p className="text-sm text-red-700 mt-1">
              This will permanently delete the household and all associated data. This action cannot
              be undone.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h5 className="text-sm font-medium text-gray-900">Before deleting:</h5>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• All expenses must be settled</li>
          <li>• All members will lose access to the household</li>
          <li>• All data will be permanently deleted</li>
        </ul>
      </div>

      {!canDeleteHousehold && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-yellow-800">
              Cannot delete household: There are unsettled expenses. Please settle all expenses before deleting.
            </p>
          </div>
        </div>
      )}

      <Button
        onClick={() => setShowDeleteHouseholdConfirm(true)}
        variant="danger"
        disabled={isLoading || !canDeleteHousehold}
        className="w-full"
      >
        {isLoading ? 'Deleting...' : 'Delete Household'}
      </Button>
    </div>
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Household Options">
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('name');
                setError('');
              }}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'name'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Name & Details
            </button>
            <button
              onClick={() => {
                setActiveTab('members');
                setError('');
              }}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'members'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Members
            </button>
            <button
              onClick={() => {
                setActiveTab('delete');
                setError('');
                checkCanDeleteHousehold();
              }}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'delete'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-red-600'
              }`}
            >
              Delete
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {activeTab === 'name' && renderNameTab()}
            {activeTab === 'members' && renderMembersTab()}
            {activeTab === 'delete' && renderDeleteTab()}
          </div>
        </div>
      </Modal>

      {/* Remove Member Confirmation */}
      {showRemoveMemberConfirm && (
        <ConfirmationModal
          isOpen={!!showRemoveMemberConfirm}
          onClose={() => setShowRemoveMemberConfirm(null)}
          onConfirm={() => handleRemoveMember(showRemoveMemberConfirm)}
          title="Remove Member"
          message={`Are you sure you want to remove ${activeMembers.find(m => m.id === showRemoveMemberConfirm)?.username} from this household?`}
          confirmText="Remove"
          isDestructive={true}
        />
      )}

      {/* Delete Household Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteHouseholdConfirm}
        onClose={() => setShowDeleteHouseholdConfirm(false)}
        onConfirm={handleDeleteHousehold}
        title="Delete Household"
        message={`Are you sure you want to permanently delete "${household.name}"? This action cannot be undone and all data will be lost.`}
        confirmText="Delete Household"
        isDestructive={true}
      />
    </>
  );
};

export default HouseholdOptionsModal;
