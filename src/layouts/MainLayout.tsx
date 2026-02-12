import type { ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
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
            <button className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="w-6 h-6" />
            </button>
            
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
      </div>
    </div>
  );
};

export default MainLayout;
