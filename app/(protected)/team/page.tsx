'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { useTeams } from '@/lib/hooks/use-teams';
import { useUsers } from '@/lib/hooks/use-users';
import { teamKeys, userKeys } from '@/lib/queries/keys';
import LoadingSpinner from '@/components/loading-spinner';
import TeamList from './components/team-list';
import UserRoleTable from './components/user-role-table';
import AddUserForm from './components/add-user-form';
import PageHeader from '@/components/page-header';

export default function TeamPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const isOrgAdmin = user?.role === 'ORG_ADMIN';
  const { data: teams = [], isLoading: teamsLoading } = useTeams({ enabled: isOrgAdmin });
  const { data: users = [], isLoading: usersLoading } = useUsers();

  // A change to a team or a person can touch both lists (e.g. moving someone between teams).
  const refetch = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: teamKeys.all }),
      queryClient.invalidateQueries({ queryKey: userKeys.all }),
    ]);
  };

  useEffect(() => {
    if (!isAuthLoading && !isOrgAdmin) router.replace('/dashboard');
  }, [isAuthLoading, isOrgAdmin, router]);

  if (isAuthLoading || !isOrgAdmin) return <LoadingSpinner fullPage />;

  const isLoading = teamsLoading || usersLoading;

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Team" />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <TeamList teams={teams} onChanged={refetch} />
          <AddUserForm teams={teams} onChanged={refetch} />
          <UserRoleTable users={users} teams={teams} currentUserId={user?.id} onChanged={refetch} />
        </>
      )}
    </div>
  );
}
