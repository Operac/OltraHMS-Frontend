import { AdminService } from '../../services/admin.service';
import { useState, useEffect } from 'react';
import { Users, Activity, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center text-sm">
        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
        <span className="text-green-500 font-medium">{trend}</span>
        <span className="text-gray-400 ml-1">vs last month</span>
      </div>
    )}
  </motion.div>
);

const AdminDashboard = () => {
    // const { token } = useAuth(); // Not needed if api interceptor handles it
    const [stats, setStats] = useState({
        totalPatients: 0,
        activeStaff: 0,
        todayAppointments: 0,
        revenuePending: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await AdminService.getStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500">System overview and management</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                    System Status: Healthy
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Patients" 
                    value={loading ? '...' : stats.totalPatients} 
                    icon={Users} 
                    color="bg-blue-500" 
                    trend="+12%" 
                />
                <StatCard 
                    title="Today's Appointments" 
                    value={loading ? '...' : stats.todayAppointments} 
                    icon={Calendar} 
                    color="bg-teal-500" 
                    trend="Now" 
                />
                <StatCard 
                    title="Active Staff" 
                    value={loading ? '...' : stats.activeStaff} 
                    icon={Activity} 
                    color="bg-green-500" 
                    trend="Stable" 
                />
                <StatCard 
                    title="Revenue (Pending)" 
                    value={loading ? '...' : `$${stats.revenuePending}`} 
                    icon={DollarSign} 
                    color="bg-orange-500" 
                    trend="Unpaid" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[300px]">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Hospital Occupancy</h3>
                    <div className="flex items-center justify-center h-full text-gray-400">Chart Placeholder</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[300px]">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="flex items-center gap-4 text-sm">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-gray-600">New patient registered</span>
                                <span className="ml-auto text-gray-400">Just now</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
