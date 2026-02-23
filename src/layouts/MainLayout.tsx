import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWidget from '../components/ChatWidget';
import { Bell, Search, User, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markAsRead, markAllAsRead, type Notification } from '../services/notification.service';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Auto-logout Logic
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
      }, 15 * 60 * 1000); // 15 minutes
    };

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => resetTimer();

    // Attach listeners
    events.forEach(event => window.addEventListener(event, handleActivity));
    
    // Initial start
    resetTimer();

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [logout]);

  const fetchNotifications = async () => {
      try {
          const data = await getNotifications();
          setNotifications(data);
      } catch (err) {
          console.error("Failed to fetch notifications", err);
      }
  };

  useEffect(() => {
      fetchNotifications();
      // Poll every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
          await markAsRead(id);
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'READ', readAt: new Date().toISOString() } : n));
      } catch (err) {
          console.error("Failed to mark as read", err);
      }
  };

  const handleMarkAllRead = async () => {
      try {
          await markAllAsRead();
          setNotifications(prev => prev.map(n => ({ ...n, status: 'READ', readAt: new Date().toISOString() })));
      } catch (err) {
          console.error("Failed to mark all as read", err);
      }
  };

  const unreadCount = notifications.filter(n => n.status !== 'READ').length;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 z-10">
          <div className="relative w-96">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="w-5 h-5" />
            </span>
            <input 
              type="text" 
              className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search patients, doctors, records..." 
            />
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
                <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors relative"
                >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Dropdown */}
                {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                        <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-700 text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:text-blue-800 hover:underline">
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">No notifications</div>
                            ) : (
                                notifications.map(notification => (
                                    <div 
                                        key={notification.id} 
                                        className={clsx(
                                            "p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors group relative",
                                            notification.status !== 'READ' ? "bg-blue-50/50" : ""
                                        )}
                                    >
                                        <div className="flex gap-3">
                                            <div className={clsx(
                                                "w-2 h-2 mt-2 rounded-full shrink-0",
                                                notification.priority === 'CRITICAL' ? "bg-red-500" : 
                                                notification.priority === 'HIGH' ? "bg-orange-500" : "bg-blue-500",
                                                notification.status === 'READ' && "bg-gray-300"
                                            )} />
                                            <div className="flex-1">
                                                <p className={clsx("text-sm text-gray-800", notification.status !== 'READ' && "font-medium")}>
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                            {notification.status !== 'READ' && (
                                                <button 
                                                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 transition-opacity"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <User className="w-5 h-5" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700">
                    {user?.role === 'DOCTOR' ? 'Dr. ' : ''}{user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role ? user.role.toLowerCase() : 'User'}</p>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
        <ChatWidget />
      </div>
    </div>
  );
};

export default MainLayout;
