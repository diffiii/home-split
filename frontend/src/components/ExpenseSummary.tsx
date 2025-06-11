import React from 'react';
import { HouseholdExpenseSummary } from '../types';

interface ExpenseSummaryProps {
  summary: HouseholdExpenseSummary;
  isLoading?: boolean;
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ summary, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center justify-center py-6 sm:py-8">
          <div className="flex items-center space-x-2 text-gray-600">
            <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
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
            <span className="text-sm sm:text-base">Loading expense summary...</span>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const userBalance = summary.user_balance;
  const isOwedMoney = userBalance > 0;
  const isOwingMoney = userBalance < 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex items-center mb-3 sm:mb-4">
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="text-base sm:text-lg font-medium text-black">Expense Summary</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Expenses</div>
          <div className="text-lg sm:text-2xl font-semibold text-black">{summary.total_expenses}</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Amount</div>
          <div className="text-lg sm:text-2xl font-semibold text-black">
            {formatCurrency(parseFloat(summary.total_amount.toString()))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Settled</div>
          <div className="text-lg sm:text-2xl font-semibold text-black">
            {formatCurrency(parseFloat(summary.total_settled.toString()))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">Unsettled</div>
          <div className="text-lg sm:text-2xl font-semibold text-black">
            {formatCurrency(parseFloat(summary.total_unsettled.toString()))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-3 sm:pt-4">
        <h4 className="text-sm sm:text-md font-medium text-black mb-2 sm:mb-3">Your Balance</h4>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">You Paid</div>
            <div className="text-base sm:text-xl font-semibold text-black">
              {formatCurrency(parseFloat(summary.user_amount_paid.toString()))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">You Owe</div>
            <div className="text-base sm:text-xl font-semibold text-black">
              {formatCurrency(parseFloat(summary.user_amount_owed.toString()))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-2 sm:p-4 col-span-2 lg:col-span-1">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Net Balance</div>
            <div className={`text-base sm:text-xl font-semibold ${
              userBalance > 0 ? 'text-green-600' : 
              userBalance < 0 ? 'text-red-600' : 
              'text-black'
            }`}>
              {userBalance === 0 ? 'Even' : formatCurrency(Math.abs(userBalance))}
              {isOwedMoney && <span className="block text-xs text-gray-500">(owed to you)</span>}
              {isOwingMoney && <span className="block text-xs text-gray-500">(you owe)</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSummary;
