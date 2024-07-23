"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from '@/trpc/client';

export default function TeamOnboarding() {
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [teamIdToJoin, setTeamIdToJoin] = useState('');
  const [notification, setNotification] = useState(null);
  const [createdTeamId, setCreatedTeamId] = useState(null);

  const createTeamMutation = trpc.teams.create.useMutation({
    onSuccess: (data) => {
      setNotification({ type: 'success', message: 'Team created successfully!' });
      setCreatedTeamId(data.id);
    },
    onError: (error) => {
      setNotification({ type: 'error', message: error.message });
    },
  });

  const addMemberMutation = trpc.teams.addMember.useMutation({
    onSuccess: () => {
      setNotification({ type: 'success', message: 'Joined team successfully!' });
    },
    onError: (error) => {
      setNotification({ type: 'error', message: error.message });
    },
  });

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTeamMutation.mutateAsync({
      ...newTeam,
      userId: 1 // Replace with actual user ID from your auth system
    });
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    await addMemberMutation.mutateAsync({
      teamId: parseInt(teamIdToJoin),
      userId: 1, // Replace with actual user ID from your auth system
      role: 'member'
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Join or Create a Team</h1>
      
      {notification && (
        <div className={`p-2 mb-4 ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {notification.message}
        </div>
      )}

      {createdTeamId && (
        <div className="p-2 mb-4 bg-blue-100 text-blue-700">
          New team created with ID: {createdTeamId}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Team</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTeam}>
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                value={newTeam.name}
                onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                required
              />
              <Label htmlFor="teamDescription">Team Description (optional)</Label>
              <Input
                id="teamDescription"
                value={newTeam.description}
                onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
              />
              <Button type="submit" className="mt-4">Create Team</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Join an Existing Team</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinTeam}>
              <Label htmlFor="teamId">Team ID</Label>
              <Input
                id="teamId"
                value={teamIdToJoin}
                onChange={(e) => setTeamIdToJoin(e.target.value)}
                required
              />
              <Button type="submit" className="mt-4">Join Team</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}