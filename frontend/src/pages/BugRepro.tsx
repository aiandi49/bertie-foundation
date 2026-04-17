import React, { useEffect } from "react";
import { useNotificationStore } from "utils/notificationStore";
import { Layout } from "components/Layout";
import { Bell, Calendar, Info } from "lucide-react";

export default function BugRepro() {
  const { notifications, loading, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 min-h-[60vh]">
        <div className="flex items-center gap-3 mb-8">
          <Bell className="w-8 h-8 text-primary-500" />
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-secondary-800 rounded-xl p-8 text-center border border-secondary-700">
            <Info className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No New Notifications</h3>
            <p className="text-gray-400">You're all caught up! Check back later for updates.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className="bg-secondary-800 hover:bg-secondary-750 transition-colors p-6 rounded-xl border border-secondary-700 flex flex-col md:flex-row gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{notification.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      notification.type === 'event' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
                    }`}>
                      {notification.type}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-4">{notification.description}</p>
                  <div className="flex items-center text-sm text-gray-500 gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(notification.date).toLocaleDateString()}</span>
                    </div>
                    <span className="text-gray-600">•</span>
                    <span>Posted {new Date(notification.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
