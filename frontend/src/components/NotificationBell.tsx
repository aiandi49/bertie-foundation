import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useNotificationStore } from 'utils/notificationStore';

export function NotificationBell() {
  const { notifications, fetchNotifications } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.length;

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <div className="relative">
      <motion.div
        className="p-2 rounded-full hover:bg-white/10 cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-6 h-6 text-white" />
      </motion.div>
      
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-secondary-800 rounded-lg shadow-lg overflow-hidden z-50"
          >
            <div className="p-4 border-b border-secondary-700">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 border-b border-secondary-700 hover:bg-secondary-700/50 transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">{notification.title}</h4>
                        <p className="text-sm text-gray-300">{notification.description}</p>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(notification.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-400">
                  No notifications
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
