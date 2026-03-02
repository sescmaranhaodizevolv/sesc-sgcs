import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Notification {
  id: number;
  type: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  time: string;
  read: boolean;
  processoId?: string;
  from?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'critical',
      title: 'Processo Urgente',
      message: 'Requisição PROC-2024-045 aguardando atribuição há 3 dias',
      time: 'Há 2 horas',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Prazo próximo do vencimento',
      message: 'Processo PROC-2024-023 vence em 2 dias',
      time: 'Há 5 horas',
      read: false
    },
    {
      id: 3,
      type: 'info',
      title: 'Nova requisição atribuída',
      message: 'Você recebeu o processo PROC-2024-067',
      time: 'Há 1 dia',
      read: true
    }
  ]);

  const addNotification = (notification: Omit<Notification, 'id' | 'time' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      time: 'Agora',
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      unreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
