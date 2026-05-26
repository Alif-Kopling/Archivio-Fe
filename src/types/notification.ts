export interface Notification {
  id: number;
  userId: number;
  documentId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}
