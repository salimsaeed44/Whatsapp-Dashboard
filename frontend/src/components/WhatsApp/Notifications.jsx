import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      message: '💬',
      transfer: '🔄',
      overdue: '⚠️',
      assignment: '📋',
      system: '🔔',
    };
    return icons[type] || '🔔';
  };

  if (loading) {
    return (
      <div className="flex-1 bg-whatsapp-dark-bg flex items-center justify-center">
        <p className="text-whatsapp-text-secondary">جاري التحميل...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="flex-1 bg-whatsapp-dark-bg flex flex-col">
      {/* Header */}
      <div className="h-16 bg-whatsapp-dark-hover px-4 flex items-center justify-between border-b border-whatsapp-border">
        <h2 className="text-lg font-semibold text-whatsapp-text-primary">
          الإشعارات {unreadCount > 0 && `(${unreadCount})`}
        </h2>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-whatsapp-text-secondary">لا توجد إشعارات</p>
          </div>
        ) : (
          <div className="divide-y divide-whatsapp-border">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
                className={`
                  px-4 py-3 cursor-pointer hover:bg-whatsapp-dark-hover transition-colors
                  ${!notification.is_read ? 'bg-whatsapp-dark-panel bg-opacity-50' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-whatsapp-text-primary">
                        {notification.title || 'إشعار'}
                      </h3>
                      {!notification.is_read && (
                        <span className="w-2 h-2 bg-whatsapp-green rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-whatsapp-text-secondary mb-1">
                      {notification.message || notification.content}
                    </p>
                    <span className="text-xs text-whatsapp-text-tertiary">
                      {new Date(notification.created_at).toLocaleString('ar-SA')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

