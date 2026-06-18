import { api, ENDPOINTS } from './api';
import type { AppNotification } from './types';

export const listNotifications = (): Promise<AppNotification[]> => api(ENDPOINTS.notifications);

export const unreadCount = (): Promise<{ count: number }> => api(ENDPOINTS.notificationsUnread);

export const markAllRead = (): Promise<void> =>
  api(ENDPOINTS.notificationsRead, { method: 'POST' });
