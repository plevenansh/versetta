"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/client';
import CreateTeamForm from '@/components/CreateTeamForm';
import TeamCard from '@/components/TeamCard';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

const TeamsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const router = useRouter();

  const { data: userTeams, isLoading, refetch } = trpc.teams.getUserTeams.useQuery(
    { workOsUserId: user?.workOsUserId || '' },
    { enabled: !!user?.workOsUserId }
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user');
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  const handleTeamCreated = () => {
    setShowCreateForm(false);
    refetch();
    router.push('/dashboard');
  };

  if (isLoading) return <div>Loading teams...</div>;

  return (
    <div>
    <div className="container  mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Teams</h1>
      <Button 
        onClick={() => setShowCreateForm(!showCreateForm)} 
        className="mb-6 rounded-3xl bg-blue-500 hover:bg-blue-600"
      >
        <Plus className="mr-2 h-4 w-4" /> {showCreateForm ? 'Cancel' : 'Create New Team'}
      </Button>
      
      {showCreateForm && (
        <div className="mb-8">
          <CreateTeamForm onTeamCreated={handleTeamCreated} />
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userTeams?.map(team => (
          <TeamCard key={team.id} team={team} onTeamUpdated={refetch} />
        ))}
      </div>
    </div>
    </div>
  );
};

export default TeamsPage;