import { useState, useEffect } from 'react';
import { supabase, Notification } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Bell } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

export function NotificationsBell() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const unsubscribe = subscribeToNotifications();
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        // If table doesn't exist or RLS issue, silently fail
        if (error.code === '42P01' || error.code === 'PGRST301') {
          console.warn('Notifications table not available');
          setNotifications([]);
          setUnreadCount(0);
          return;
        }
        throw error;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    } catch (error: any) {
      // Only log non-table-missing errors
      if (error?.code !== '42P01' && error?.code !== 'PGRST301') {
        console.error('Error loading notifications:', error);
      }
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const subscribeToNotifications = () => {
    if (!user) return () => {};
    
    try {
      const channel = supabase
        .channel(`notifications_${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, () => {
          loadNotifications();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      // Silently fail if subscription fails (table might not exist)
      console.warn('Failed to subscribe to notifications:', error);
      return () => {};
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);
      
      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST301') {
          return; // Table doesn't exist, silently fail
        }
        throw error;
      }
      
      loadNotifications();
    } catch (error: any) {
      if (error?.code !== '42P01' && error?.code !== 'PGRST301') {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST301') {
          return; // Table doesn't exist, silently fail
        }
        throw error;
      }
      
      loadNotifications();
    } catch (error: any) {
      if (error?.code !== '42P01' && error?.code !== 'PGRST301') {
        console.error('Error marking all as read:', error);
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 pooh:text-pooh-brown hover:text-teal-600 dark:hover:text-teal-400 pooh:hover:text-pooh-yellow-dark hover:bg-teal-50 dark:hover:bg-teal-900/20 pooh:hover:bg-pooh-yellow-light rounded-full transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 dark:bg-red-600 pooh:bg-pooh-red text-white dark:text-gray-900 pooh:text-pooh-brown-dark text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">الإشعارات</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  تحديد الكل كمقروء
                </button>
              )}
            </div>
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 pooh:text-pooh-brown">
                  {t('notifications.noNotifications')}
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 pooh:border-pooh-burlywood hover:bg-gray-50 dark:hover:bg-gray-700 pooh:hover:bg-pooh-yellow-light cursor-pointer ${
                      !notification.is_read ? 'bg-teal-50 dark:bg-teal-900/20 pooh:bg-pooh-yellow-light' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                        !notification.is_read ? 'bg-teal-600 dark:bg-teal-400 pooh:bg-pooh-yellow-dark' : 'bg-gray-300 dark:bg-gray-600 pooh:bg-pooh-burlywood'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 pooh:text-pooh-brown-dark text-sm">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 pooh:text-pooh-brown mt-1">
                          {notification.body}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 pooh:text-pooh-brown mt-1">
                          {formatDate(notification.created_at, language)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

