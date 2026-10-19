import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { emailsApi } from '@/lib/api/emails';
import { customerActivityKeys, emailKeys, leadActivityKeys } from '@/lib/queries/keys';
import { EMAIL_SENDING_POLL_MS } from '@/lib/constants/emails';
import type { EmailThreadFilters, SendEmailRequest } from '@/lib/types/emails';

const isSending = (status: string | undefined) => status === 'QUEUED';

/** Threads on one lead or customer. Re-checks while the newest email is still sending. */
export function useEmailThreads(filters: EmailThreadFilters) {
  return useQuery({
    queryKey: emailKeys.threads(filters),
    queryFn: () => emailsApi.getThreads(filters),
    refetchInterval: (query) =>
      query.state.data?.some((t) => isSending(t.lastMessage?.status)) ? EMAIL_SENDING_POLL_MS : false,
  });
}

export function useEmailThread(id: string | null) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: emailKeys.thread(id ?? ''),
    queryFn: async () => {
      const thread = await emailsApi.getThread(id!);
      // background-job logs the send on the timeline, so refresh it once nothing is still sending.
      if (!thread.messages.some((m) => isSending(m.status))) {
        if (thread.leadId) queryClient.invalidateQueries({ queryKey: leadActivityKeys.byLead(thread.leadId) });
        if (thread.customerId) queryClient.invalidateQueries({ queryKey: customerActivityKeys.byCustomer(thread.customerId) });
      }
      return thread;
    },
    enabled: !!id,
    refetchInterval: (query) =>
      query.state.data?.messages.some((m) => isSending(m.status)) ? EMAIL_SENDING_POLL_MS : false,
  });
}

export function useSendEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendEmailRequest) => emailsApi.send(data),
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: [...emailKeys.all, 'threads'] });
      queryClient.invalidateQueries({ queryKey: emailKeys.thread(message.threadId) });
    },
  });
}
