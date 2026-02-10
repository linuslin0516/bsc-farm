import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  const onCloseRef = useRef(onClose);

  // Keep the ref updated
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onCloseRef.current(), 300);
  }, []);

  useEffect(() => {
    // Reset visibility when notification changes
    setIsVisible(true);

    const duration = notification.duration || 3000;
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [notification, handleClose]);

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
    warning: 'border-space-cyan bg-space-cyan/10',
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
        onClick={handleClose}
        className="ml-2 text-gray-400 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
};
