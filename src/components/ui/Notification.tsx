import React, { useEffect, useState } from 'react';
import { Notification as NotificationType } from '../../types';

interface NotificationProps {
  notification: NotificationType;
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({
  notification,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const duration = notification.duration || 3000;
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [notification.duration, onClose]);

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  const colors = {
    success: 'border-green-500 bg-green-900/50',
    error: 'border-red-500 bg-red-900/50',
    info: 'border-blue-500 bg-blue-900/50',
    warning: 'border-binance-yellow bg-binance-yellow/10',
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 border-2 rounded-lg shadow-lg transition-all duration-300 ${
        colors[notification.type]
      } ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
    >
      <span className="text-xl">{icons[notification.type]}</span>
      <span className="text-white font-medium">{notification.message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-2 text-gray-400 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
};
