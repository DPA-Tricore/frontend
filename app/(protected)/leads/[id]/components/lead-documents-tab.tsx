'use client';

import { useLeadDocuments, useUploadLeadDocument, useDeleteLeadDocument } from '@/lib/hooks/use-lead-detail';
import DocumentsPanel from '@/components/documents/documents-panel';

interface Props {
  leadId: string;
}

export default function LeadDocumentsTab({ leadId }: Props) {
  const { data: documents = [], isLoading } = useLeadDocuments(leadId);
  const uploadDocument = useUploadLeadDocument(leadId);
  const deleteDocument = useDeleteLeadDocument(leadId);

  return (
    <DocumentsPanel
      documents={documents}
      loading={isLoading}
      uploading={uploadDocument.isPending}
      onUpload={uploadDocument.mutateAsync}
      onDelete={deleteDocument.mutateAsync}
    />
  );
}
