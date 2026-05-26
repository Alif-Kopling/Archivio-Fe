import api from "@/lib/axios";
import { Notification } from "@/types/notification";

export const notificationService = {
  getAll: async (): Promise<{ data: Notification[]; unreadCount: number }> => {
    const response = await api.get("/notifications");
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get("/notifications/unread-count");
    return response.data.count;
  },

  markAsRead: async (id: number) => {
    return api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return api.post("/notifications/mark-all-read");
  },

  deleteAll: async () => {
    return api.delete("/notifications");
  },
};
