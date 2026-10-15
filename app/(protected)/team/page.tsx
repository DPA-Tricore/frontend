'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { teamsApi } from '@/lib/api/teams';
import type { TeamResponseDto } from '@/lib/types/teams';
import { useUsers } from '@/lib/hooks/use-users';
import { userKeys } from '@/lib/queries/keys';
import LoadingSpinner from '@/components/loading-spinner';
import TeamList from './components/team-list';
import UserRoleTable from './components/user-role-table';
import AddUserForm from './components/add-user-form';
import PageHeader from '@/components/page-header';

export default function TeamPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const [teams, setTeams] = useState<TeamResponseDto[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const { data: users = [], isLoading: usersLoading } = useUsers();

  const isOrgAdmin = user?.role === 'ORG_ADMIN';

  const refetch = useCallback(async () => {
    const [teamsData] = await Promise.all([
      teamsApi.getTeams(),
      queryClient.invalidateQueries({ queryKey: userKeys.all }),
    ]);
    setTeams(teamsData);
  }, [queryClient]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isOrgAdmin) {
      router.replace('/dashboard');
      return;
    }
    setTeamsLoading(true);
    refetch().finally(() => setTeamsLoading(false));
  }, [isAuthLoading, isOrgAdmin, refetch, router]);

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
