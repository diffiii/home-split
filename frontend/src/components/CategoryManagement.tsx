import React, { useState, useEffect } from 'react';
import { ExpenseCategory } from '../types';
import { expenseAPI } from '../services/api';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';

interface CategoryManagementProps {
  isOpen: boolean;
  onClose: () => void;
  householdId: number;
  isOwner: boolean;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({
  isOpen,
  onClose,
  householdId,
  isOwner
}) => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, householdId]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const categoriesData = await expenseAPI.getHouseholdCategories(householdId);
      setCategories(categoriesData);
    } catch (err: any) {
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategory.name.trim()) {
      setError('Please enter a category name');
      return;
    }

    if (!newCategory.icon.trim()) {
      setError('Please enter an icon (emoji)');
      return;
    }

    try {
      setIsLoading(true);
      await expenseAPI.createExpenseCategory({
        household_id: householdId,
        name: newCategory.name.trim(),
        icon: newCategory.icon.trim()
      });

      setNewCategory({ name: '', icon: '' });
      setShowAddForm(false);
      setError('');
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.name?.[0] || 'Failed to create category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!isOwner) {
      setError('Only the household owner can delete categories');
      return;
    }

    try {
      setDeletingId(categoryId);
      await expenseAPI.deleteExpenseCategory(categoryId);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setNewCategory({ name: '', icon: '' });
    setShowAddForm(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Manage Categories">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Add Category Section */}
        <div>
          {!showAddForm && (
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Categories</h3>
              <Button
                onClick={() => setShowAddForm(true)}
                variant="primary"
                size="sm"
                disabled={showAddForm}
              >
                Add Category
              </Button>
            </div>
          )}

          {/* Add Category Form */}
          {showAddForm && (
            <form onSubmit={handleAddCategory} className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <Input
                    label="Icon"
                    value={newCategory.icon}
                    onChange={e => setNewCategory({ ...newCategory, icon: e.target.value })}
                    placeholder="Emoji"
                    maxLength={4}
                    noMargin
                  />
                </div>
                <div className="sm:col-span-3">
                  <Input
                    label="Name"
                    value={newCategory.name}
                    onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Category name"
                    maxLength={50}
                    noMargin
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-3">
                <Button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Category'}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Categories List */}
        <div>
          {isLoading && categories.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2 text-gray-600">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Loading categories...</span>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
              <p className="mb-4">Add your first category to start organizing expenses.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map(category => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{category.icon}</span>
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  {isOwner && (
                    <Button
                      onClick={() => handleDeleteCategory(category.id)}
                      variant="outline"
                      size="sm"
                      disabled={deletingId === category.id}
                      className="text-red-600 border-red-300 hover:bg-red-500 hover:border-red-400"
                    >
                      {deletingId === category.id ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Deleting...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
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
                          Delete
                        </span>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info note for non-owners */}
        {!isOwner && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-blue-800">
                Only the household owner can delete categories.
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CategoryManagement;
