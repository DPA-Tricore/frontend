import { axiosClient } from '@/lib/api/axios-client';
import type {
  NotificationPage,
  NotificationPreferences,
  NotificationPreferenceType,
  PushPublicKey,
  SavePushSubscriptionRequest,
  UnreadNotificationCount,
  UpdateNotificationPreferenceRequest,
} from '@/lib/types/notifications';

class NotificationAPI {
  async list(cursor?: string, limit?: number): Promise<NotificationPage> {
    const response = await axiosClient.get<NotificationPage>('/notifications', { params: { cursor, limit } });
    return response.data;
  }

  async unreadCount(): Promise<UnreadNotificationCount> {
    const response = await axiosClient.get<UnreadNotificationCount>('/notifications/unread-count');
    return response.data;
  }

  async markRead(id: string): Promise<void> {
    await axiosClient.patch(`/notifications/${id}/read`);
  }

  async markAllRead(): Promise<void> {
    await axiosClient.post('/notifications/read-all');
  }

  async getPreferences(): Promise<NotificationPreferences> {
    const response = await axiosClient.get<NotificationPreferences>('/notifications/preferences');
    return response.data;
  }

  async updatePreference(data: UpdateNotificationPreferenceRequest): Promise<NotificationPreferenceType> {
    const response = await axiosClient.patch<NotificationPreferenceType>('/notifications/preferences', data);
    return response.data;
  }

  async getPushPublicKey(): Promise<PushPublicKey> {
    const response = await axiosClient.get<PushPublicKey>('/notifications/push/public-key');
    return response.data;
  }

  async savePushSubscription(data: SavePushSubscriptionRequest): Promise<void> {
    await axiosClient.post('/notifications/push-subscriptions', data);
  }

  async removePushSubscription(endpoint: string): Promise<void> {
    await axiosClient.delete('/notifications/push-subscriptions', { data: { endpoint } });
  }

  async sendTestPush(): Promise<void> {
    await axiosClient.post('/notifications/push/test');
  }
}

export const notificationAPI = new NotificationAPI();
