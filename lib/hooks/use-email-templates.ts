import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { emailTemplatesApi } from '@/lib/api/emails';
import { emailTemplateKeys } from '@/lib/queries/keys';
import type { CreateEmailTemplateRequest, UpdateEmailTemplateRequest } from '@/lib/types/emails';

export function useEmailTemplates(includeInactive = false, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: emailTemplateKeys.list(includeInactive),
    queryFn: () => emailTemplatesApi.getTemplates(includeInactive),
    enabled: options?.enabled ?? true,
  });
}

function useTemplateMutation<TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: emailTemplateKeys.all }),
  });
}

export function useCreateEmailTemplate() {
  return useTemplateMutation((data: CreateEmailTemplateRequest) => emailTemplatesApi.createTemplate(data));
}

export function useUpdateEmailTemplate() {
  return useTemplateMutation(({ id, data }: { id: string; data: UpdateEmailTemplateRequest }) =>
    emailTemplatesApi.updateTemplate(id, data),
  );
}

export function useDeleteEmailTemplate() {
  return useTemplateMutation((id: string) => emailTemplatesApi.deleteTemplate(id));
}

/** Fills a template for the lead or customer the composer is open on. */
export function useRenderEmailTemplate() {
  return useMutation({
    mutationFn: ({ id, party }: { id: string; party: { leadId?: string; customerId?: string } }) =>
      emailTemplatesApi.renderTemplate(id, party),
  });
}
