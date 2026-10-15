import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import {
  leadsApi,
  type CreateLeadRequest,
  type LeadResponseDto,
  type PaginatedLeadResponse,
  type ConvertLeadRequest,
} from '@/lib/api/leads';
import { leadKeys, type LeadListFilters } from '@/lib/queries/keys';

/** getLeads returns a bare array when the server doesn't paginate — normalize to one shape. */
export function normalizeLeadsResponse(
  response: PaginatedLeadResponse | LeadResponseDto[],
): PaginatedLeadResponse {
  if (Array.isArray(response)) {
    return {
      data: response,
      meta: {
        page: 1,
        limit: response.length,
        total: response.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }
  return response;
}

export function useLeadsList(filters: LeadListFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: leadKeys.list(filters),
    queryFn: async () => normalizeLeadsResponse(await leadsApi.getLeads(filters)),
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
  });
}

/**
 * One request for the whole board instead of 7. Seeds each status column's
 * useInfiniteQuery cache (leadKeys.boardColumn) with its first page as a side
 * effect, so BoardColumnContainer's own query finds fresh data already there
 * and never fires its own page-1 fetch. Only leaves the "existing" cache alone
 * if a column already has data — e.g. deeper pages loaded via "load more" —
 * so this never stomps on further-along pagination state.
 */
export function useLeadsBoardSummary() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: leadKeys.boardSummary(),
    queryFn: async () => {
      const board = await leadsApi.getLeadsBoard();
      board.columns.forEach((column) => {
        queryClient.setQueryData<InfiniteData<PaginatedLeadResponse>>(
          leadKeys.boardColumn(column.status),
          (existing) => existing ?? { pages: [{ data: column.data, meta: column.meta }], pageParams: [1] },
        );
      });
      return board;
    },
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeadRequest) => leadsApi.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

export function useAssignLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, agentId }: { id: string; agentId: string | null }) =>
      leadsApi.assignLead(id, agentId),
    onSuccess: (updated) => {
      queryClient.setQueryData(leadKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

/** Only patches caches on an actual CONVERTED result — a POTENTIAL_MATCH_FOUND response means nothing changed server-side yet. */
export function useConvertLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ConvertLeadRequest }) => leadsApi.convertLead(id, data),
    onSuccess: (result, { id }) => {
      if (result.status !== 'CONVERTED') return;
      queryClient.setQueryData<LeadResponseDto>(leadKeys.detail(id), (old) =>
        old && result.customer
          ? { ...old, status: 'CONVERTED', customerId: result.customer.id, convertedCustomerId: result.customer.id }
          : old,
      );
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
    },
  });
}

export interface UpdateLeadStatusPayload {
  lead: LeadResponseDto;
  newStatus: string;
}

interface UpdateLeadStatusContext {
  previousOldColumn: InfiniteData<PaginatedLeadResponse> | undefined;
  previousNewColumn: InfiniteData<PaginatedLeadResponse> | undefined;
  previousDetail: LeadResponseDto | undefined;
  oldColumnKey: ReturnType<typeof leadKeys.boardColumn>;
  newColumnKey: ReturnType<typeof leadKeys.boardColumn>;
  detailKey: ReturnType<typeof leadKeys.detail>;
}

/**
 * Drives both board drag-and-drop and the profile panel's status controls.
 * Patches the board column caches directly instead of invalidating them —
 * an invalidate would refetch all mounted columns on every single drag.
 */
export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation<LeadResponseDto, Error, UpdateLeadStatusPayload, UpdateLeadStatusContext>({
    mutationFn: ({ lead, newStatus }) => leadsApi.updateLead(lead.id, { status: newStatus }),
    onMutate: ({ lead, newStatus }) => {
      const oldColumnKey = leadKeys.boardColumn(lead.status);
      const newColumnKey = leadKeys.boardColumn(newStatus);
      const detailKey = leadKeys.detail(lead.id);

      // Not awaited on purpose: the cache must move in the same tick as the drop, or the
      // board's drop animation measures the card in its old column and it flickers.
      // Safe — setQueryData also updates the state a cancelled fetch reverts to.
      void Promise.all([
        queryClient.cancelQueries({ queryKey: oldColumnKey }),
        queryClient.cancelQueries({ queryKey: newColumnKey }),
        queryClient.cancelQueries({ queryKey: detailKey }),
      ]);

      const previousOldColumn =
        queryClient.getQueryData<InfiniteData<PaginatedLeadResponse>>(oldColumnKey);
      const previousNewColumn =
        queryClient.getQueryData<InfiniteData<PaginatedLeadResponse>>(newColumnKey);
      const previousDetail = queryClient.getQueryData<LeadResponseDto>(detailKey);

      queryClient.setQueryData<InfiniteData<PaginatedLeadResponse>>(oldColumnKey, (old) =>
        old && {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.filter((l) => l.id !== lead.id),
            meta: { ...page.meta, total: Math.max(0, page.meta.total - 1) },
          })),
        },
      );

      queryClient.setQueryData<InfiniteData<PaginatedLeadResponse>>(newColumnKey, (old) => {
        if (!old) return old;
        const [firstPage, ...rest] = old.pages;
        return {
          ...old,
          pages: [
            {
              ...firstPage,
              data: [{ ...lead, status: newStatus }, ...firstPage.data],
              meta: { ...firstPage.meta, total: firstPage.meta.total + 1 },
            },
            ...rest,
          ],
        };
      });

      queryClient.setQueryData<LeadResponseDto>(detailKey, (old) =>
        old ? { ...old, status: newStatus } : old,
      );

      return { previousOldColumn, previousNewColumn, previousDetail, oldColumnKey, newColumnKey, detailKey };
    },
    onError: (_err, _vars, context) => {
      if (!context) return;
      queryClient.setQueryData(context.oldColumnKey, context.previousOldColumn);
      queryClient.setQueryData(context.newColumnKey, context.previousNewColumn);
      queryClient.setQueryData(context.detailKey, context.previousDetail);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(leadKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: [...leadKeys.all, 'list'] });
    },
  });
}
