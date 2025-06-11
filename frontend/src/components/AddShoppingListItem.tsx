import React, { useState } from 'react';
import { CreateShoppingListItemData, ShoppingListItem } from '../types';
import { shoppingListAPI } from '../services/api';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';

interface AddShoppingListItemProps {
  householdId: number;
  onItemAdded: () => void;
  onCancel: () => void;
  editItem?: ShoppingListItem;
}

const AddShoppingListItem: React.FC<AddShoppingListItemProps> = ({
  householdId,
  onItemAdded,
  onCancel,
  editItem
}) => {
  const [formData, setFormData] = useState<CreateShoppingListItemData>({
    name: editItem?.name || '',
    quantity: editItem?.quantity || 1,
    unit: editItem?.unit || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!editItem;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Please enter an item name');
      return;
    }

    if (formData.quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const dataToSubmit: CreateShoppingListItemData = {
        name: formData.name.trim(),
        quantity: formData.quantity,
        household: householdId
      };

      const unitValue = formData.unit?.trim();
      if (unitValue) {
        dataToSubmit.unit = unitValue;
      }

      console.log('Submitting shopping list item:', dataToSubmit);
      console.log('Household ID:', householdId);
      
      if (isEditing) {
        await shoppingListAPI.updateShoppingListItem(editItem!.id, dataToSubmit);
      } else {
        await shoppingListAPI.createShoppingListItem(householdId, dataToSubmit);
      }
      
      onItemAdded();
    } catch (err: any) {
      console.error('Failed to create shopping list item:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMessage = 'Failed to add item';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors[0];
        } else {
          const fieldErrors = Object.entries(err.response.data)
            .filter(([key, value]) => Array.isArray(value))
            .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
            .join('; ');
          if (fieldErrors) {
            errorMessage = fieldErrors;
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={isEditing ? "Edit Shopping List Item" : "Add Shopping List Item"}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          label="Item Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Milk, Bread, Apples"
          required
          disabled={isLoading}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Quantity"
            type="number"
            value={formData.quantity.toString()}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 1;
              setFormData({ ...formData, quantity: value });
            }}
            min="1"
            step="1"
            placeholder="1"
            required
            disabled={isLoading}
          />

          <Input
            type="text"
            label="Unit (optional)"
            value={formData.unit || ''}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="kg, pcs, liters"
            disabled={isLoading}
          />
        </div>

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
            {isLoading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Item' : 'Add Item')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddShoppingListItem;
