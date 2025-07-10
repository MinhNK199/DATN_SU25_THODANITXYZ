import React, { useState, useCallback } from 'react';
import ToastNotification, { ToastProps } from './ToastNotification';

interface ToastContainerProps {
  children?: React.ReactNode;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((title: string, message: string, duration?: number) => {
    addToast({ type: 'success', title, message, duration });
  }, [addToast]);

  const showError = useCallback((title: string, message: string, duration?: number) => {
    addToast({ type: 'error', title, message, duration });
  }, [addToast]);

  const showWarning = useCallback((title: string, message: string, duration?: number) => {
    addToast({ type: 'warning', title, message, duration });
  }, [addToast]);

  const showInfo = useCallback((title: string, message: string, duration?: number) => {
    addToast({ type: 'info', title, message, duration });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

const ToastContainer: React.FC<ToastContainerProps> = ({ children }) => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </>
  );
};

export default ToastContainer; 