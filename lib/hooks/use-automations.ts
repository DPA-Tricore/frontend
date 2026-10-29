import { useQuery } from '@tanstack/react-query';
import { automationsApi } from '@/lib/api/automations';
import { automationKeys } from '@/lib/queries/keys';

export function useAutomations() {
  return useQuery({
    queryKey: automationKeys.list(),
    queryFn: () => automationsApi.getAutomations(),
  });
}

export function useAutomation(id: string) {
  return useQuery({
    queryKey: automationKeys.detail(id),
    queryFn: () => automationsApi.getAutomation(id),
  });
}
