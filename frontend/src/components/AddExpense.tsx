import React, { useState, useEffect, useCallback } from 'react';
import { User, ExpenseCategory, CreateExpenseData, SplitType, SplitConfiguration, SplitMember } from '../types';
import { expenseAPI } from '../services/api';
import { calculateSplitsForAPI } from '../utils/splitCalculations';
import Button from './Button';
import Input from './Input';
import { CategorySelect, UserSelect } from './CustomSelects';
import SplitTypeSelector from './SplitTypeSelector';
import MemberSelectionModal from './MemberSelectionModal';
import SplitConfigurationModal from './SplitConfigurationModal';

interface AddExpenseProps {
  householdId: number;
  householdMembers: User[];
  currentUserId: number;
  onExpenseAdded: () => void;
  onCancel: () => void;
}

const AddExpense: React.FC<AddExpenseProps> = ({
  householdId,
  householdMembers,
  currentUserId,
  onExpenseAdded,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    category_id: 0,
    payer_id: currentUserId,
    splitType: 'equal' as SplitType
  });
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [splitConfiguration, setSplitConfiguration] = useState<SplitConfiguration | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);

  useEffect(() => {
    if (!splitConfiguration && householdMembers.length > 0) {
      const initialConfig: SplitConfiguration = {
        type: 'equal',
        members: householdMembers.map(user => ({
          user_id: user.id,
          user,
          value: 0
        })),
        totalAmount: 0
      };
      setSplitConfiguration(initialConfig);
    }
  }, [householdMembers, splitConfiguration]);

  useEffect(() => {
    if (splitConfiguration && splitConfiguration.type !== formData.splitType) {
      setSplitConfiguration(prev => ({
        ...prev!,
        type: formData.splitType,
        totalAmount: parseFloat(formData.amount) || 0
      }));
    }
  }, [formData.splitType, formData.amount, splitConfiguration]);

  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await expenseAPI.getHouseholdCategories(householdId);
      setCategories(categoriesData);
    } catch (err) {
      setError('Failed to load categories');
    }
  }, [householdId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Please enter an expense name');
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (!splitConfiguration || splitConfiguration.members.length === 0) {
      setError('Please select at least one member for the split');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const amount = parseFloat(formData.amount);
      
      const splits_data = calculateSplitsForAPI(splitConfiguration, amount);

      const expenseData: CreateExpenseData = {
        household_id: householdId,
        name: formData.name,
        description: formData.description,
        amount: formData.amount,
        payer_id: formData.payer_id,
        splits_data,
        ...(formData.category_id > 0 && { category_id: formData.category_id })
      };

      await expenseAPI.createExpense(expenseData);
      onExpenseAdded();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create expense');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSplitTypeChange = (value: SplitType) => {
    setFormData({ ...formData, splitType: value });
    
    if (value !== 'equal') {
      setShowSplitModal(true);
    }
  };

  const handleMemberSelectionConfirm = (members: SplitMember[]) => {
    setSplitConfiguration(prev => ({
      ...prev!,
      members: members
    }));
  };

  const handleSplitConfigurationConfirm = (members: SplitMember[]) => {
    setSplitConfiguration(prev => ({
      ...prev!,
      members: members
    }));
  };

  return (
    <>
      {!showMemberModal && !showSplitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Add Expense</h2>
              <button 
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                label="Expense Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter expense name"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                  rows={1}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter expense description (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                  noMargin
                />

                <UserSelect
                  label="Paid by"
                  users={householdMembers}
                  value={formData.payer_id}
                  onChange={(value) => setFormData({ ...formData, payer_id: value })}
                  placeholder="Select who paid"
                  required
                />
              </div>

              <CategorySelect
                label="Category"
                categories={categories}
                value={formData.category_id}
                onChange={(value) => setFormData({ ...formData, category_id: value })}
                placeholder={categories.length === 0 ? 'No categories available' : 'Select a category'}
              />

              {/* Choose Members Button */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose members
                </label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMemberModal(true)}
                  className="w-full text-sm py-2 bg-white hover:bg-black text-gray-700 border-gray-300"
                >
                  Select ({splitConfiguration?.members.length || householdMembers.length} members)
                </Button>
              </div>

              <SplitTypeSelector
                value={formData.splitType}
                onChange={handleSplitTypeChange}
              />

              <div className="flex space-x-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Adding...' : 'Add Expense'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Selection Modal */}
      <MemberSelectionModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        allMembers={householdMembers}
        selectedMembers={splitConfiguration?.members || []}
        onConfirm={handleMemberSelectionConfirm}
      />

      {/* Split Configuration Modal */}
      <SplitConfigurationModal
        isOpen={showSplitModal}
        onClose={() => setShowSplitModal(false)}
        splitType={formData.splitType}
        members={splitConfiguration?.members || []}
        onConfirm={handleSplitConfigurationConfirm}
        totalAmount={parseFloat(formData.amount) || 0}
      />
    </>
  );
};

export default AddExpense;
