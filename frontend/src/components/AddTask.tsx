import React, { useState } from 'react';
import { CreateTaskData, Task } from '../types';
import { taskAPI } from '../services/api';
import Button from './Button';
import Input from './Input';

interface AddTaskProps {
  householdId: number;
  onTaskAdded: () => void;
  onCancel: () => void;
  editTask?: Task;
}

const AddTask: React.FC<AddTaskProps> = ({ householdId, onTaskAdded, onCancel, editTask }) => {
  const [formData, setFormData] = useState<CreateTaskData>({
    name: editTask?.name || '',
    description: editTask?.description || '',
    due_date: editTask?.due_date || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!editTask;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isEditing) {
        // Update existing task
        const updateData = {
          name: formData.name.trim(),
          description: formData.description?.trim() || '',
          due_date: formData.due_date || undefined
        };
        await taskAPI.updateTask(editTask!.id, updateData);
      } else {
        // Create new task
        const taskData: CreateTaskData = {
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
          due_date: formData.due_date || undefined,
          household: householdId
        };
        await taskAPI.createTask(householdId, taskData);
      }

      onTaskAdded();
    } catch (err: any) {
      console.error('Task operation error:', err);
      if (err.response?.data) {
        // Handle field-specific errors
        const errors = err.response.data;
        if (typeof errors === 'object') {
          const errorMessages = Object.entries(errors)
            .map(
              ([field, messages]) =>
                `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
            )
            .join('; ');
          setError(errorMessages);
        } else {
          setError(
            errors.detail || errors.message || `Failed to ${isEditing ? 'update' : 'create'} task`
          );
        }
      } else {
        setError(`Failed to ${isEditing ? 'update' : 'create'} task. Please try again.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      return '';
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const date = new Date(value);
      setFormData({ ...formData, due_date: date.toISOString() });
    } else {
      setFormData({ ...formData, due_date: '' });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Task' : 'Add Task'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
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

        {error && (
          <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Task Name"
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter task name"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add task details (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={formatDateForInput(formData.due_date || '')}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
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
            <Button type="submit" variant="primary" disabled={isLoading} className="flex-1">
              {isLoading
                ? isEditing
                  ? 'Updating...'
                  : 'Adding...'
                : isEditing
                  ? 'Update Task'
                  : 'Add Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTask;
