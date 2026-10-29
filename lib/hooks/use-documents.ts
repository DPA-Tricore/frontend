import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { documentsApi } from '@/lib/api/documents';
import { documentKeys } from '@/lib/queries/keys';
import type { ListDocumentsParams } from '@/lib/types/documents';

export function useDocumentsList(filters: ListDocumentsParams) {
  return useQuery({
    queryKey: documentKeys.list(filters),
    queryFn: () => documentsApi.getDocuments(filters),
    placeholderData: keepPreviousData,
    // Files get uploaded from lead and task pages too, so check again on every visit.
    staleTime: 0,
  });
}
