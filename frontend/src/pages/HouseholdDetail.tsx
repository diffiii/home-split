import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Household, User, Expense } from '../types';
import { householdAPI, expenseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Button from '../components/Button';
import UserAvatar from '../components/UserAvatar';
import ExpenseList from '../components/ExpenseList';
import AddExpense from '../components/AddExpense';
import HouseholdOptionsModal from '../components/HouseholdOptionsModal';

const HouseholdIcon: React.FC<{ name: string; size?: 'small' | 'large' }> = ({ name, size = 'large' }) => {
    const sizeClasses = size === 'small' ? 'w-16 h-16' : 'w-20 h-20';
    const textSizeClasses = size === 'small' ? 'text-xl' : 'text-2xl';

    return (
        <div className={`${sizeClasses} bg-black rounded-lg flex items-center justify-center`}>
            <span className={`text-white font-medium ${textSizeClasses}`}>
                {name.charAt(0).toUpperCase()}
            </span>
        </div>
    );
};

const MemberListItem: React.FC<{ member: User; ownerId: number }> = ({ member, ownerId }) => (
    <div className="flex items-center space-x-3">
        <UserAvatar userId={member.id} size="sm" />
        <div className="flex-1">
        <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-black">{member.username}</span>
            {member.id === ownerId && (
                <span className="text-xs bg-gray-600 text-white px-1 py-0.3 rounded-full">
                    Owner
                </span>
            )}
        </div>
        <div className="text-xs text-gray-500">{member.email}</div>
        </div>
    </div>
);

const MembersSection: React.FC<{ 
    activeMembers: User[]; 
    showMembers: boolean; 
    setShowMembers: (show: boolean) => void;
    ownerId: number;
    ownerUsername: string;
}> = ({ activeMembers, showMembers, setShowMembers, ownerId, ownerUsername }) => {
  return (
    <div>
      <div className="pt-2 space-y-2 mb-4 sm:flex sm:items-center sm:space-x-4 sm:space-y-0 sm:mb-0 text-gray-600">
        <button 
          onClick={() => setShowMembers(!showMembers)}
          className="flex items-center hover:text-black transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {activeMembers.length} member{activeMembers.length !== 1 ? 's' : ''}
          <svg className={`w-4 h-4 sm:w-5 sm:h-5 ml-1 transition-transform ${showMembers ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className="flex items-center text-gray-600">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Owner: {ownerUsername}
        </div>
      </div>
    </div>
  );
};

const MemberList: React.FC<{ 
    activeMembers: User[]; 
    ownerId: number; 
}> = ({ activeMembers, ownerId }) => (
    <div className="mt-4 pt-4 pb-4 border-t border-b border-gray-200">
        <div className="space-y-3">
            {activeMembers.map((member) => (
                <MemberListItem key={member.id} member={member} ownerId={ownerId} />
            ))}
        </div>
    </div>
);

const HouseholdDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [household, setHousehold] = useState<Household | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
    const [error, setError] = useState('');
    const [showMembers, setShowMembers] = useState(false);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showHouseholdOptions, setShowHouseholdOptions] = useState(false);

    useEffect(() => {
        if (id) {
        fetchHousehold(parseInt(id));   
        }
    }, [id]);

    useEffect(() => {
        if (household) {
            fetchExpenses(household.id);
        }
    }, [household]);

    const fetchHousehold = async (householdId: number) => {
        try {
            setIsLoading(true);
            const householdData = await householdAPI.getHousehold(householdId);
            setHousehold(householdData);
        } catch (err: any) {
            setError('Failed to fetch household details');  
        } finally {
            setIsLoading(false);
        }
    };

    const fetchExpenses = async (householdId: number) => {
        try {
            setIsLoadingExpenses(true);
            const expensesData = await expenseAPI.getExpenses(householdId);
            setExpenses(expensesData);
        } finally {
            setIsLoadingExpenses(false);
        }
    };

    const handleExpenseAdded = () => {
        setShowAddExpense(false);
        if (household) {
            fetchExpenses(household.id);
        }
    };

    const handleHouseholdUpdated = (updatedHousehold: Household) => {
        setHousehold(updatedHousehold);
    };

    const handleHouseholdDeleted = () => {
        navigate('/dashboard');
    };

    if (isLoading) {
        return (
        <div className="min-h-screen bg-white">
            <Header />
            <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2 text-gray-600">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading household details...</span>
            </div>
            </div>
        </div>
        );
    }

    if (error || !household) {
        return (
        <div className="min-h-screen bg-white">
            <Header />
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="text-center py-12">
                    <div className="text-red-600 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {error || 'Household not found'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        The household you're looking for could not be loaded.
                    </p>
                    <Button onClick={() => navigate('/dashboard')} variant="primary">
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        </div>
        );
    }

    const activeMembers = household.members.filter(member => member.is_active !== false);
    const isOwner = user?.id === household.owner.id;

    return (
        <div className="min-h-screen bg-white">
        <Header />
        
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex justify-between items-center">
                <Button 
                    onClick={() => navigate('/dashboard')} 
                    variant="outline"
                    className="flex items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </Button>
                
                {isOwner && (
                    <Button
                        onClick={() => setShowHouseholdOptions(true)}
                        variant="outline"
                        className="flex items-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Options</span>
                    </Button>
                )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-8 mb-8">
            <div className="hidden sm:flex items-center space-x-6 mb-6">
                <HouseholdIcon name={household.name} />
                <div className="flex-1">
                <h1 className="text-3xl font-light text-black mb-2">
                    {household.name}
                </h1>
                <MembersSection 
                    activeMembers={activeMembers}
                    showMembers={showMembers}
                    setShowMembers={setShowMembers}
                    ownerId={household.owner.id}
                    ownerUsername={household.owner.username}
                />
                </div>
            </div>

            <div className="hidden sm:block">
                {showMembers && (
                <MemberList
                    activeMembers={activeMembers}
                    ownerId={household.owner.id}
                />
                )}
            </div>
            <div className="sm:hidden">
                <div className="flex items-center space-x-4 mb-4">
                <HouseholdIcon name={household.name} size="small" />
                <div className="flex-1">
                    <h1 className="text-2xl font-light text-black">
                    {household.name}
                    </h1>
                </div>
                </div>
                
                <MembersSection 
                activeMembers={activeMembers}
                showMembers={showMembers}
                setShowMembers={setShowMembers}
                ownerId={household.owner.id}
                ownerUsername={household.owner.username}
                />
                {showMembers && (
                <div className="mt-6">
                    <MemberList
                    activeMembers={activeMembers}
                    ownerId={household.owner.id}
                    />
                </div>
                )}
            </div>
            
            {household.description && (
                <p className="pt-4 text-gray-600 text-base sm:text-lg leading-relaxed">
                    {household.description}
                </p>
            )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-medium text-black">Expenses</h2>
                    <div className="flex space-x-3">
                        <Button 
                            variant="primary" 
                            onClick={() => setShowAddExpense(true)}
                        >
                            Add Expense
                        </Button>
                    </div>
                </div>
                
                {isLoadingExpenses ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Loading expenses...</span>
                        </div>
                    </div>
                ) : user ? (
                    <ExpenseList 
                        expenses={expenses}
                        currentUserId={user.id}
                        householdMembers={activeMembers}
                    />
                ) : null}
            </div>

            {/* Add Expense Modal */}
            {showAddExpense && user && (
                <AddExpense
                    householdId={household.id}
                    householdMembers={activeMembers}
                    currentUserId={user.id}
                    onExpenseAdded={handleExpenseAdded}
                    onCancel={() => setShowAddExpense(false)}
                />
            )}

            {/* Household Options Modal */}
            {showHouseholdOptions && user && isOwner && (
                <HouseholdOptionsModal
                    isOpen={showHouseholdOptions}
                    onClose={() => setShowHouseholdOptions(false)}
                    household={household}
                    currentUser={user}
                    onHouseholdUpdated={handleHouseholdUpdated}
                    onHouseholdDeleted={handleHouseholdDeleted}
                />
            )}
        </main>
        </div>
    );
};

export default HouseholdDetail;
