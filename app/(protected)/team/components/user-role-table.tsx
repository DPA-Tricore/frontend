'use client';

import { useState } from 'react';
import { usersApi } from '@/lib/api/users';
import type { OrgUserResponseDto, AssignableRole } from '@/lib/types/users';
import type { TeamResponseDto } from '@/lib/types/teams';
import { userDisplayName } from '@/lib/utils/user-name';

const ASSIGNABLE_ROLES: AssignableRole[] = ['MANAGER', 'AGENT', 'VIEWER'];

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ORG_ADMIN: 'Org Admin',
  MANAGER: 'Manager',
  AGENT: 'Agent',
  VIEWER: 'Viewer',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { dateStyle: 'medium' });
}

interface UserRoleTableProps {
  users: OrgUserResponseDto[];
  teams: TeamResponseDto[];
  currentUserId?: string;
  onChanged: () => Promise<void>;
}

export default function UserRoleTable({ users, teams, currentUserId, onChanged }: UserRoleTableProps) {
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = async (id: string, role: AssignableRole) => {
    setError(null);
    setSavingId(id);
    try {
      await usersApi.updateUser(id, { role });
      await onChanged();
    } catch {
      setError('Failed to update role');
    } finally {
      setSavingId(null);
    }
  };

  const handleTeamChange = async (id: string, teamId: string) => {
    setError(null);
    setSavingId(id);
    try {
      await usersApi.updateUser(id, { teamId: teamId === '' ? null : teamId });
      await onChanged();
    } catch {
      setError('Failed to update team');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="surface rounded-xl border border-[var(--border)] shadow-sm p-6 space-y-4">
      <h2 className="text-lg font-semibold text-primary">People</h2>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-[var(--border)]">
              <th className="py-2 pr-4 font-medium">Email</th>
              <th className="py-2 pr-4 font-medium">Role</th>
              <th className="py-2 pr-4 font-medium">Team</th>
              <th className="py-2 pr-4 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {users.map((u) => {
              const isLocked = u.id === currentUserId || u.role === 'ORG_ADMIN' || u.role === 'SUPER_ADMIN';
              const isSaving = savingId === u.id;
              return (
                <tr key={u.id}>
                  <td className="py-3 pr-4">
                    <p className="text-primary">{userDisplayName(u)}</p>
                    {(u.firstName || u.lastName) && <p className="text-xs text-muted">{u.email}</p>}
                  </td>
                  <td className="py-3 pr-4">
                    {isLocked ? (
                      <span className="text-muted">{ROLE_LABELS[u.role]}</span>
                    ) : (
                      <select
                        value={u.role}
                        disabled={isSaving}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as AssignableRole)}
                        className="px-2 py-1 text-sm border border-[var(--border)] rounded-lg surface text-primary disabled:opacity-50"
                      >
                        {ASSIGNABLE_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    {isLocked ? (
                      <span className="text-muted">{u.team?.name ?? 'Unassigned'}</span>
                    ) : (
                      <select
                        value={u.teamId ?? ''}
                        disabled={isSaving}
                        onChange={(e) => handleTeamChange(u.id, e.target.value)}
                        className="px-2 py-1 text-sm border border-[var(--border)] rounded-lg surface text-primary disabled:opacity-50"
                      >
                        <option value="">Unassigned</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-muted">{formatDate(u.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
