import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Household, Membership, RawMembership } from '../types';
import { householdAPI, membershipAPI, expenseAPI } from '../services/api';
import Header from '../components/Header';
import Button from '../components/Button';
import HouseholdCard from '../components/HouseholdCard';
import InvitationCard from '../components/InvitationCard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [households, setHouseholds] = useState<Household[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newHouseholdName, setNewHouseholdName] = useState('');
  const [newHouseholdDescription, setNewHouseholdDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const rawMemberships = await membershipAPI.getMemberships();

      const activeHouseholds = await fetchActiveHouseholds(rawMemberships);
      const pendingInvitations = await fetchPendingInvitations(rawMemberships);

      setHouseholds(activeHouseholds);
      setPendingInvitations(pendingInvitations);
    } catch (err: any) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActiveHouseholds = async (rawMemberships: RawMembership[]): Promise<Household[]> => {
    const activeMemberships = rawMemberships.filter(membership => membership.is_active);
    const uniqueHouseholdIds = Array.from(
      new Set(activeMemberships.map(membership => membership.household))
    );

    const householdPromises = uniqueHouseholdIds.map(async (householdId: number) => {
      try {
        return await householdAPI.getHousehold(householdId);
      } catch (error) {
        console.error('Failed to fetch household:', error);
        return null;
      }
    });

    return (await Promise.all(householdPromises)).filter(
      (household): household is Household => household !== null
    );
  };

  const fetchPendingInvitations = async (
    rawMemberships: RawMembership[]
  ): Promise<Membership[]> => {
    const pending = rawMemberships.filter(
      membership => !membership.is_active && membership.user === user?.id
    );

    return await Promise.all(
      pending.map(async (membership: RawMembership): Promise<Membership> => {
        try {
          const household = await householdAPI.getHousehold(membership.household);
          return { ...membership, user: user!, household };
        } catch (error) {
          console.error('Failed to fetch household details for invitation:', error);
          return {
            ...membership,
            user: user!,
            household: createFallbackHousehold(membership.household)
          };
        }
      })
    );
  };

  const createFallbackHousehold = (householdId: number): Household => ({
    id: householdId,
    name: 'Unknown Household',
    owner: { id: 0, email: 'unknown@example.com', username: 'Unknown User' },
    description: '',
    members: [],
    created_at: ''
  });

  const createDefaultCategories = async (householdId: number) => {
    const defaultCategories = [
      { name: 'Housing', icon: '🏠' },
      { name: 'Food', icon: '🍽️' },
      { name: 'Entertainment', icon: '🎬' },
      { name: 'Transport', icon: '🚗' },
      { name: 'Life & Personal', icon: '👤' },
      { name: 'Other', icon: '📝' }
    ];

    try {
      for (const category of defaultCategories) {
        await expenseAPI.createExpenseCategory({
          household_id: householdId,
          name: category.name,
          icon: category.icon
        });
      }
    } catch (err) {
      console.error('Failed to create default categories:', err);
    }
  };

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const newHousehold = await householdAPI.createHousehold({
        name: newHouseholdName,
        description: newHouseholdDescription || undefined
      });

      createDefaultCategories(newHousehold.id);

      setHouseholds(prev => [...prev, newHousehold]);
      resetCreateForm();
    } catch (err: any) {
      setError(err.response?.data?.name?.[0] || 'Failed to create household');
    }
  };

  const resetCreateForm = () => {
    setNewHouseholdName('');
    setNewHouseholdDescription('');
    setShowCreateForm(false);
    setError('');
  };

  const handleViewHousehold = (household: Household) => {
    navigate(`/household/${household.id}`);
  };

  const handleAcceptInvitation = async (membershipId: number) => {
    setPendingInvitations(prev => prev.filter(inv => inv.id !== membershipId));
    await fetchDashboardData();
  };

  const handleDeclineInvitation = (membershipId: number) => {
    setPendingInvitations(prev => prev.filter(inv => inv.id !== membershipId));
  };

  const handleHouseholdUpdated = () => {
    fetchDashboardData();
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <WelcomeSection
          username={user?.username}
          householdsCount={households.length}
          pendingCount={pendingInvitations.length}
        />

        {pendingInvitations.length > 0 && (
          <PendingInvitationsSection
            invitations={pendingInvitations}
            onAccept={handleAcceptInvitation}
            onDecline={handleDeclineInvitation}
          />
        )}

        <CreateHouseholdSection
          showForm={showCreateForm}
          onToggleForm={setShowCreateForm}
          onSubmit={handleCreateHousehold}
          onReset={resetCreateForm}
          formData={{ name: newHouseholdName, description: newHouseholdDescription }}
          onFormChange={{
            setName: setNewHouseholdName,
            setDescription: setNewHouseholdDescription
          }}
          error={error}
        />

        <HouseholdsGrid
          households={households}
          pendingInvitations={pendingInvitations}
          onViewHousehold={handleViewHousehold}
          onHouseholdUpdated={handleHouseholdUpdated}
          onShowCreateForm={() => setShowCreateForm(true)}
        />
      </main>
    </div>
  );
};

const LoadingState: React.FC = () => (
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
        <span>Loading your dashboard...</span>
      </div>
    </div>
  </div>
);

