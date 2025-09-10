import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'message' | 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  icon?: React.ReactNode;
  isRead?: boolean;
  actionUrl?: string;
  metadata?: {
    conversationId?: string;
    userId?: string;
    orderId?: string;
  };
}

interface NotificationContextType {
  currentNotification: NotificationData | null;
  notifications: NotificationData[];
  showNotification: (notification: Omit<NotificationData, 'id' | 'timestamp' | 'isRead'>) => void;
  hideNotification: () => void;
  showChatNotification: (customerName: string, message: string, conversationId?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  getNotifications: (page?: number, limit?: number) => { notifications: NotificationData[]; total: number; totalPages: number };
  unreadCount: number;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  playNotificationSound: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [currentNotification, setCurrentNotification] = useState<NotificationData | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Load notifications from database on mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        
        // Only load admin notifications if user is admin or superadmin
        if (token && (userRole === 'admin' || userRole === 'superadmin')) {
          console.log('Loading notifications from database...');
          const response = await fetch('http://localhost:8000/api/admin-notification', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('Response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Raw data from database:', data);
            
            // Handle both direct array and object with notifications property
            const notificationsArray = Array.isArray(data) ? data : (data.notifications || []);
            
            const formattedNotifications = notificationsArray.map((notif: any) => ({
              id: notif._id,
              title: notif.title,
              message: notif.message,
              type: notif.type,
              timestamp: new Date(notif.createdAt),
              isRead: notif.isRead,
              actionUrl: notif.link,
              metadata: notif.data
            }));
            
            console.log('Formatted notifications:', formattedNotifications);
            setNotifications(formattedNotifications);
          } else {
            const errorData = await response.json();
            console.error('Failed to load notifications:', errorData);
          }
        } else {
          // For non-admin users, just initialize with empty notifications
          console.log('User is not admin, skipping admin notifications load');
        }
      } catch (error) {
        console.error('Could not load notifications from database:', error);
      }
    };

    loadNotifications();
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioEnabled) {
      try {
        const audio = new Audio('/sounds/dung_QugSu0k.mp3');
        audio.volume = 0.5; // 50% volume
        audio.play().catch(error => {
          console.log('Could not play notification sound:', error);
        });
      } catch (error) {
        console.log('Error creating audio:', error);
      }
    }
  }, [audioEnabled]);

  const showNotification = useCallback(async (notification: Omit<NotificationData, 'id' | 'timestamp' | 'isRead'>) => {
    // Save to database first
    let savedNotification: NotificationData | null = null;
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? 'exists' : 'not found');
      console.log('Token length:', token ? token.length : 0);
      
      // Decode token to check user info
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('Token payload:', payload);
          console.log('User role from token:', payload.role);
        } catch (e) {
          console.log('Could not decode token:', e);
        }
      }
      
      if (token) {
        console.log('Saving notification to database:', {
          title: notification.title,
          message: notification.message,
          type: notification.type,
          link: notification.actionUrl,
          data: notification.metadata
        });
        
        const response = await fetch('http://localhost:8000/api/admin-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: notification.title,
            message: notification.message,
            type: notification.type,
            link: notification.actionUrl,
            data: notification.metadata
          })
        });
        
        if (response.ok) {
          const savedData = await response.json();
          console.log('Notification saved successfully:', savedData);
          console.log('Saved data structure:', {
            _id: savedData._id,
            createdAt: savedData.createdAt,
            isRead: savedData.isRead
          });
          
          // Create notification with database ID
          savedNotification = {
            ...notification,
            id: savedData._id,
            timestamp: new Date(savedData.createdAt),
            isRead: savedData.isRead
          };
        } else {
          const errorData = await response.json();
          console.error('Failed to save notification:', errorData);
        }
      }
    } catch (error) {
      console.error('Could not save notification to database:', error);
    }
    
    // If database save failed, create temporary notification
    if (!savedNotification) {
      savedNotification = {
        ...notification,
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        isRead: false
      };
    }
    
    setCurrentNotification(savedNotification);
    
    // Add to notifications list
    setNotifications(prev => [savedNotification!, ...prev]);
    
    // Play notification sound
    playNotificationSound();
  }, [playNotificationSound]);

  const hideNotification = useCallback(() => {
    setCurrentNotification(null);
  }, []);

  const showChatNotification = useCallback((customerName: string, message: string, conversationId?: string) => {
    const notification: Omit<NotificationData, 'id' | 'timestamp' | 'isRead'> = {
      title: `Tin nhắn mới từ ${customerName}`,
      message: message.length > 50 ? `${message.substring(0, 50)}...` : message,
      type: 'message',
      metadata: { conversationId }
    };
    
    showNotification(notification);
  }, [showNotification]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    
    // Update in database
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`http://localhost:8000/api/admin-notification/${id}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.log('Could not mark notification as read in database:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    
    // Update in database
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://localhost:8000/api/admin-notification/read-all', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.log('Could not mark all notifications as read in database:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    
    // Delete from database
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`http://localhost:8000/api/admin-notification/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.log('Could not delete notification from database:', error);
    }
  }, []);

  const getNotifications = useCallback((page: number = 1, limit: number = 5) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = notifications.slice(startIndex, endIndex);
    const total = notifications.length;
    const totalPages = Math.ceil(total / limit);

    return {
      notifications: paginatedNotifications,
      total,
      totalPages
    };
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value: NotificationContextType = {
    currentNotification,
    notifications,
    showNotification,
    hideNotification,
    showChatNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotifications,
    unreadCount,
    audioEnabled,
    setAudioEnabled,
    playNotificationSound
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
