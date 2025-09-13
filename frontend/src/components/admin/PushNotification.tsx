import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Bell, AlertCircle, CheckCircle, Volume2, AlertTriangle } from 'lucide-react';

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'message' | 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  icon?: React.ReactNode;
}

interface PushNotificationProps {
  notification: NotificationData | null;
  onClose: () => void;
}

const PushNotification: React.FC<PushNotificationProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      setIsLeaving(false);
      
      // Add sound animation effect
      const soundIcon = document.querySelector('.sound-animation');
      if (soundIcon) {
        soundIcon.classList.add('animate-pulse');
        setTimeout(() => {
          soundIcon.classList.remove('animate-pulse');
        }, 1000);
      }
      
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const getIcon = () => {
    if (notification?.icon) return notification.icon;
    
    switch (notification?.type) {
      case 'message':
        return <MessageCircle className="w-5 h-5 admin-text-blue" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeStyles = () => {
    switch (notification?.type) {
      case 'message':
        return 'admin-border-blue admin-bg-blue-light';
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (!notification || !isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${
        isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-xl border-l-4 ${getTypeStyles()} p-4 relative`}
        style={{
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex items-start space-x-3 pr-6">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5 relative">
            {getIcon()}
            {/* Sound indicator */}
            <div className="absolute -top-1 -right-1">
              <Volume2 className={`w-3 h-3 sound-animation ${
                notification.type === 'error' ? 'text-red-500' : 'admin-text-blue'
              }`} />
            </div>
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {notification.title}
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              {notification.message}
            </p>
            <p className="text-xs text-gray-400">
              {notification.timestamp.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
          <div
            className={`h-full animate-pulse ${
              notification.type === 'error' ? 'bg-red-500' : 'admin-bg-blue'
            }`}
            style={{
              animation: 'progress 5s linear forwards'
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        .sound-animation {
          animation: soundPulse 0.5s ease-in-out;
        }
        
        @keyframes soundPulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default PushNotification;
