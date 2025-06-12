import React, { useState, useEffect } from 'react';
import { 
  HouseholdBalances, 
  SettlementPlan, 
  ProcessSettlementData, 
  ProcessSettlementResult,
  User 
} from '../types';
import { settlementAPI } from '../services/api';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import UserAvatar from './UserAvatar';

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  householdId: number;
  householdName: string;
  currentUserId: number;
  householdMembers: User[];
  onSettlementProcessed?: () => void;
}

const SettlementModal: React.FC<SettlementModalProps> = ({
  isOpen,
  onClose,
  householdId,
  householdName,
  currentUserId,
  householdMembers,
  onSettlementProcessed
}) => {
  const [balances, setBalances] = useState<HouseholdBalances | null>(null);
  const [settlementPlan, setSettlementPlan] = useState<SettlementPlan | null>(null);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'statistics' | 'settlements'>('statistics');
  
  // Settlement processing state
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedPayerId, setSelectedPayerId] = useState<number | null>(null);
  const [selectedPayeeId, setSelectedPayeeId] = useState<number | null>(null);
  const [settlementAmount, setSettlementAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<ProcessSettlementResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, householdId]);

  const fetchData = async () => {
    setError('');
    await Promise.all([fetchBalances(), fetchSettlementPlan()]);
  };

  const fetchBalances = async () => {
    try {
      setIsLoadingBalances(true);
      const balancesData = await settlementAPI.getHouseholdBalances(householdId);
      setBalances(balancesData);
    } catch (err: any) {
      setError('Failed to fetch balances');
      console.error('Failed to fetch balances:', err);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  const fetchSettlementPlan = async () => {
    try {
      setIsLoadingPlan(true);
      const planData = await settlementAPI.getSettlementPlan(householdId);
      setSettlementPlan(planData);
    } catch (err: any) {
      setError('Failed to fetch settlement plan');
      console.error('Failed to fetch settlement plan:', err);
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  const handleProcessSettlement = async (payerId: number, payeeId: number, amount?: number) => {
    setSelectedPayerId(payerId);
    setSelectedPayeeId(payeeId);
    if (amount) {
      setSettlementAmount(amount.toFixed(2));
    }
    setShowProcessModal(true);
  };

  const processSettlement = async () => {
    if (!selectedPayerId || !selectedPayeeId || !settlementAmount) {
      return;
    }

    const amount = parseFloat(settlementAmount);
    if (amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');
      
      const data: ProcessSettlementData = {
        payer_id: selectedPayerId,
        payee_id: selectedPayeeId,
        amount
      };

    const result = await settlementAPI.processSettlement(householdId, data);
    console.log(result);
    setProcessingResult(result);
      
      // Refresh data
      await fetchData();
      
      // Notify parent
      if (onSettlementProcessed) {
        onSettlementProcessed();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process settlement');
    } finally {
      setIsProcessing(false);
    }
  };

  const closeProcessModal = () => {
    setShowProcessModal(false);
    setSelectedPayerId(null);
    setSelectedPayeeId(null);
    setSettlementAmount('');
    setProcessingResult(null);
    setError('');
  };

  const getUserName = (userId: number) => {
    const user = householdMembers.find(m => m.id === userId);
    return user?.username || 'Unknown User';
  };

  const totalUnsettledExpenses = balances?.balances.reduce((sum, userBalance) => 
    sum + Math.abs(userBalance.balance), 0) || 0;
  const memberCount = balances?.balances.length || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Statistics & Settlements">
      <div className="max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 -mx-6 px-6 -mt-2">
          <button
            onClick={() => setActiveTab('statistics')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'statistics'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Members Statistics
          </button>
          <button
            onClick={() => setActiveTab('settlements')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'settlements'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Settle Up
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pt-6 -mx-6 px-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="space-y-6">
              {/* Summary Section */}
              {balances && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Total Unsettled Expenses</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(totalUnsettledExpenses / 2)}
                    </span>
                  </div>
                  <div className="border-t border-dashed border-gray-300 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Total Members</span>
                      <span className="text-lg font-semibold text-gray-900">{memberCount}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Balances</h3>
                {isLoadingBalances ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Loading balances...</span>
                    </div>
                  </div>
                ) : balances ? (
                  <div className="grid gap-4">
                    {balances.balances.map((userBalance) => (
                      <div
                        key={userBalance.user_id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <UserAvatar userId={userBalance.user_id} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {userBalance.username}
                              {userBalance.user_id === currentUserId && (
                                <span className="ml-2 text-xs bg-gray-300 text-black px-1.5 py-0.4 rounded-full">You</span>
                              )}
                            </p>
                            <div className="text-xs text-gray-500">
                              {userBalance.balance > 0 && 'is owed'}
                              {userBalance.balance < 0 && 'owes'}
                              {userBalance.balance === 0 && 'No balance'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-semibold ${
                            userBalance.balance > 0 
                              ? 'text-green-600' 
                              : userBalance.balance < 0 
                                ? 'text-red-600' 
                                : 'text-gray-600'
                          }`}>
                            {userBalance.balance === 0 ? 'Even' : formatCurrency(userBalance.balance)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No balance data available
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settlements' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Optimal Settlement Plan</h3>
                {isLoadingPlan ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Loading settlement plan...</span>
                    </div>
                  </div>
                ) : settlementPlan && settlementPlan.settlement_plan.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-blue-800 text-sm font-medium">
                          {settlementPlan.total_transactions} transaction{settlementPlan.total_transactions !== 1 ? 's' : ''} needed to settle all debts
                        </span>
                      </div>
                    </div>
                    
                    {settlementPlan.settlement_plan.map((transaction, index) => (
                      <div
                        key={index}
                        className="p-3 bg-white border border-gray-200 rounded-lg space-y-3"
                      >
                        {/* Transaction flow with amount */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="flex items-center space-x-1.5">
                              <UserAvatar userId={transaction.payer_id} size="xs" />
                              <span className="text-sm font-medium text-gray-900">{transaction.payer_username}</span>
                            </div>
                            
                            <span className="text-gray-400 text-sm">→</span>
                            
                            <div className="flex items-center space-x-1.5">
                              <UserAvatar userId={transaction.payee_id} size="xs" />
                              <span className="text-sm font-medium text-gray-900">{transaction.payee_username}</span>
                            </div>
                          </div>
                          
                          <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(transaction.amount)}
                          </div>
                        </div>
                        
                        {/* Action button - only visible to payees */}
                        {transaction.payee_id === currentUserId && (
                          <div className="flex justify-center pt-2 border-t border-gray-100">
                            <Button
                              onClick={() => handleProcessSettlement(transaction.payer_id, transaction.payee_id, transaction.amount)}
                              size="sm"
                              className="whitespace-nowrap"
                            >
                              Process Payment
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-green-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All settled up!</h3>
                    <p className="text-gray-500">No payments needed - everyone is even.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Process Settlement Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Settlement</h3>
            
            {processingResult ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-800 font-medium">Settlement Processed Successfully!</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>{processingResult.payer_username}</strong> paid <strong>{processingResult.payee_username}</strong> {formatCurrency(processingResult.payment_amount)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Optimal amount was: {formatCurrency(processingResult.optimal_amount)}
                  </p>
                  {processingResult.actions_taken.map((action, index) => (
                    <p key={index} className="text-sm text-gray-600">• {action}</p>
                  ))}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button onClick={closeProcessModal}>Close</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p><strong>{getUserName(selectedPayerId!)}</strong> pays <strong>{getUserName(selectedPayeeId!)}</strong></p>
                </div>
                
                <Input
                  label="Amount"
                  type="text"
                  value={settlementAmount}
                  onChange={(e) => setSettlementAmount(e.target.value)}
                  placeholder="0.00"
                  onInput={(e) => {
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
                />
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={closeProcessModal}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={processSettlement}
                    disabled={isProcessing || !settlementAmount}
                  >
                    {isProcessing ? 'Processing...' : 'Process Payment'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default SettlementModal;
