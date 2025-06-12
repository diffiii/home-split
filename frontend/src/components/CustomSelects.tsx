import React, { useState, useRef, useEffect } from 'react';
import { User, ExpenseCategory, SplitType } from '../types';
import UserAvatar from './UserAvatar';

interface CustomSelectProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  required?: boolean;
}

interface CategorySelectProps extends CustomSelectProps {
  categories: ExpenseCategory[];
}

interface UserSelectProps extends CustomSelectProps {
  users: User[];
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  label,
  categories,
  value,
  onChange,
  placeholder = 'Select a category',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedCategory = categories.find(cat => cat.id === value);
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (categoryId: number) => {
    onChange(categoryId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={selectRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-black ml-1">*</span>}
      </label>

      <div
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer bg-white flex items-center justify-between min-h-[40px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2 flex-1">
          {selectedCategory ? (
            <>
              {selectedCategory.icon && <span className="text-lg">{selectedCategory.icon}</span>}
              <span className="text-gray-900">{selectedCategory.name}</span>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              onClick={e => e.stopPropagation()}
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {filteredCategories.length > 0 ? (
              filteredCategories.map(category => (
                <div
                  key={category.id}
                  className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelect(category.id)}
                >
                  {category.icon && <span className="text-lg">{category.icon}</span>}
                  <span className="text-gray-900">{category.name}</span>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 text-sm">No categories found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const UserSelect: React.FC<UserSelectProps> = ({
  label,
  users,
  value,
  onChange,
  placeholder = 'Select a user',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedUser = users.find(user => user.id === value);
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (userId: number) => {
    onChange(userId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={selectRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-black ml-1">*</span>}
      </label>

      <div
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer bg-white flex items-center justify-between min-h-[40px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2 flex-1">
          {selectedUser ? (
            <>
              <UserAvatar userId={selectedUser.id} size="xs" />
              <span className="text-gray-900">{selectedUser.username}</span>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              onClick={e => e.stopPropagation()}
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelect(user.id)}
                >
                  <UserAvatar userId={user.id} size="sm" />
                  <span className="text-gray-900">{user.username}</span>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 text-sm">No users found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
