import React, { useState, useEffect, createContext, useContext } from 'react';

// Create a context for the notification system
const NotificationContext = createContext();

// Types of notifications with corresponding styles
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add a new notification
  const addNotification = (message, type = NOTIFICATION_TYPES.INFO, duration = 3000) => {
    const id = Date.now();
    
    // Create new notification object
    const newNotification = {
      id,
      message,
      type,
      duration,
    };
    
    // Add to notifications array
    setNotifications(prev => [...prev, newNotification]);
    
    // Remove notification after duration
    if (duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  };

  // Remove a notification by ID
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Helper functions for specific notification types
  const success = (message, duration) => addNotification(message, NOTIFICATION_TYPES.SUCCESS, duration);
  const error = (message, duration) => addNotification(message, NOTIFICATION_TYPES.ERROR, duration);
  const warning = (message, duration) => addNotification(message, NOTIFICATION_TYPES.WARNING, duration);
  const info = (message, duration) => addNotification(message, NOTIFICATION_TYPES.INFO, duration);

  // Create the context value
  const contextValue = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Hook to use the notification system
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Individual notification component
const Notification = ({ notification, onClose }) => {
  const { id, message, type } = notification;
  
  // Choose icon based on notification type
  const getIcon = () => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return '✅';
      case NOTIFICATION_TYPES.ERROR:
        return '❌';
      case NOTIFICATION_TYPES.WARNING:
        return '⚠️';
      case NOTIFICATION_TYPES.INFO:
      default:
        return 'ℹ️';
    }
  };
  
  return (
    <div className={`notification notification-${type} animate-slide-up`}>
      <div className="notification-icon">{getIcon()}</div>
      <div className="notification-content">{message}</div>
      <button className="notification-close" onClick={() => onClose(id)}>×</button>
    </div>
  );
};

// Container component for all notifications
const NotificationContainer = () => {
  const { notifications, removeNotification } = useContext(NotificationContext);
  
  if (notifications.length === 0) {
    return null;
  }
  
  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationProvider;