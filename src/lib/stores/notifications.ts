import { writable, derived } from 'svelte/store';
import type { Deadline } from '$lib/types';

export interface Notification {
  id: string;
  type: 'deadline' | 'reminder' | 'alert' | 'info';
  title: string;
  message: string;
  link?: string;
  deadline?: Deadline;
  createdAt: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface NotificationState {
  notifications: Notification[];
  lastChecked: Date | null;
}

const initialState: NotificationState = {
  notifications: [],
  lastChecked: null
};

function createNotificationStore() {
  const { subscribe, set, update } = writable<NotificationState>(initialState);

  return {
    subscribe,

    addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
      const id = Math.random().toString(36).substr(2, 9);
      update((state) => ({
        ...state,
        notifications: [
          { ...notification, id, createdAt: new Date(), read: false },
          ...state.notifications
        ].slice(0, 50) // Keep only last 50 notifications
      }));
      return id;
    },

    markAsRead: (id: string) => {
      update((state) => ({
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        )
      }));
    },

    markAllAsRead: () => {
      update((state) => ({
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        lastChecked: new Date()
      }));
    },

    removeNotification: (id: string) => {
      update((state) => ({
        ...state,
        notifications: state.notifications.filter((n) => n.id !== id)
      }));
    },

    clearAll: () => {
      update((state) => ({
        ...state,
        notifications: [],
        lastChecked: new Date()
      }));
    },

    // Generate notifications from deadlines
    generateDeadlineNotifications: (deadlines: Deadline[]) => {
      const now = new Date();
      const notifications: Omit<Notification, 'id' | 'createdAt' | 'read'>[] = [];

      for (const deadline of deadlines) {
        if (deadline.status === 'completed') continue;

        const dueDate = new Date(deadline.dueDate);
        const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Overdue
        if (daysUntil < 0) {
          notifications.push({
            type: 'deadline',
            title: 'Overdue Deadline',
            message: `"${deadline.title}" was due ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} ago`,
            link: '/deadlines',
            deadline,
            priority: 'urgent'
          });
        }
        // Due today
        else if (daysUntil === 0) {
          notifications.push({
            type: 'deadline',
            title: 'Due Today',
            message: `"${deadline.title}" is due today`,
            link: '/deadlines',
            deadline,
            priority: 'urgent'
          });
        }
        // Due tomorrow
        else if (daysUntil === 1) {
          notifications.push({
            type: 'deadline',
            title: 'Due Tomorrow',
            message: `"${deadline.title}" is due tomorrow`,
            link: '/deadlines',
            deadline,
            priority: 'high'
          });
        }
        // Due within 3 days
        else if (daysUntil <= 3) {
          notifications.push({
            type: 'reminder',
            title: 'Deadline Approaching',
            message: `"${deadline.title}" is due in ${daysUntil} days`,
            link: '/deadlines',
            deadline,
            priority: 'high'
          });
        }
        // Due within 7 days
        else if (daysUntil <= 7) {
          notifications.push({
            type: 'reminder',
            title: 'Upcoming Deadline',
            message: `"${deadline.title}" is due in ${daysUntil} days`,
            link: '/deadlines',
            deadline,
            priority: 'medium'
          });
        }
      }

      // Sort by priority
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      notifications.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      update((state) => ({
        ...state,
        notifications: notifications.map((n) => ({
          ...n,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          read: false
        }))
      }));
    }
  };
}

export const notificationStore = createNotificationStore();

// Derived stores
export const unreadCount = derived(notificationStore, ($store) =>
  $store.notifications.filter((n) => !n.read).length
);

export const urgentNotifications = derived(notificationStore, ($store) =>
  $store.notifications.filter((n) => !n.read && (n.priority === 'urgent' || n.priority === 'high'))
);
