import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Household, User, Expense, Task, HouseholdExpenseSummary } from '../types';
import { householdAPI, expenseAPI, taskAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Button from '../components/Button';
import UserAvatar from '../components/UserAvatar';
import ExpenseList from '../components/ExpenseList';
import AddExpense from '../components/AddExpense';
import HouseholdOptionsModal from '../components/HouseholdOptionsModal';
import CategoryManagement from '../components/CategoryManagement';
import TaskList from '../components/TaskList';
import AddTask from '../components/AddTask';
import Modal from '../components/Modal';
import InviteMember from '../components/InviteMember';
import ExpenseSummary from '../components/ExpenseSummary';

const HouseholdIcon: React.FC<{ name: string; size?: 'small' | 'large' }> = ({
  name,
  size = 'large'
}) => {
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
          <span className="text-xs bg-gray-600 text-white px-1 py-0.3 rounded-full">Owner</span>
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
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {activeMembers.length} member{activeMembers.length !== 1 ? 's' : ''}
          <svg
            className={`w-4 h-4 sm:w-5 sm:h-5 ml-1 transition-transform ${showMembers ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className="flex items-center text-gray-600">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
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
  isOwner: boolean;
  onInviteClick: () => void;
}> = ({ activeMembers, ownerId, isOwner, onInviteClick }) => (
  <div className="mt-4 pt-4 pb-4 border-t border-b border-gray-200">
    <div className="space-y-3">
      {activeMembers.map(member => (
        <MemberListItem key={member.id} member={member} ownerId={ownerId} />
      ))}
    </div>
    {isOwner && (
      <div className="mt-2 pt-3 border-gray-100 flex justify-start">
        <Button
          variant="outline"
          size="md"
          onClick={onInviteClick}
          className="flex items-center justify-center text-xs px-3"
        >
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Invite Member
        </Button>
      </div>
    )}
  </div>
);

const HouseholdDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expenseSummary, setExpenseSummary] = useState<HouseholdExpenseSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'expenses' | 'tasks'>('expenses');
  const [showMembers, setShowMembers] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showHouseholdOptions, setShowHouseholdOptions] = useState(false);
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);

  useEffect(() => {
    if (id) {
      fetchHousehold(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    if (household) {
      fetchExpenses(household.id);
      fetchTasks(household.id);
      fetchExpenseSummary(household.id);
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

  const fetchTasks = async (householdId: number) => {
    try {
      setIsLoadingTasks(true);
      const tasksData = await taskAPI.getTasks(householdId);
      setTasks(tasksData);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const fetchExpenseSummary = async (householdId: number) => {
    try {
      setIsLoadingSummary(true);
      const summaryData = await expenseAPI.getHouseholdExpenseSummary(householdId);
      setExpenseSummary(summaryData);
    } catch (err: any) {
      console.error('Failed to fetch expense summary:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleExpenseAdded = () => {
    setShowAddExpense(false);
    if (household) {
      fetchExpenses(household.id);
      fetchExpenseSummary(household.id);
    }
  };

  const handleTaskAdded = () => {
    setShowAddTask(false);
    if (household) {
      fetchTasks(household.id);
    }
  };

  const handleTaskUpdated = () => {
    if (household) {
      fetchTasks(household.id);
    }
  };

  const handleHouseholdUpdated = (updatedHousehold: Household) => {
    setHousehold(updatedHousehold);
  };

  const handleHouseholdDeleted = () => {
    navigate('/dashboard');
  };

  const handleInviteMemberSent = () => {
    setShowInviteMember(false);
    if (household) {
      fetchHousehold(household.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-64">
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
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Options</span>
            </Button>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-8 mb-8">
          <div className="hidden sm:flex items-center space-x-6 mb-6">
            <HouseholdIcon name={household.name} />
            <div className="flex-1">
              <h1 className="text-3xl font-light text-black mb-2">{household.name}</h1>
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
                isOwner={isOwner}
                onInviteClick={() => setShowInviteMember(true)}
              />
            )}
          </div>
          <div className="sm:hidden">
            <div className="flex items-center space-x-4 mb-4">
              <HouseholdIcon name={household.name} size="small" />
              <div className="flex-1">
                <h1 className="text-2xl font-light text-black">{household.name}</h1>
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
                  isOwner={isOwner}
                  onInviteClick={() => setShowInviteMember(true)}
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
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'expenses'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tasks'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Tasks
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'expenses' ? (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-3 sm:space-y-0">
                <h2 className="text-xl font-medium text-black">Expenses</h2>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => setShowCategoryManagement(true)}
                    className="w-full sm:w-auto flex items-center justify-center"
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
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    Manage Categories
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setShowAddExpense(true)}
                    className="w-full sm:w-auto"
                  >
                    Add Expense
                  </Button>
                </div>
              </div>

              {/* Expense Summary */}
              {expenseSummary && (
                <ExpenseSummary 
                  summary={expenseSummary} 
                  isLoading={isLoadingSummary} 
                />
              )}

              {isLoadingExpenses ? (
                <div className="flex items-center justify-center py-12">
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
                    <span>Loading expenses...</span>
                  </div>
                </div>
              ) : user ? (
                <ExpenseList
                  expenses={expenses}
                  currentUserId={user.id}
                  householdMembers={activeMembers}
                  householdId={household.id}
                  onExpenseUpdated={() => {
                    fetchExpenses(household.id);
                    fetchExpenseSummary(household.id);
                  }}
                />
              ) : null}
            </>
          ) : (
            <>
              {tasks.length === 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-3 sm:space-y-0">
                  <h2 className="text-xl font-medium text-black">Tasks</h2>
                  <div className="flex w-full sm:w-auto">
                    <Button
                      variant="primary"
                      onClick={() => setShowAddTask(true)}
                      className="w-full sm:w-auto flex items-center justify-center"
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Add Task
                    </Button>
                  </div>
                </div>
              )}

              {isLoadingTasks ? (
                <div className="flex items-center justify-center py-12">
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
                    <span>Loading tasks...</span>
                  </div>
                </div>
              ) : user ? (
                <TaskList
                  tasks={tasks}
                  currentUserId={user.id}
                  householdMembers={activeMembers}
                  onTaskUpdated={handleTaskUpdated}
                  householdId={household.id}
                  addTaskButton={
                    <Button
                      variant="primary"
                      onClick={() => setShowAddTask(true)}
                      className="w-full sm:w-auto flex items-center justify-center"
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Add Task
                    </Button>
                  }
                />
              ) : null}
            </>
          )}
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

        {/* Add Task Modal */}
        {showAddTask && user && (
          <AddTask
            householdId={household.id}
            onTaskAdded={handleTaskAdded}
            onCancel={() => setShowAddTask(false)}
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

        {/* Category Management Modal */}
        {showCategoryManagement && (
          <CategoryManagement
            isOpen={showCategoryManagement}
            onClose={() => setShowCategoryManagement(false)}
            householdId={household.id}
            isOwner={isOwner}
          />
        )}

        {/* Invite Member Modal */}
        {showInviteMember && user && isOwner && (
          <Modal
            isOpen={showInviteMember}
            onClose={() => setShowInviteMember(false)}
            title="Invite New Member"
          >
            <InviteMember
              householdId={household.id}
              onInviteSent={handleInviteMemberSent}
              onCancel={() => setShowInviteMember(false)}
            />
          </Modal>
        )}
      </main>
    </div>
  );
};

export default HouseholdDetail;
