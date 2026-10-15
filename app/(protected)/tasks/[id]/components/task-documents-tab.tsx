'use client';

import { useTaskDocuments, useUploadTaskDocument, useDeleteTaskDocument } from '@/lib/hooks/use-task-detail';
import DocumentsPanel from '@/components/documents/documents-panel';

interface TaskDocumentsTabProps {
  taskId: string;
}

export default function TaskDocumentsTab({ taskId }: TaskDocumentsTabProps) {
  const { data: documents = [], isLoading } = useTaskDocuments(taskId);
  const uploadDocument = useUploadTaskDocument(taskId);
  const deleteDocument = useDeleteTaskDocument(taskId);

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
