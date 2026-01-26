import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import { notificationService, Notification } from '@/services/notificationService';
import { useAuth } from '@/context/AuthContext';

export default function NotificationSection() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  useEffect(() => {
    fetchNotifications(0, true);
  }, []);

  const fetchNotifications = async (skip: number, reset: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await notificationService.getMyNotifications(skip, LIMIT);
      const newNotifications = response.data;
      
      if (newNotifications.length < LIMIT) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      
      if (reset) {
        setNotifications(newNotifications);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage * LIMIT);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      // Refresh current list status
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <Bell className="w-6 h-6 text-cyan-400" />
          Notifications
        </h2>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
        >
          <Check className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No notifications yet</div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-5 transition-colors ${
                  !notification.is_read ? 'bg-cyan-500/5 hover:bg-cyan-500/10' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex gap-4">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    !notification.is_read ? 'bg-cyan-400' : 'bg-transparent'
                  }`} />
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-medium ${
                        !notification.is_read ? 'text-slate-100' : 'text-slate-400'
                      }`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {hasMore && !isLoading && notifications.length > 0 && (
          <div className="p-4 text-center border-t border-white/5">
            <button
              onClick={loadMore}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
            >
              Load More History
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
