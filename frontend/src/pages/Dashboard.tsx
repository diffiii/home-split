import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Household, Membership, RawMembership } from '../types';
import { householdAPI, membershipAPI } from '../services/api';
import Header from '../components/Header';
import Button from '../components/Button';
import HouseholdCard from '../components/HouseholdCard';
import InvitationCard from '../components/InvitationCard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
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
      const rawMemberships = await membershipAPI.getMemberships();
      const activeMemberships = rawMemberships.filter(membership => membership.is_active);
      
      const uniqueHouseholdIds = Array.from(new Set(activeMemberships.map(membership => membership.household)));
      
      const activeHouseholdsPromises = uniqueHouseholdIds.map(async (householdId: number) => {
        try {
          return await householdAPI.getHousehold(householdId);
        } catch (error) {
          console.error('Failed to fetch household:', error);
          return null;
        }
      });
      
      const householdsData = (await Promise.all(activeHouseholdsPromises))
        .filter((household): household is Household => household !== null);
      
      const pending = rawMemberships.filter(membership => 
        !membership.is_active && membership.user === user?.id
      );
      
      const pendingWithHouseholds: Membership[] = await Promise.all(
        pending.map(async (membership: RawMembership): Promise<Membership> => {
          try {
            const household = await householdAPI.getHousehold(membership.household);
            return {
              ...membership,
              user: user!,
              household: household
            };
          } catch (error) {
            console.error('Failed to fetch household details for invitation:', error);
            return {
              ...membership,
              user: user!,
              household: {
                id: membership.household,
                name: 'Unknown Household',
                owner: { 
                  id: 0, 
                  email: 'unknown@example.com', 
                  username: 'Unknown User' 
                },
                description: '',
                members: [],
                created_at: ''
              }
            };
          }
        })
      );
      
      setHouseholds(householdsData);
      setPendingInvitations(pendingWithHouseholds);
    } catch (err: any) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const newHousehold = await householdAPI.createHousehold({
        name: newHouseholdName,
        description: newHouseholdDescription || undefined,
      });
      setHouseholds([...households, newHousehold]);
      setNewHouseholdName('');
      setNewHouseholdDescription('');
      setShowCreateForm(false);
    } catch (err: any) {
      setError(err.response?.data?.name?.[0] || 'Failed to create household');
    }
  };

  const handleViewHousehold = (household: Household) => {
    console.log('Viewing household:', household.name);
    alert(`Household detail page will be implemented soon for: ${household.name}`);
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
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2 text-gray-600">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading your dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-black">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Ready to manage your households and keep everything organized?
          </p>
        </div>
        <div className="mt-6 md:mt-0">
          <div className={`grid ${pendingInvitations.length > 0 ? 'grid-cols-2' : 'grid-cols-1'} gap-4 text-center`}>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-medium text-black">{households.length}</div>
              <div className="text-sm text-gray-600">Households</div>
              </div>
              {pendingInvitations.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-2xl font-medium text-black">{pendingInvitations.length}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>

        {/* Pending Invitations Section */}
        {pendingInvitations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-light text-black mb-6">Pending Invitations</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingInvitations.map((invitation) => (
                <InvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  onAccept={handleAcceptInvitation}
                  onDecline={handleDeclineInvitation}
                />
              ))}
            </div>
          </div>
        )}

        {/* Create Household Section */}
        <div className="mb-8">
          {!showCreateForm ? (
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-light text-black">Your Households</h2>
              <Button 
                onClick={() => setShowCreateForm(true)}
                variant="primary"
                className="flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Household
              </Button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <h2 className="text-2xl font-light text-black mb-6">Create New Household</h2>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateHousehold} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Household Name *
                  </label>
                  <input
                    type="text"
                    value={newHouseholdName}
                    onChange={(e) => setNewHouseholdName(e.target.value)}
                    placeholder="e.g., Main Street Apartment, Smith Family Home"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newHouseholdDescription}
                    onChange={(e) => setNewHouseholdDescription(e.target.value)}
                    placeholder="Add details about this household..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-all resize-none"
                  />
                </div>

                <div className="flex space-x-4">
                  <Button 
                    type="submit"
                    variant="primary"
                  >
                    Create Household
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewHouseholdName('');
                      setNewHouseholdDescription('');
                      setError('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Households Grid */}
        <div>
          {households.length === 0 && pendingInvitations.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white border border-gray-200 rounded-lg p-12 max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V7a2 2 0 012-2h4a2 2 0 012 2v0" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-black mb-2">No households yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first household to start organizing and managing your living space.
                </p>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  variant="primary"
                >
                  Get Started
                </Button>
              </div>
            </div>
          ) : households.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                You don't have any active households yet. Check your pending invitations above or create a new household.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {households.map((household) => (
                <HouseholdCard
                  key={household.id}
                  household={household}
                  onViewHousehold={handleViewHousehold}
                  onHouseholdUpdated={handleHouseholdUpdated}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
