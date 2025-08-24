import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Bell,
  ShoppingBag,
  CreditCard,
  Truck,
  Package
} from 'lucide-react';

export interface ModernNotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'order_success' | 'order_failed' | 'payment_success' | 'payment_failed';
  title: string;
  message: string;
  icon?: React.ReactNode;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  data?: any;
}

interface NotificationContextType {
  showNotification: (notification: Omit<ModernNotificationProps, 'id'>) => void;
  showSuccess: (title: string, message: string, options?: Partial<ModernNotificationProps>) => void;
  showError: (title: string, message: string, options?: Partial<ModernNotificationProps>) => void;
  showWarning: (title: string, message: string, options?: Partial<ModernNotificationProps>) => void;
  showInfo: (title: string, message: string, options?: Partial<ModernNotificationProps>) => void;
  showOrderSuccess: (orderId: string, message: string, options?: Partial<ModernNotificationProps>) => void;
  showOrderFailed: (orderId: string, message: string, options?: Partial<ModernNotificationProps>) => void;
  showPaymentSuccess: (paymentMethod: string, amount: number, options?: Partial<ModernNotificationProps>) => void;
  showPaymentFailed: (paymentMethod: string, reason: string, options?: Partial<ModernNotificationProps>) => void;
  notifications: ModernNotificationProps[];
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useModernNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useModernNotification must be used within a NotificationProvider');
  }
  return context;
};

const ModernNotificationItem: React.FC<{
  notification: ModernNotificationProps;
  onRemove: (id: string) => void;
}> = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Show notification with animation
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Auto remove notification
    if (notification.duration !== 0) {
      const hideTimer = setTimeout(() => {
        handleRemove();
      }, notification.duration || 6000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }

    return () => {
      clearTimeout(showTimer);
    };
  }, [notification.id, notification.duration]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  };

  const getIcon = () => {
    if (notification.icon) return notification.icon;

    switch (notification.type) {
      case 'success':
      case 'order_success':
      case 'payment_success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
      case 'order_failed':
      case 'payment_failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
      case 'order_success':
      case 'payment_success':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-green-100';
      case 'error':
      case 'order_failed':
      case 'payment_failed':
        return 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 shadow-red-100';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 shadow-yellow-100';
      case 'info':
        return 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 shadow-blue-100';
      default:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 shadow-gray-100';
    }
  };

  const getProgressColor = () => {
    switch (notification.type) {
      case 'success':
      case 'order_success':
      case 'payment_success':
        return 'bg-green-500';
      case 'error':
      case 'order_failed':
      case 'payment_failed':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible && !isRemoving ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${isRemoving ? 'translate-x-full opacity-0 scale-95' : ''}
      `}
    >
      <div className={`
        ${getBgColor()} 
        border rounded-xl shadow-lg p-4 min-w-[320px] max-w-[400px]
        backdrop-blur-sm relative overflow-hidden
      `}>
        {/* Progress bar */}
        {notification.duration !== 0 && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
            <div 
              className={`h-full ${getProgressColor()} transition-all duration-300 ease-linear`}
              style={{
                width: isVisible ? '0%' : '100%',
                transition: `width ${notification.duration || 6000}ms linear`
              }}
            />
          </div>
        )}

        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1 leading-tight">
              {notification.title}
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {notification.message}
            </p>
            
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                {notification.action.label}
              </button>
            )}
          </div>
          
          <button
            onClick={handleRemove}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<ModernNotificationProps[]>([]);

  const addNotification = useCallback((notification: Omit<ModernNotificationProps, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: ModernNotificationProps = {
      ...notification,
      id,
      duration: notification.duration ?? 6000
    };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, message: string, options?: Partial<ModernNotificationProps>) => {
    addNotification({
      type: 'success',
      title: `✅ ${title}`,
      message,
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((title: string, message: string, options?: Partial<ModernNotificationProps>) => {
    addNotification({
      type: 'error',
      title: `❌ ${title}`,
      message,
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message: string, options?: Partial<ModernNotificationProps>) => {
    addNotification({
      type: 'warning',
      title: `⚠️ ${title}`,
      message,
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message: string, options?: Partial<ModernNotificationProps>) => {
    addNotification({
      type: 'info',
      title: `ℹ️ ${title}`,
      message,
      ...options
    });
  }, [addNotification]);

  const showOrderSuccess = useCallback((orderId: string, message: string, options?: Partial<ModernNotificationProps>) => {
    addNotification({
      type: 'order_success',
      title: '🎉 Đặt hàng thành công!',
      message,
      icon: <ShoppingBag className="w-5 h-5 text-green-500" />,
      action: {
        label: 'Xem chi tiết',
        onClick: () => window.location.href = `/profile/orders/${orderId}`
      },
      ...options
    });
  }, [addNotification]);

  const showOrderFailed = useCallback((orderId: string, message: string, options?: Partial<ModernNotificationProps>) => {
    addNotification({
      type: 'order_failed',
      title: '❌ Đặt hàng không thành công',
      message,
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      action: {
        label: 'Đặt lại',
        onClick: () => window.location.href = '/checkout'
      },
      duration: 0, // Không tự động đóng
      ...options
    });
  }, [addNotification]);

  const showPaymentSuccess = useCallback((paymentMethod: string, amount: number, options?: Partial<ModernNotificationProps>) => {
    addNotification({
      type: 'payment_success',
      title: '💳 Thanh toán thành công!',
      message: `Đã thanh toán ${amount.toLocaleString('vi-VN')}đ qua ${paymentMethod.toUpperCase()}`,
      icon: <CreditCard className="w-5 h-5 text-green-500" />,
      ...options
    });
  }, [addNotification]);

  const showPaymentFailed = useCallback((paymentMethod: string, reason: string, options?: Partial<ModernNotificationProps>) => {
    addNotification({
      type: 'payment_failed',
      title: '💳 Thanh toán không thành công',
      message: `Thanh toán ${paymentMethod.toUpperCase()} thất bại: ${reason}`,
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      action: {
        label: 'Thanh toán lại',
        onClick: () => window.location.href = '/checkout'
      },
      duration: 0, // Không tự động đóng
      ...options
    });
  }, [addNotification]);

  const contextValue: NotificationContextType = {
    showNotification: addNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showOrderSuccess,
    showOrderFailed,
    showPaymentSuccess,
    showPaymentFailed,
    notifications,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <div className="fixed top-20 right-4 z-50 space-y-3">
        {notifications.map((notification) => (
          <ModernNotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default ModernNotificationItem;
