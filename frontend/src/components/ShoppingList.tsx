import React, { useState } from 'react';
import { ShoppingListItem, User } from '../types';
import { shoppingListAPI } from '../services/api';
import Button from './Button';
import AddShoppingListItem from './AddShoppingListItem';

const RemoveButton: React.FC<{
  onClick: () => void;
  label: string;
  className?: string;
}> = ({ onClick, label, className = "" }) => (
  <Button
    variant="outline"
    onClick={onClick}
    className={`flex items-center justify-center text-red-600 border-red-300 hover:bg-red-500 hover:border-red-400 ${className}`}
  >
    <svg
      className="w-4 h-4 mr-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
    {label}
  </Button>
);

const ResponsiveButtonLayout: React.FC<{
  addButton?: React.ReactNode;
  removeButton?: React.ReactNode;
}> = ({ addButton, removeButton }) => (
  <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
    {/* Mobile layout: Add first, then Remove */}
    <div className="flex flex-col gap-2 w-full sm:hidden">
      {addButton && <div className="w-full">{addButton}</div>}
      {removeButton && <div className="w-full">{removeButton}</div>}
    </div>
    
    {/* Desktop layout: Remove first, then Add */}
    <div className="hidden sm:flex sm:flex-row sm:gap-3">
      {removeButton && <div>{removeButton}</div>}
      {addButton && <div>{addButton}</div>}
    </div>
  </div>
);

interface ShoppingListProps {
  items: ShoppingListItem[];
  currentUserId: number;
  householdMembers: User[];
  onItemUpdated: () => void;
  householdId: number;
  addItemButton?: React.ReactNode;
}

interface ShoppingListItemProps {
  item: ShoppingListItem;
  currentUserId: number;
  onItemUpdated: () => void;
  householdId: number;
}

const ShoppingListItemComponent: React.FC<ShoppingListItemProps> = ({
  item,
  currentUserId,
  onItemUpdated,
  householdId
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTogglePurchased = async () => {
    setIsUpdating(true);
    try {
      await shoppingListAPI.updateShoppingListItem(item.id, {
        is_purchased: !item.is_purchased,
        purchased_by: !item.is_purchased ? currentUserId : undefined
      });
      onItemUpdated();
    } catch (error) {
      console.error('Failed to update item:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setIsUpdating(true);
      try {
        await shoppingListAPI.deleteShoppingListItem(item.id);
        onItemUpdated();
      } catch (error) {
        console.error('Failed to delete item:', error);
        setIsUpdating(false);
      }
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
    setShowDetails(false);
  };

  const handleEditComplete = () => {
    setShowEditModal(false);
    onItemUpdated();
  };

  const canModify = item.added_by.id === currentUserId;

  return (
    <>
      <div
        className={`border border-gray-200 rounded-lg p-4 transition-all duration-200 ${
          item.is_purchased ? 'bg-green-50 border-green-200' : 'bg-white hover:border-gray-300'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <button
              onClick={handleTogglePurchased}
              disabled={isUpdating}
              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                item.is_purchased
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-green-500'
              } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {item.is_purchased && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3
                  className={`text-sm font-medium ${
                    item.is_purchased ? 'text-green-700 line-through' : 'text-gray-900'
                  }`}
                >
                  {item.name}
                </h3>
                <span className="text-xs text-gray-500">
                  {item.quantity}
                  {item.unit && ` ${item.unit}`}
                </span>
              </div>

              <div className="mt-1 flex items-center space-x-1 text-xs text-gray-500">
                <span>Added by {item.added_by.username}</span>
                <span>•</span>
                <span>{formatDate(item.added_at)}</span>
              </div>

              {item.is_purchased && item.purchased_by && (
                <div className="mt-1 flex items-center space-x-1 text-xs text-green-600">
                  <span>Purchased by {item.purchased_by.username}</span>
                  {item.purchased_at && (
                    <>
                      <span>•</span>
                      <span>{formatDate(item.purchased_at)}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {canModify && (
            <div className="flex items-center space-x-2 ml-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {showDetails && canModify && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex gap-2">
              <Button
                onClick={handleEdit}
                variant="outline"
                size="sm"
                className="text-xs flex-1 sm:flex-none"
              >
                Edit
              </Button>
              <Button
                onClick={handleDelete}
                variant="danger"
                size="sm"
                disabled={isUpdating}
                className="text-xs flex-1 sm:flex-none"
              >
                {isUpdating ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <AddShoppingListItem
          householdId={householdId}
          onItemAdded={handleEditComplete}
          onCancel={() => setShowEditModal(false)}
          editItem={item}
        />
      )}
    </>
  );
};

const ShoppingList: React.FC<ShoppingListProps> = ({
  items,
  currentUserId,
  onItemUpdated,
  householdId,
  addItemButton
}) => {
  const [filter, setFilter] = useState<'all' | 'needed' | 'purchased'>('all');

  const handleRemovePurchased = async () => {
    const purchasedItems = items.filter(item => item.is_purchased);
    
    if (purchasedItems.length === 0) {
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${purchasedItems.length} purchased item${purchasedItems.length === 1 ? '' : 's'}? This action cannot be undone.`)) {
      return;
    }

    try {
      await Promise.all(purchasedItems.map(item => shoppingListAPI.deleteShoppingListItem(item.id)));
      onItemUpdated();
    } catch (error) {
      console.error('Failed to delete purchased items:', error);
      alert('Failed to delete some purchased items. Please try again.');
    }
  };

  const filteredItems = items.filter(item => {
    switch (filter) {
      case 'needed':
        return !item.is_purchased;
      case 'purchased':
        return item.is_purchased;
      default:
        return true;
    }
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.is_purchased !== b.is_purchased) {
      return a.is_purchased ? 1 : -1;
    }
    return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
  });

  const purchasedCount = items.filter(t => t.is_purchased).length;

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        <svg
          className="mx-auto h-12 w-12 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
        <p className="mb-6">Start building your shopping list.</p>
      </div>
    );
  }

  return (
    <>
      {/* Header with filters and action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-3 sm:space-y-0">
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { key: 'all', label: 'All', count: items.length },
            { key: 'needed', label: 'Needed', count: items.filter(t => !t.is_purchased).length },
            { key: 'purchased', label: 'Purchased', count: purchasedCount }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                filter === key
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
        
        <ResponsiveButtonLayout
          addButton={addItemButton}
          removeButton={
            purchasedCount > 0 ? (
              <RemoveButton
                onClick={handleRemovePurchased}
                label="Remove Purchased"
                className="w-full sm:w-auto"
              />
            ) : undefined
          }
        />
      </div>

      {/* Shopping List */}
      <div className="space-y-3">
        {sortedItems.map(item => (
          <ShoppingListItemComponent
            key={item.id}
            item={item}
            currentUserId={currentUserId}
            onItemUpdated={onItemUpdated}
            householdId={householdId}
          />
        ))}
      </div>
    </>
  );
};

export default ShoppingList;
