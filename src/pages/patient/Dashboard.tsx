import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PatientService } from '../../services/patient.service';
import api from '../../services/api';
import { Calendar, Activity, Pill, CreditCard, ChevronRight, Video, TestTube } from 'lucide-react';

interface DashboardStats {
    nextAppointment: any | null;
    activeMedications: number;
    outstandingBalance: number;
    recentActivity: any[];
    vitals: any | null;
    queueStatus: any | null;
    medicationSchedule: {
        prescriptions: any[];
        administrations: any[];
    } | null;
}

const PatientDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    const handleOrderDelivery = async (prescriptionId: string) => {
        if (!confirm("Order home delivery for this prescription?")) return;
        try {
            await api.post('/pharmacy/orders', { prescriptionId, delivery: true });
            alert("Order placed! You will receive a notification shortly.");
        } catch (error) {
            alert("Failed to place order.");
        }
    };

    const handleBookLab = (labRequestId: string) => {
        // Redirect to appointment booking page instead of direct POST since 
        // full details (doctor, time) are required by the backend.
        window.location.href = `/appointments/new?type=LAB&reason=Lab Request Fulfillment ${labRequestId}`;
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch in parallel
                const [queue, records, invoices, prescriptions, profile, medSchedule, dashboardStats] = await Promise.all([
                    PatientService.getQueueStatus().catch(() => null), 
                    PatientService.getMedicalRecords().catch(() => []), 
                    PatientService.getInvoices().catch(() => []), 
                    PatientService.getPrescriptions().catch(() => []), 
                    PatientService.getEmergencyProfile().catch(() => null),
                    PatientService.getMedicationSchedule().catch(() => null),
                    PatientService.getDashboardStats().catch(() => null)
                ]);

                // Calculate Outstanding Balance
                const balance = invoices.reduce((acc: number, inv: any) => acc + (inv.balance || 0), 0);
                
                // Count Active Medications
                const activeMeds = prescriptions.filter((p: any) => p.status === 'ACTIVE').length;

                // Process Recent Activity (Last 5 records)
                const sortedRecords = Array.isArray(records) ? records.slice(0, 5) : [];

                setStats({
                    nextAppointment: dashboardStats?.nextAppointment || null,
                    queueStatus: queue?.appointmentId ? queue : null,
                    activeMedications: activeMeds,
                    outstandingBalance: balance,
                    recentActivity: sortedRecords,
                    vitals: profile,
                    medicationSchedule: medSchedule
                });
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName}!</h1>
                    <p className="text-blue-100 mb-6 max-w-lg">Manage your health journey, view records, and connect with your doctors securely.</p>
                    
                    <div className="flex flex-wrap gap-4">
                        <Link to="/appointments/new" className="bg-white text-blue-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-sm flex items-center gap-2 text-sm transform hover:scale-105 duration-200">
                            <Calendar className="w-4 h-4" />
                            Book Appointment
                        </Link>
                        <Link to="/records" className="bg-blue-800/50 backdrop-blur-sm text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-800 transition-all border border-blue-400/30 flex items-center gap-2 text-sm">
                            <Activity className="w-4 h-4" />
                            View Records
                        </Link>
                         {/* Show Join Call if active appointment exists */}
                         {stats?.queueStatus?.appointmentId && (
                             <Link to={`/consultation/video/${stats.queueStatus.appointmentId}`} className="bg-green-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-green-600 transition-all shadow-sm flex items-center gap-2 text-sm animate-pulse">
                                <Video className="w-4 h-4" />
                                Join Video Call
                            </Link>
                         )}
                    </div>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute right-0 top-0 h-full w-1/2 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Queue / Appointment Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                            <Calendar className="w-5 h-5" />
                        </div>
                        {stats?.nextAppointment || stats?.queueStatus ? (
                             <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-wider"> Confirmed </span>
                        ) : (
                             <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full uppercase tracking-wider"> Inactive </span>
                        )}
                    </div>
                    
                    {stats?.queueStatus?.appointmentId ? (
                        <div>
                             <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wide mb-1">Today's Queue</h3>
                             <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-3xl font-bold text-gray-900">#{stats.queueStatus.queuePosition || '-'}</span>
                             </div>
                             <p className="text-sm text-gray-500 mt-1">
                                Est. Wait: <span className="text-blue-600 font-semibold">{stats.queueStatus.estimatedWaitTime} mins</span>
                             </p>
                             <div className="mt-4 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-400">Dr. Availability: Online</p>
                             </div>
                        </div>
                    ) : stats?.nextAppointment ? (
                        <div>
                             <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wide mb-1">Upcoming</h3>
                             <p className="text-sm font-semibold text-gray-900 mt-2">{stats.nextAppointment.doctorName || 'Doctor'}</p>
                             <p className="text-xs text-gray-500">
                                {new Date(stats.nextAppointment.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(stats.nextAppointment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </p>
                             <div className="mt-4 pt-3 border-t border-gray-100">
                                <Link to="/appointments" className="text-blue-600 text-xs font-medium inline-block hover:underline">Manage &rarr;</Link>
                             </div>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wide mb-2">No Appointments Today</h3>
                             <p className="text-sm text-gray-400 leading-relaxed">You have no scheduled visits for today.</p>
                             <Link to="/appointments" className="text-blue-600 text-sm font-medium mt-4 inline-block hover:underline">View Schedule &rarr;</Link>
                        </div>
                    )}
                </div>

                {/* Vitals Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                     <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors">
                            <Activity className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full uppercase tracking-wider"> Health Profile </span>
                    </div>
                    
                     {stats?.vitals ? (
                         <div className="space-y-3">
                             <div className="flex justify-between items-center px-2 py-1 bg-gray-50 rounded-lg">
                                 <span className="text-gray-500 text-sm">Blood Group</span>
                                 <span className="font-bold text-gray-900">{stats.vitals.bloodGroup || 'N/A'}</span>
                             </div>
                             <div className="flex justify-between items-center px-2 py-1 bg-gray-50 rounded-lg">
                                 <span className="text-gray-500 text-sm">Genotype</span>
                                 <span className="font-bold text-gray-900">{stats.vitals.genotype || 'N/A'}</span>
                             </div>
                              <p className="text-xs text-gray-400 mt-2 px-1">
                                Allergies: {stats.vitals.allergies || 'None'}
                              </p>
                         </div>
                     ) : (
                         <div className="mt-4 text-gray-400 text-sm">Profile incomplete.</div>
                     )}
                </div>

                {/* Medications Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                     <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                            <Pill className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wider"> Medications </span>
                    </div>
                     <div className="mt-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-gray-900">{stats?.activeMedications || 0}</span>
                            <span className="text-sm text-gray-500 font-medium">Active Prescriptions</span>
                        </div>
                        
                        <Link to="/medications" className="mt-6 w-full py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm transition-colors flex items-center justify-center gap-2 group-hover:bg-emerald-50 group-hover:text-emerald-700">
                             Request Refill <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                 {/* Billing Card */}
                 <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                     <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 group-hover:bg-teal-100 transition-colors">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-full uppercase tracking-wider"> Billing </span>
                    </div>
                     <div className="mt-2">
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm text-gray-500 font-medium self-start mt-1">₦</span>
                            <span className="text-3xl font-bold text-gray-900">{stats?.outstandingBalance.toLocaleString()}</span>
                        </div>
                         <p className="text-xs text-gray-400 mt-1">
                           Total Outstanding
                        </p>
                        <Link to="/billing" className="mt-6 block w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm transition-colors shadow-sm text-center">
                            Pay Now
                        </Link>
                    </div>
                </div>
                </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Prescriptions / Order Delivery */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Pill className="w-5 h-5 text-emerald-600" /> My Prescriptions
                    </h3>
                    {/* Revised Medication Schedule Section */}
                    {stats?.medicationSchedule?.prescriptions?.length ? (
                    <div className="space-y-4">
                        {stats.medicationSchedule.prescriptions.map((p:any) => {
                             // Check if taken today
                            const isTaken = stats.medicationSchedule?.administrations.some((a: any) => a.prescriptionId === p.id && a.status === 'GIVEN');
                            
                            // Simple frequency mapper
                            const frequencyMap: Record<string, string> = {
                                'OD': 'Once Daily',
                                'BD': 'Twice Daily',
                                'TDS': '3 Times Daily',
                                'QDS': '4 Times Daily'
                            };

                            return (
                                <div key={p.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isTaken ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                            <Pill className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{p.medicationName}</p>
                                            <p className="text-xs text-gray-500 font-medium">
                                                {p.dosage} • {frequencyMap[p.frequency] || p.frequency} 
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right">
                                        {isTaken ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                Taken Today
                                            </span>
                                        ) : (
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full mb-1">Due Today</span>
                                                 {/* Delivery button if needed */}
                                                <button 
                                                    onClick={() => handleOrderDelivery(p.id)}
                                                    className="text-[10px] text-gray-400 hover:text-blue-600 underline"
                                                >
                                                    Order Refill
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic">No scheduled medications.</p>
                    )}
                </div>

                {/* Pending Lab Requests */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TestTube className="w-5 h-5 text-teal-600" /> Pending Lab Tests
                    </h3>
                    {/* Placeholder for Lab Data - assuming it comes in similar stats object */}
                    <div className="bg-teal-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-teal-800 font-medium mb-2">You have 1 pending lab test.</p>
                        <button 
                            onClick={() => handleBookLab('mock-id')}
                            className="text-xs bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
                        >
                            Book Lab Test
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" /> Recent Medical History
                    </h3>
                    <Link to="/records" className="text-blue-600 text-sm font-medium hover:underline flex items-center">
                        View Full History <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>
                <div className="divide-y divide-gray-50">
                    {stats?.recentActivity.length ? (
                        stats.recentActivity.map((record: any) => (
                            <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{record.diagnosis || 'Medical Consultation'}</h4>
                                    <p className="text-sm text-gray-500">
                                        Dr. {record.doctor?.lastName} • {new Date(record.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">Record</span>
                            </div>
                        ))
                    ) : (
                         <div className="p-12 text-center">
                             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                                 <Activity className="w-8 h-8" />
                             </div>
                             <p className="text-gray-500 font-medium">No recent medical history found.</p>
                             <p className="text-gray-400 text-sm">Your medical records will appear here.</p>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default PatientDashboard;
