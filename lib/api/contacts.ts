import { axiosClient } from '@/lib/api/axios-client';
import type { ContactOwner, ContactResponseDto, CreateContactRequest, UpdateContactRequest } from '@/lib/types/leads';

const base = (owner: ContactOwner) => `/${owner.type === 'lead' ? 'leads' : 'customers'}/${owner.id}/contacts`;

export const contactsApi = {
  async create(owner: ContactOwner, data: CreateContactRequest): Promise<ContactResponseDto> {
    const response = await axiosClient.post<ContactResponseDto>(base(owner), data);
    return response.data;
  },

  async update(owner: ContactOwner, contactId: string, data: UpdateContactRequest): Promise<ContactResponseDto> {
    const response = await axiosClient.patch<ContactResponseDto>(`${base(owner)}/${contactId}`, data);
    return response.data;
  },

  async remove(owner: ContactOwner, contactId: string): Promise<void> {
    await axiosClient.delete(`${base(owner)}/${contactId}`);
  },
};