interface WelcomeSectionProps {
  username?: string;
  householdsCount: number;
  pendingCount: number;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  username,
  householdsCount,
  pendingCount
}) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
    <div className="flex flex-col md:flex-row md:items-center justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl font-light text-black">Welcome back, {username}! 👋</h1>
        <p className="text-gray-600 mt-2 text-base sm:text-lg">
          Ready to manage your households and keep everything organized?
        </p>
      </div>
      <div className="mt-4 md:mt-0">
        <div
          className={`grid ${pendingCount > 0 ? 'grid-cols-2' : 'grid-cols-1'} gap-3 sm:gap-4 text-center`}
        >
          <StatsCard count={householdsCount} label="Households" />
          {pendingCount > 0 && <StatsCard count={pendingCount} label="Pending" />}
        </div>
      </div>
    </div>
  </div>
);

interface StatsCardProps {
  count: number;
  label: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ count, label }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
    <div className="text-xl sm:text-2xl font-medium text-black">{count}</div>
    <div className="text-xs sm:text-sm text-gray-600">{label}</div>
  </div>
);

interface PendingInvitationsSectionProps {
  invitations: Membership[];
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
}

const PendingInvitationsSection: React.FC<PendingInvitationsSectionProps> = ({
  invitations,
  onAccept,
  onDecline
}) => (
  <div className="mb-8">
    <h2 className="text-xl sm:text-2xl font-light text-black mb-4 sm:mb-6">Pending Invitations</h2>
    <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {invitations.map(invitation => (
        <InvitationCard
          key={invitation.id}
          invitation={invitation}
          onAccept={onAccept}
          onDecline={onDecline}
        />
      ))}
    </div>
  </div>
);

interface CreateHouseholdSectionProps {
  showForm: boolean;
  onToggleForm: (show: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  formData: { name: string; description: string };
  onFormChange: { setName: (name: string) => void; setDescription: (desc: string) => void };
  error: string;
}

const CreateHouseholdSection: React.FC<CreateHouseholdSectionProps> = ({
  showForm,
  onToggleForm,
  onSubmit,
  onReset,
  formData,
  onFormChange,
  error
}) => (
  <div className="mb-8">
    {!showForm ? (
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-light text-black">Your Households</h2>
        <Button
          onClick={() => onToggleForm(true)}
          variant="primary"
          className="flex items-center justify-center sm:justify-start"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Create Household
        </Button>
      </div>
    ) : (
      <CreateHouseholdForm
        onSubmit={onSubmit}
        onCancel={onReset}
        formData={formData}
        onFormChange={onFormChange}
        error={error}
      />
    )}
  </div>
);

interface CreateHouseholdFormProps {
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  formData: { name: string; description: string };
  onFormChange: { setName: (name: string) => void; setDescription: (desc: string) => void };
  error: string;
}

const CreateHouseholdForm: React.FC<CreateHouseholdFormProps> = ({
  onSubmit,
  onCancel,
  formData,
  onFormChange,
  error
}) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8">
    <h2 className="text-xl sm:text-2xl font-light text-black mb-4 sm:mb-6">Create New Household</h2>

    {error && (
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
        {error}
      </div>
    )}

    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Household Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={e => onFormChange.setName(e.target.value)}
          placeholder="e.g., Main Street Apartment, Smith Family Home"
          required
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-all text-sm sm:text-base"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          value={formData.description}
          onChange={e => onFormChange.setDescription(e.target.value)}
          placeholder="Add details about this household..."
          rows={3}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-all resize-none text-sm sm:text-base"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button type="submit" variant="primary" className="flex-1">
          Create Household
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  </div>
);

interface HouseholdsGridProps {
  households: Household[];
  pendingInvitations: Membership[];
  onViewHousehold: (household: Household) => void;
  onHouseholdUpdated: () => void;
  onShowCreateForm: () => void;
}

const HouseholdsGrid: React.FC<HouseholdsGridProps> = ({
  households,
  pendingInvitations,
  onViewHousehold,
  onHouseholdUpdated,
  onShowCreateForm
}) => {
  if (households.length === 0 && pendingInvitations.length === 0) {
    return <EmptyState onShowCreateForm={onShowCreateForm} />;
  }

  if (households.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">
          You don't have any active households yet. Check your pending invitations above or create a
          new household.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {households.map(household => (
        <HouseholdCard
          key={household.id}
          household={household}
          onViewHousehold={onViewHousehold}
          onHouseholdUpdated={onHouseholdUpdated}
        />
      ))}
    </div>
  );
};

interface EmptyStateProps {
  onShowCreateForm: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onShowCreateForm }) => (
  <div className="text-center py-12 sm:py-16">
    <div className="bg-white border border-gray-200 rounded-lg p-8 sm:p-12 max-w-md mx-auto">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 sm:mb-6">
        <svg
          className="w-8 h-8 sm:w-10 sm:h-10 text-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V7a2 2 0 012-2h4a2 2 0 012 2v0"
          />
        </svg>
      </div>
      <h3 className="text-lg sm:text-xl font-medium text-black mb-2">No households yet</h3>
      <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
        Create your first household to start organizing and managing your living space.
      </p>
      <Button onClick={onShowCreateForm} variant="primary">
        Get Started
      </Button>
    </div>
  </div>
);

export default Dashboard;
