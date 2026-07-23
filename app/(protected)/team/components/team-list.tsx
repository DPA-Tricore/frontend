'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import { teamsApi } from '@/lib/api/teams';
import type { TeamResponseDto } from '@/lib/types/teams';
import { colors } from '@/lib/theme/colors';

interface TeamListProps {
  teams: TeamResponseDto[];
  onChanged: () => Promise<void>;
}

export default function TeamList({ teams, onChanged }: TeamListProps) {
  const [newTeamName, setNewTeamName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setError(null);
    setIsCreating(true);
    try {
      await teamsApi.createTeam({ name: newTeamName.trim() });
      setNewTeamName('');
      await onChanged();
    } catch {
      setError('Failed to create team');
    } finally {
      setIsCreating(false);
    }
  };

  const startEditing = (team: TeamResponseDto) => {
    setEditingId(team.id);
    setEditingName(team.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveEditing = async (id: string) => {
    if (!editingName.trim()) return;
    setError(null);
    try {
      await teamsApi.updateTeam(id, { name: editingName.trim() });
      cancelEditing();
      await onChanged();
    } catch {
      setError('Failed to rename team');
    }
  };

  const handleDelete = async (team: TeamResponseDto) => {
    const confirmed = window.confirm(
      `Delete "${team.name}"? Its ${team._count.users} member(s) will become unassigned.`,
    );
    if (!confirmed) return;
    setError(null);
    try {
      await teamsApi.deleteTeam(team.id);
      await onChanged();
    } catch {
      setError('Failed to delete team');
    }
  };

  return (
    <div className="surface rounded-xl border border-[var(--border)] shadow-sm p-6 space-y-4">
      <h2 className="text-lg font-semibold text-primary">Teams</h2>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="divide-y divide-[var(--border)]">
        {teams.length === 0 && (
          <p className="text-sm text-muted py-3">No teams yet. Create one below.</p>
        )}
        {teams.map((team) => (
          <div key={team.id} className="flex items-center justify-between py-3 gap-3">
            {editingId === team.id ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  autoFocus
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
                />
                <button
                  type="button"
                  onClick={() => saveEditing(team.id)}
                  className="p-1.5 text-emerald-600 hover:opacity-70"
                  title="Save"
                >
                  <Check size={16} />
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="p-1.5 text-muted hover:opacity-70"
                  title="Cancel"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <div>
                  <p className="font-medium text-primary">{team.name}</p>
                  <p className="text-xs text-muted">
                    {team._count.users} member{team._count.users === 1 ? '' : 's'} ·{' '}
                    {team._count.leads} lead{team._count.leads === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEditing(team)}
                    className="p-1.5 text-muted hover:text-primary"
                    title="Rename"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(team)}
                    className="p-1.5 text-muted hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleCreate} className="flex items-center gap-2 pt-2">
        <input
          type="text"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          placeholder="New team name"
          className="flex-1 px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent surface text-primary"
        />
        <button
          type="submit"
          disabled={!newTeamName.trim() || isCreating}
          className={`${colors.button.secondary} flex items-center gap-1.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <Plus size={16} />
          Add Team
        </button>
      </form>
    </div>
  );
}
