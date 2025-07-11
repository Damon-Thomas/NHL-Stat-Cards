import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import NotificationToast from "../components/NotificationToast";

interface Notification {
  id: string;
  message: string;
  type: "error" | "warning" | "success" | "info";
  duration?: number;
}

interface NotificationContextType {
  addNotification: (
    message: string,
    type: "error" | "warning" | "success" | "info",
    duration?: number
  ) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (
    message: string,
    type: "error" | "warning" | "success" | "info",
    duration = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: Notification = {
      id,
      message,
      type,
      duration,
    };

    setNotifications((prev) => [...prev, notification]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  return (
    <NotificationContext.Provider
      value={{ addNotification, removeNotification }}
    >
      {children}
      {/* Render notifications - only show one at a time since they're modals */}
      {notifications.length > 0 && (
        <NotificationToast
          message={notifications[0].message}
          type={notifications[0].type}
          duration={notifications[0].duration}
          onClose={() => removeNotification(notifications[0].id)}
        />
      )}
    </NotificationContext.Provider>
  );
}
