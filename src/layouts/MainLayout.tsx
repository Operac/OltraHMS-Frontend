import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWidget from '../components/ChatWidget';
import { Bell, Search, User, Check, Menu, X, Calendar, User as UserIcon, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markAsRead, markAllAsRead, type Notification } from '../services/notification.service';
import { searchGlobal, type SearchResult } from '../services/search.service';
import { Role } from '../constants/roles';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

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
      } finally {
          setLoadingNotifications(false);
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
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Global search with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setSearching(true);
        const results = await searchGlobal(searchQuery);
        setSearchResults(results);
        setShowSearchResults(true);
        setSearching(false);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
          <div 
              className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
          ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-72 transform bg-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center gap-4">
            <button 
                    onClick={() => setSidebarOpen(true)}
                    className="text-gray-500 focus:outline-none lg:hidden -ml-2 p-2 sm:p-3 hover:bg-gray-100 rounded-lg touch-manipulation"
                >
                    <Menu className="w-6 h-6" />
                </button>
            <div className="relative w-full max-w-sm hidden sm:block" ref={searchRef}>
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                className="w-full py-2 pl-10 pr-4 text-sm text-gray-700 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                placeholder="Search patients, doctors, records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
                  {searching ? (
                    <div className="p-4 text-center text-gray-400 text-sm">Searching...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">No results found</div>
                  ) : (
                    <div className="py-1">
                      {searchResults.map((result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => {
                            navigate(result.path);
                            setSearchQuery('');
                            setShowSearchResults(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                        >
                          {result.type === 'patient' ? (
                            <UserIcon className="w-4 h-4 text-sky-500" />
                          ) : result.type === 'staff' ? (
                            <Stethoscope className="w-4 h-4 text-green-500" />
                          ) : (
                            <Calendar className="w-4 h-4 text-purple-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-800">{result.name}</p>
                            <p className="text-xs text-gray-500">{result.subtitle}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
                <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 sm:p-3 text-gray-400 hover:text-sky-500 rounded-full hover:bg-gray-100 transition-colors relative touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Dropdown */}
                {showNotifications && (
                    <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                        <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-700 text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <button onClick={handleMarkAllRead} className="text-xs text-sky-500 hover:text-sky-700 hover:underline">
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {loadingNotifications ? (
                                <div className="p-4 space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-3 animate-pulse">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-gray-200 shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">No notifications</div>
                            ) : (
                                notifications.map(notification => (
                                    <div 
                                        key={notification.id} 
                                        className={clsx(
                                            "p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors group relative",
                                            notification.status !== 'READ' ? "bg-sky-50/50" : ""
                                        )}
                                    >
                                        <div className="flex gap-3">
                                            <div className={clsx(
                                                "w-2 h-2 mt-2 rounded-full shrink-0",
                                                notification.priority === 'CRITICAL' ? "bg-red-500" : 
                                                notification.priority === 'HIGH' ? "bg-orange-500" : "bg-sky-400",
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
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-sky-500 transition-opacity"
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
            
            <button className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
              <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center text-sky-500">
                <User className="w-5 h-5" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700">
                    {user?.role === Role.DOCTOR ? 'Dr. ' : ''}{user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role ? user.role.toLowerCase() : 'User'}</p>
              </div>
            </button>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6">
          {children}
        </main>
        <ChatWidget />
      </div>
    </div>
  );
};

export default MainLayout;
