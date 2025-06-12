import React, { useState, useEffect } from 'react';
import { SplitType, SplitMember, SplitConfiguration } from '../types';
import { validateSplitConfiguration } from '../utils/splitCalculations';
import Button from './Button';
import UserAvatar from './UserAvatar';

interface SplitConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  splitType: SplitType;
  members: SplitMember[];
  onConfirm: (members: SplitMember[]) => void;
  totalAmount: number;
}

const SplitConfigurationModal: React.FC<SplitConfigurationModalProps> = ({
  isOpen,
  onClose,
  splitType,
  members,
  onConfirm,
  totalAmount
}) => {
  const [localMembers, setLocalMembers] = useState<SplitMember[]>(members);
  const [inputValuesBySplitType, setInputValuesBySplitType] = useState<{
    [splitType: string]: { [userId: number]: string };
  }>({});

  useEffect(() => {
    setLocalMembers(members);

    if (!inputValuesBySplitType[splitType]) {
      const initialInputValues: { [key: number]: string } = {};
      members.forEach(member => {
        initialInputValues[member.user_id] =
          member.value !== undefined && member.value !== null ? member.value.toString() : '';
      });

      setInputValuesBySplitType(prev => ({
        ...prev,
        [splitType]: initialInputValues
      }));
    } else {
      const storedInputs = inputValuesBySplitType[splitType];
      const updatedMembers = members.map(member => {
        const storedValue = storedInputs[member.user_id];
        if (storedValue !== undefined && storedValue !== '') {
          const numericValue = parseFloat(storedValue);
          if (!isNaN(numericValue)) {
            return { ...member, value: numericValue };
          }
        }
        return member;
      });
      setLocalMembers(updatedMembers);
    }
  }, [members, isOpen, splitType, inputValuesBySplitType]);

  if (!isOpen) return null;

  const handleValueChange = (userId: number, inputValue: string) => {
    setInputValuesBySplitType(prev => ({
      ...prev,
      [splitType]: {
        ...prev[splitType],
        [userId]: inputValue
      }
    }));

    let numericValue: number | undefined;
    if (inputValue === '' || (inputValue === '-' && splitType === 'plus_minus')) {
      numericValue = undefined;
    } else {
      const parsed = parseFloat(inputValue);
      if (!isNaN(parsed)) {
        numericValue = parsed;
      } else {
        numericValue = undefined;
      }
    }

    setLocalMembers(prev =>
      prev.map(member => (member.user_id === userId ? { ...member, value: numericValue } : member))
    );
  };

  const handleConfirm = () => {
    const validation = getCurrentValidation();

    if (!validation.isValid) {
      return;
    }

    onConfirm(localMembers);
    onClose();
  };

  const getCurrentValidation = () => {
    const tempConfig: SplitConfiguration = {
      type: splitType,
      members: localMembers,
      totalAmount: totalAmount
    };

    return validateSplitConfiguration(tempConfig, totalAmount);
  };

  const validation = getCurrentValidation();

  const getInputLabel = (splitType: SplitType): string => {
    switch (splitType) {
      case 'percentage':
        return '%';
      case 'fixed':
        return '$';
      case 'parts':
        return 'parts';
      case 'plus_minus':
        return '$';
      default:
        return '';
    }
  };

  const getPlaceholder = (splitType: SplitType): string => {
    switch (splitType) {
      case 'percentage':
        return '0';
      case 'fixed':
        return '0.00';
      case 'parts':
        return '0';
      case 'plus_minus':
        return '0.00';
      default:
        return '0';
    }
  };

  const getModalTitle = (splitType: SplitType): string => {
    switch (splitType) {
      case 'percentage':
        return 'Set Percentage Split';
      case 'fixed':
        return 'Set Fixed Amount Split';
      case 'parts':
        return 'Set Parts Split';
      case 'plus_minus':
        return 'Set Plus/Minus Split';
      default:
        return 'Configure Split';
    }
  };

  const getDescription = (splitType: SplitType): string => {
    switch (splitType) {
      case 'percentage':
        return 'Enter the percentage each member should pay:';
      case 'fixed':
        return 'Enter the fixed amount each member should pay:';
      case 'parts':
        return 'Enter the number of parts for each member:';
      case 'plus_minus':
        return 'Enter adjustment amounts (+ to pay more, - to pay less):';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{getModalTitle(splitType)}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">{getDescription(splitType)}</p>

        {/* Total Amount Display */}
        <div className="bg-gray-100 p-3 rounded-md mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Total Expense:</span>
            <span className="font-medium">${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-3 rounded-md mb-4">
          <div className="space-y-3">
            {localMembers.map(member => (
              <div key={member.user_id} className="flex items-center space-x-3">
                <UserAvatar userId={member.user_id} size="sm" />
                <span className="text-sm flex-1">{member.user.username}</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern={splitType === 'percentage' ? '[0-9]*' : '[0-9]*(\.\,[0-9]+)?'}
                    step={splitType === 'parts' ? '1' : '0.01'}
                    min={splitType === 'percentage' ? '0' : undefined}
                    max={splitType === 'percentage' ? '100' : undefined}
                    value={
                      (inputValuesBySplitType[splitType] &&
                        inputValuesBySplitType[splitType][member.user_id]) ||
                      ''
                    }
                    onInput ={e => {
                      const target = e.target as HTMLInputElement;
                      let value = target.value.replace(/[^0-9.,]/g, '');
                      value = value.replace(/,/g, '.');
                      const parts = value.split('.');

                      if (parts.length > 2) {
                        value = parts[0] + '.' + parts.slice(1).join('');
                      }

                      if (parts.length === 2 && parts[1].length > 2) {
                        value = parts[0] + '.' + parts[1].substring(0, 2);
                      }

                      target.value = value;
                    }}
                    onChange={e => {
                      handleValueChange(member.user_id, e.target.value);
                    }}
                    placeholder={getPlaceholder(splitType)}
                    className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black text-right"
                  />
                  <span className="text-sm text-gray-500 min-w-fit">
                    {getInputLabel(splitType)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Validation Summary */}
        <div className="bg-gray-100 p-3 rounded-md mb-4">
          <div className="space-y-1 text-sm">
            {splitType === 'percentage' && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Percentage:</span>
                <span
                  className={`font-medium ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}
                >
                  {localMembers.reduce((sum, member) => sum + (member.value || 0), 0).toFixed(1)}%
                </span>
              </div>
            )}
            {splitType === 'fixed' && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Fixed Amount:</span>
                <span className="font-medium text-black">
                  ${localMembers.reduce((sum, member) => sum + (member.value || 0), 0).toFixed(2)}
                </span>
              </div>
            )}
            {splitType === 'parts' && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Parts:</span>
                <span className="font-medium text-black">
                  {localMembers.reduce((sum, member) => sum + (member.value || 0), 0)}
                </span>
              </div>
            )}
            {splitType === 'plus_minus' && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Adjustments:</span>
                <span className="font-medium text-blue-600">
                  {(() => {
                    const total = localMembers.reduce(
                      (sum, member) => sum + (member.value || 0),
                      0
                    );
                    return `${total >= 0 ? '+' : ''}$${total.toFixed(2)}`;
                  })()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Validation Errors */}
        {validation.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-md mb-4 text-sm">
            {validation.errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            disabled={!validation.isValid}
            className={`flex-1 ${!validation.isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Confirm Split
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SplitConfigurationModal;
