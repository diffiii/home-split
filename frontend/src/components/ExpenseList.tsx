import React, { useState, useEffect } from 'react';
import { Expense, User, ExpenseCategory } from '../types';
import { expenseAPI } from '../services/api';
import UserAvatar from './UserAvatar';
import { CategorySelect } from './CustomSelects';
import Modal from './Modal';

const updateExpenseCategory = async (
  expenseId: number,
  categoryId: number | null,
  onSuccess: () => void,
  onError: (error: string) => void
) => {
  try {
    await expenseAPI.updateExpense(expenseId, { category_id: categoryId });
    onSuccess();
  } catch (err: any) {
    onError('Failed to update category');
  }
};

interface ExpenseListProps {
  expenses: Expense[];
  currentUserId: number;
  householdMembers: User[];
  householdId: number;
  onExpenseUpdated: () => void;
}

interface ExpenseItemProps {
  expense: Expense;
  currentUserId: number;
  householdMembers: User[];
  onClick: () => void;
}

interface ExpenseDetailProps {
  expense: Expense;
  currentUserId: number;
  householdMembers: User[];
  householdId: number;
  onClose: () => void;
  onExpenseUpdated: () => void;
}

const ExpenseDetail: React.FC<ExpenseDetailProps> = ({
  expense,
  currentUserId,
  householdMembers,
  householdId,
  onClose,
  onExpenseUpdated
}) => {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [householdId]);

  const fetchCategories = async () => {
    try {
      const categoriesData = await expenseAPI.getHouseholdCategories(householdId);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  const handleCategoryChange = async (categoryId: number) => {
    setIsLoading(true);
    setError('');

    await updateExpenseCategory(
      expense.id,
      categoryId === 0 ? null : categoryId,
      () => {
        setIsLoading(false);
        onExpenseUpdated();
      },
      errorMessage => {
        setError(errorMessage);
        setIsLoading(false);
      }
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toFixed(2);
  };

  const getUserById = (userId: number) => {
    return householdMembers.find(member => member.id === userId);
  };

  const currentUserSplit = expense.splits?.find(split => split.user.id === currentUserId);
  const currentUserAmount = currentUserSplit ? parseFloat(currentUserSplit.amount) : 0;
  const isUserInvolved = currentUserSplit !== undefined;

  const totalAmount = parseFloat(expense.amount);

  const payerId = expense.payer_id || expense.payer?.id;
  const isPayer = payerId === currentUserId;

  const othersOweAmount = isPayer ? totalAmount - currentUserAmount : 0;

  const payer = expense.payer || (payerId ? getUserById(payerId) : null);

  return (
    <Modal isOpen={true} onClose={onClose} title="Expense Details">
      <div className="space-y-4">
        {/* Expense Name and Date */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{expense.name}</h3>
          <p className="text-sm text-gray-500">{formatDate(expense.created_at)}</p>
        </div>

        {/* Description */}
        {expense.description && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
            <p className="text-gray-600">{expense.description}</p>
          </div>
        )}

        {/* Category */}
        <div>
          {error && <div className="text-xs text-red-600 mb-2">{error}</div>}

          <CategorySelect
            label="Category"
            categories={[{ id: 0, name: 'No category', icon: '' }, ...categories]}
            value={expense.category?.id || 0}
            onChange={handleCategoryChange}
            placeholder="Select a category"
          />

          {isLoading && <div className="text-xs text-gray-500 mt-1">Updating category...</div>}
        </div>

        {/* Amount, Payer, and Current User's Status */}
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Total Amount</span>
            <span className="text-lg font-semibold text-gray-900">
              ${formatAmount(expense.amount)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">Paid by</span>
            <div className="flex items-center space-x-2">
              <UserAvatar user={payer} size="xs" />
              <span className="text-sm text-gray-900">{payer?.username || 'Unknown'}</span>
            </div>
          </div>
          <div className="border-gray-200">
            <div className="border-t pt-3 flex justify-end">
              {isUserInvolved ? (
                <div className="space-y-1">
                  {isPayer && (
                    <div className="text-sm text-green-600">
                      You are owed ${formatAmount(othersOweAmount.toString())}
                    </div>
                  )}
                  {!isPayer && currentUserAmount > 0 && (
                    <div className="text-sm text-red-600 font-medium">
                      You owe ${formatAmount(currentUserAmount.toString())}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">You are not involved in this expense</div>
              )}
            </div>
          </div>
        </div>

        {/* Splits Breakdown */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Expense splits</h4>
          <div className="space-y-2">
            {expense.splits?.map(split => {
              const user = split.user;
              const isCurrentUser = user.id === currentUserId;
              return (
                <div
                  key={split.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-2">
                    <UserAvatar user={user} size="sm" />
                    <span
                      className={`text-sm ${isCurrentUser ? 'font-medium text-gray-900' : 'text-gray-700'}`}
                    >
                      {isCurrentUser ? 'You' : user.username}
                    </span>
                  </div>
                  <span
                    className={`text-sm ${isCurrentUser ? 'font-medium text-gray-900' : 'text-gray-700'}`}
                  >
                    ${formatAmount(split.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  currentUserId,
  householdMembers,
  onClick
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toFixed(2);
  };

  const getUserById = (userId: number) => {
    return householdMembers.find(member => member.id === userId);
  };

  // Get current user's split amount from the splits data
  const currentUserSplit = expense.splits?.find(split => split.user.id === currentUserId);
  const currentUserAmount = currentUserSplit ? parseFloat(currentUserSplit.amount) : 0;
  const isUserInvolved = currentUserSplit !== undefined;

  const totalAmount = parseFloat(expense.amount);

  // Check if current user is payer
  const payerId = expense.payer_id || expense.payer?.id;
  const isPayer = payerId === currentUserId;

  // Calculate what others owe the current user
  const othersOweAmount = isPayer ? totalAmount - currentUserAmount : 0;

  return (
    <div
      className="border-b border-gray-200 py-4  cursor-pointer hover:bg-gray-50 hover:border-gray-300 hover:shadow-md hover:border-l-4 hover:border-l-gray-500 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 ease-in-out rounded-lg mx-1 px-3 group"
      onClick={onClick}
    >
      <div className="space-y-2">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-gray-800 transition-colors duration-200">
            {expense.name}
          </h3>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
            {formatDate(expense.created_at)}
            {expense.category && (
              <>
                <a>&nbsp;&bull;&nbsp;</a>
                {expense.category.icon && (
                  <span className="mr-1 text-sm">{expense.category.icon}</span>
                )}
                <span className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
                  {expense.category.name}
                </span>
              </>
            )}
          </span>

          <div className="text-right">
            {isUserInvolved ? (
              isPayer ? (
                othersOweAmount > 0 && (
                  <div className="text-sm text-green-600 group-hover:text-green-700 font-medium transition-colors duration-200">
                    You are owed ${formatAmount(othersOweAmount.toString())}
                  </div>
                )
              ) : (
                currentUserAmount > 0 && (
                  <div className="text-sm text-red-600 group-hover:text-red-700 font-medium transition-colors duration-200">
                    You owe ${formatAmount(currentUserAmount.toString())}
                  </div>
                )
              )
            ) : (
              <div className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
                Not involved
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  currentUserId,
  householdMembers,
  householdId,
  onExpenseUpdated
}) => {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense);
  };

  const handleCloseDetail = () => {
    setSelectedExpense(null);
  };

  if (expenses.length === 0) {
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
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
        <p className="mb-6">Start tracking expenses for this household.</p>
      </div>
    );
  }

  // Sort expenses by creation date (newest first)
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <>
      <div className="space-y-1">
        {sortedExpenses.map(expense => (
          <ExpenseItem
            key={expense.id}
            expense={expense}
            currentUserId={currentUserId}
            householdMembers={householdMembers}
            onClick={() => handleExpenseClick(expense)}
          />
        ))}
      </div>

      {selectedExpense && (
        <ExpenseDetail
          expense={selectedExpense}
          currentUserId={currentUserId}
          householdMembers={householdMembers}
          householdId={householdId}
          onClose={handleCloseDetail}
          onExpenseUpdated={onExpenseUpdated}
        />
      )}
    </>
  );
};

export default ExpenseList;
