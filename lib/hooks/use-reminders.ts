import { useEffect, useState, useCallback } from 'react';
import { reminderAPI } from '@/lib/api/reminders';
import type { ReminderResponseDto } from '@/lib/types/reminders';

interface UseRemindersOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useReminders = (options: UseRemindersOptions = {}) => {
  const { autoRefresh = true, refreshInterval = 30000 } = options;
  const [reminders, setReminders] = useState<ReminderResponseDto[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reminderAPI.getPending();
      setReminders(data);
      const pending = data.filter(r => r.status === 'PENDING').length;
      setPendingCount(pending);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createReminder = useCallback(
    async (data: any) => {
      try {
        const created = await reminderAPI.create(data);
        setReminders(prev => [...prev, created]);
        return created;
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    []
  );

  const acknowledgeReminder = useCallback(async (id: string) => {
    try {
      const updated = await reminderAPI.acknowledge(id);
      setReminders(prev =>
        prev.map(r => (r.id === id ? updated : r))
      );
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const dismissReminder = useCallback(async (id: string) => {
    try {
      const updated = await reminderAPI.dismiss(id);
      setReminders(prev =>
        prev.map(r => (r.id === id ? updated : r))
      );
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteReminder = useCallback(async (id: string) => {
    try {
      await reminderAPI.delete(id);
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Auto-refresh reminders
  useEffect(() => {
    if (!autoRefresh) return;

    fetchPending();
    const interval = setInterval(fetchPending, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchPending]);

  return {
    reminders,
    pendingCount,
    loading,
    error,
    fetchPending,
    createReminder,
    acknowledgeReminder,
    dismissReminder,
    deleteReminder,
  };
};
