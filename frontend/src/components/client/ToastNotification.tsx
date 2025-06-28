import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  toasts: ToastProps[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Return mock context for UI only
    return {
      showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        console.log('Toast:', type, message);
      },
      toasts: []
    };
  }
  return context;
};

interface ToastNotificationProps {
  toast: ToastProps;
  onRemove: (id: string) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show toast with animation
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Auto remove toast
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [toast.id, toast.duration, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <FaCheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <FaExclamationTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <FaExclamationTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <FaInfoCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <FaInfoCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`${getBgColor()} border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              {toast.title}
            </h4>
            <p className="text-sm text-gray-600">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onRemove(toast.id), 300);
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Date.now().toString();
    const newToast: ToastProps = {
      id,
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      message,
      duration: 5000
    };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const contextValue: ToastContextType = {
    showToast: addToast,
    toasts
  };

  return (
    <ToastContext.Provider value={contextValue}>
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastNotification; 