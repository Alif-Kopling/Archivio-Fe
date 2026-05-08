/* eslint-disable prettier/prettier */
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Alert, CloseButton } from "@heroui/react";
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

export type NotificationStatus = "success" | "danger" | "warning" | "accent";

interface Notification {
  id: number;
  title: string;
  description?: string;
  status: NotificationStatus;
}

interface NotificationContextType {
  notify: (params: {
    title: string;
    description?: string;
    status?: NotificationStatus;
  }) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback(
    ({
      title,
      description,
      status = "accent",
    }: {
      title: string;
      description?: string;
      status?: NotificationStatus;
    }) => {
      const id = Date.now();

      setNotifications((prev) => [...prev, { id, title, description, status }]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 4000);
    },
    [],
  );

  const remove = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const iconMap: Record<NotificationStatus, ReactNode> = {
    success: <CheckCircle size={18} />,
    danger: <AlertCircle size={18} />,
    warning: <AlertTriangle size={18} />,
    accent: <Info size={18} />,
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm">
        {notifications.map((n) => (
          <Alert key={n.id} className="shadow-lg" status={n.status}>
            <Alert.Indicator>{iconMap[n.status]}</Alert.Indicator>
            <Alert.Content>
              <Alert.Title>{n.title}</Alert.Title>
              {n.description && (
                <Alert.Description>{n.description}</Alert.Description>
              )}
            </Alert.Content>
            <CloseButton onPress={() => remove(n.id)} />
          </Alert>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotify() {
  const ctx = useContext(NotificationContext);

  if (!ctx) throw new Error("useNotify must be used within NotificationProvider");

  return ctx.notify;
}
