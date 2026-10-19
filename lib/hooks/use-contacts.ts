import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi } from '@/lib/api/contacts';
import { customerActivityKeys, customerKeys, leadActivityKeys, leadKeys } from '@/lib/queries/keys';
import type { ContactOwner, CreateContactRequest, UpdateContactRequest } from '@/lib/types/leads';

/** Contacts come back on the lead/customer itself, so every change refreshes that record, its lists and its timeline. */
function useContactMutation<TArgs>(owner: ContactOwner, fn: (args: TArgs) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      if (owner.type === 'lead') {
        queryClient.invalidateQueries({ queryKey: leadKeys.all });
        queryClient.invalidateQueries({ queryKey: leadActivityKeys.byLead(owner.id) });
      } else {
        queryClient.invalidateQueries({ queryKey: customerKeys.all });
        queryClient.invalidateQueries({ queryKey: customerActivityKeys.byCustomer(owner.id) });
      }
    },
  });
}

export function useAddContact(owner: ContactOwner) {
  return useContactMutation(owner, (data: CreateContactRequest) => contactsApi.create(owner, data));
}

export function useUpdateContact(owner: ContactOwner) {
  return useContactMutation(owner, ({ id, data }: { id: string; data: UpdateContactRequest }) => contactsApi.update(owner, id, data));
}

export function useRemoveContact(owner: ContactOwner) {
  return useContactMutation(owner, (id: string) => contactsApi.remove(owner, id));
}
