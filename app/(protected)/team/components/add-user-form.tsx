'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { usersApi } from '@/lib/api/users';
import type { AssignableRole } from '@/lib/types/users';
import type { TeamResponseDto } from '@/lib/types/teams';
import { colors } from '@/lib/theme/colors';

const ASSIGNABLE_ROLES: AssignableRole[] = ['MANAGER', 'AGENT', 'VIEWER'];

const ROLE_LABELS: Record<AssignableRole, string> = {
  MANAGER: 'Manager',
  AGENT: 'Agent',
  VIEWER: 'Viewer',
};

interface AddUserFormProps {
  teams: TeamResponseDto[];
  onChanged: () => Promise<void>;
}

export default function AddUserForm({ teams, onChanged }: AddUserFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AssignableRole>('AGENT');
  const [teamId, setTeamId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = email.trim().length > 0 && password.length >= 6;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setError(null);
    setIsCreating(true);
    try {
      await usersApi.createUser({
        email: email.trim(),
        password,
        role,
        teamId: teamId || undefined,
      });
      setEmail('');
      setPassword('');
      setRole('AGENT');
      setTeamId('');
      await onChanged();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to add person');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="surface rounded-xl border border-[var(--border)] shadow-sm p-6 space-y-4">
      <h2 className="text-lg font-semibold text-primary">Add Person</h2>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="flex flex-wrap items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="flex-1 min-w-[180px] px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Temporary password"
          minLength={6}
          className="flex-1 min-w-[160px] px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as AssignableRole)}
          className="px-2 py-1.5 text-sm border border-[var(--border)] rounded-lg surface text-primary"
        >
          {ASSIGNABLE_ROLES.map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
        <select
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="px-2 py-1.5 text-sm border border-[var(--border)] rounded-lg surface text-primary"
        >
          <option value="">Unassigned</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!isValid || isCreating}
          className={`${colors.button.secondary} flex items-center gap-1.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <UserPlus size={16} />
          Add Person
        </button>
      </form>
      <p className="text-xs text-muted">Password must be at least 6 characters. Share it with them directly — there&apos;s no invite email yet.</p>
    </div>
  );
}
