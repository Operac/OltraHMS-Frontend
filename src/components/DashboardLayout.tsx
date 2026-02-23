import React, { type ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
    children: ReactNode;
    role?: string;
    title?: string;
}

const DashboardLayout = ({ children, role, title }: DashboardLayoutProps) => {
    const { user, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Role verification (basic)
    // If a specific role is required and user lacks it (and is not an ADMIN override case if applicable)
    // For simplicity, strict check if role is provided.
    // However, Dashboard might be shared.
    if (role && user.role !== role && user.role !== 'ADMIN') { 
         // Allow ADMIN to access mostly everything, or strictly handle it.
         // If role is "ADMIN", only ADMIN can access.
         if (role === 'ADMIN' && user.role !== 'ADMIN') {
             return <Navigate to="/unauthorized" replace />;
         }
         // If role is "DOCTOR" and user is "NURSE", redirect.
    }

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
            <div className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setSidebarOpen(true)}
                                className="text-gray-500 focus:outline-none lg:hidden"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-800">{title || 'Dashboard'}</h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <span className="font-semibold text-gray-800">{user.firstName} {user.lastName}</span>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">{user.role}</span>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg border-2 border-white shadow-sm">
                                {user.firstName?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
