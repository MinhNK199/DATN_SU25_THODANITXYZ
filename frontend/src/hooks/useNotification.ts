import { useNotification as useNotificationContext } from '../contexts/NotificationContext';

export const useNotification = () => {
  const { showNotification } = useNotificationContext();

  const success = (message: string, title?: string) => {
    showNotification({
      title: title || 'Thành công',
      message,
      type: 'success'
    });
  };

  const error = (message: string, title?: string) => {
    showNotification({
      title: title || 'Lỗi',
      message,
      type: 'error'
    });
  };

  const warning = (message: string, title?: string) => {
    showNotification({
      title: title || 'Cảnh báo',
      message,
      type: 'warning'
    });
  };

  const info = (message: string, title?: string) => {
    showNotification({
      title: title || 'Thông tin',
      message,
      type: 'info'
    });
  };

  return {
    success,
    error,
    warning,
    info
  };
};
