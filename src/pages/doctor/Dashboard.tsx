import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats } from '../../services/doctor.service';
import { Calendar, Clock, FileText } from 'lucide-react';

const DoctorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
             if (!user?.staffId) return;
             try {
                 const data = await getDashboardStats();
                 setAppointments(data.appointments);
                 setStats(data.stats);
             } catch (err) {
                 console.error("Failed to load dashboard", err);
             } finally {
                 setLoading(false);
             }
        };
        loadDashboard();
    }, [user]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
            <p className="text-gray-500">Welcome back, Dr. {user?.firstName}</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {/* KPI Cards from Stats */}
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-gray-500 font-medium mb-1">Waiting</div>
                    <div className="text-3xl font-bold text-orange-600">{stats?.waiting || 0}</div>
                 </div>
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-gray-500 font-medium mb-1">In Progress</div>
                    <div className="text-3xl font-bold text-blue-600">{stats?.inProgress || 0}</div>
                 </div>
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-gray-500 font-medium mb-1">Completed</div>
                    <div className="text-3xl font-bold text-green-600">{stats?.completed || 0}</div>
                 </div>
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-gray-500 font-medium mb-1">Total Today</div>
                    <div className="text-3xl font-bold text-gray-900">{stats?.totalToday || 0}</div>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Next Appointment Highlight */}
                 <div className="lg:col-span-2">
                     <div 
                        onClick={() => stats?.nextPatient && navigate(`/consultation/${stats.nextPatient.id}`)}
                        className={`bg-blue-600 text-white p-8 rounded-xl shadow-lg transition-transform hover:scale-[1.02] cursor-pointer relative overflow-hidden ${!stats?.nextPatient ? 'opacity-90 cursor-default' : ''}`}
                     >
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 text-blue-100 mb-2">
                                    <Clock className="w-5 h-5" />
                                    <span className="font-medium">Up Next</span>
                                </div>
                                <h2 className="text-4xl font-bold mb-2">
                                    {stats?.nextPatient ? `${stats.nextPatient.patient.firstName} ${stats.nextPatient.patient.lastName}` : 'No Pending Patients'}
                                </h2>
                                <p className="text-blue-100 text-lg">
                                    {stats?.nextPatient ? `Scheduled for ${new Date(stats.nextPatient.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'You have cleared your queue!'}
                                </p>
                            </div>
                            {stats?.nextPatient && (
                                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold shadow-md hover:bg-blue-50 transition-colors">
                                    Call Patient
                                </button>
                            )}
                        </div>
                     </div>
                 </div>

                 {/* Quick Links */}
                 <div className="space-y-4">
                     <div 
                        onClick={() => navigate('/appointments')}
                        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between"
                     >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 rounded-lg text-purple-600"><Calendar className="w-6 h-6" /></div>
                            <span className="font-bold text-gray-700">Full Schedule</span>
                        </div>
                     </div>
                     <div 
                        onClick={() => navigate('/records')}
                        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between"
                     >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 rounded-lg text-green-600"><FileText className="w-6 h-6" /></div>
                            <span className="font-bold text-gray-700">Medical Records</span>
                        </div>
                     </div>
                 </div>
            </div>

            {/* Queue List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Patient Queue</h3>
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading queue...</div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        No appointments for today.
                    </div>
                ) : (
                     <div className="space-y-3">
                        {appointments.map((apt) => (
                            <div key={apt.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                        apt.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500 ring-offset-2' : 
                                        apt.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {apt.patient.firstName[0]}{apt.patient.lastName[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 text-lg">{apt.patient.firstName} {apt.patient.lastName}</div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span className="font-medium">{new Date(apt.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            <span>•</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                apt.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                'bg-orange-100 text-orange-700'
                                            }`}>{apt.status.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden group-hover:flex gap-2">
                                    <button 
                                        onClick={() => navigate(`/consultation/${apt.id}`)}
                                        className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium shadow-sm"
                                    >
                                        {apt.status === 'COMPLETED' ? 'View Summary' : 'Open Chart'}
                                    </button>
                                </div>
                            </div>
                        ))}
                     </div>
                )}
            </div>
        </div>
    );
};

export default DoctorDashboard;
