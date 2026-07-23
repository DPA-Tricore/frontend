'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { teamsApi } from '@/lib/api/teams';
import { usersApi } from '@/lib/api/users';
import type { TeamResponseDto } from '@/lib/types/teams';
import type { OrgUserResponseDto } from '@/lib/types/users';
import LoadingSpinner from '@/components/loading-spinner';
import TeamList from './components/team-list';
import UserRoleTable from './components/user-role-table';

export default function TeamPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [teams, setTeams] = useState<TeamResponseDto[]>([]);
  const [users, setUsers] = useState<OrgUserResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isOrgAdmin = user?.role === 'ORG_ADMIN';

  const refetch = useCallback(async () => {
    const [teamsData, usersData] = await Promise.all([teamsApi.getTeams(), usersApi.getUsers()]);
    setTeams(teamsData);
    setUsers(usersData);
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isOrgAdmin) {
      router.replace('/dashboard');
      return;
    }
    setIsLoading(true);
    refetch().finally(() => setIsLoading(false));
  }, [isAuthLoading, isOrgAdmin, refetch, router]);

  if (isAuthLoading || !isOrgAdmin) return <LoadingSpinner fullPage />;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">Team</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Manage teams and assign roles for people in your organization.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <TeamList teams={teams} onChanged={refetch} />
          <UserRoleTable users={users} teams={teams} currentUserId={user?.id} onChanged={refetch} />
        </>
      )}
    </div>
  );
}
