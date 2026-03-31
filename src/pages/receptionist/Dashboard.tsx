import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDailyAppointments, checkInPatient } from '../../services/receptionist.service';
import { AppointmentService } from '../../services/appointment.service';
import { Calendar, Clock, CheckCircle, UserPlus, RotateCw, DollarSign, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Role } from '../../constants/roles';

const ReceptionistDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [waiveModal, setWaiveModal] = useState<{open: boolean, appointmentId: string | null}>({open: false, appointmentId: null});
    const [waiveReason, setWaiveReason] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        confirmed: 0,
        checkedIn: 0,
        completed: 0
    });

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const data = await getDailyAppointments();
            setAppointments(data);
            
            // Calculate stats
            const newStats = {
                total: data.length,
                confirmed: data.filter((a: any) => a.status === 'CONFIRMED').length,
                checkedIn: data.filter((a: any) => a.status === 'CHECKED_IN').length,
                completed: data.filter((a: any) => a.status === 'COMPLETED').length
            };
            setStats(newStats);
        } catch (error) {
            console.error("Failed to load appointments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (appointmentId: string, paymentStatus?: string) => {
        // Check payment gate
        if (paymentStatus && paymentStatus !== 'CLEARED' && paymentStatus !== 'WAIVED') {
            toast.error('Payment must be cleared before check-in. Current status: ' + paymentStatus);
            return;
        }
        try {
            await checkInPatient(appointmentId);
            loadAppointments(); 
        } catch (error) {
            console.error("Failed to check in patient", error);
            toast.error("Failed to check in patient");
        }
    };

    const handleNoShow = async (appointmentId: string) => {
        if(!confirm("Mark this appointment as No Show?")) return;
        try {
            // Assuming this service method exists now
            // We need to import it properly at top of file
            // For now, let's assume it was added to imports or we fix imports next
            await import('../../services/receptionist.service').then(m => m.markAppointmentNoShow(appointmentId));
            loadAppointments();
        } catch (error) {
             console.error("Failed to mark no show", error);
             alert("Failed to update status");
        }
    };

    if (loading) return <div>Loading...</div>;

    const waitingList = appointments.filter(a => a.status === 'CHECKED_IN');
    const upcomingList = appointments.filter(a => a.status === 'CONFIRMED');
    const otherList = appointments.filter(a => !['CHECKED_IN', 'CONFIRMED'].includes(a.status));

    const AppointmentRow = ({ appointment, showActions }: { appointment: any, showActions?: boolean }) => {
        const servicePaymentStatus = appointment.paymentStatus || 'AWAITING_PAYMENT';
        const isCleared = servicePaymentStatus === 'CLEARED' || servicePaymentStatus === 'WAIVED';

        const getPaymentBadge = () => {
            switch (servicePaymentStatus) {
                case 'AWAITING_PAYMENT':
                    return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">AWAITING PAYMENT</span>;
                case 'PAYMENT_SUBMITTED':
                    return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">SUBMITTED</span>;
                case 'CLEARED':
                    return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">CLEARED</span>;
                case 'WAIVED':
                    return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">WAIVED</span>;
                default:
                    return null;
            }
        };

        return (
        <tr key={appointment.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {format(new Date(appointment.startTime), 'h:mm a')}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                    {appointment.patient.firstName} {appointment.patient.lastName}
                </div>
                <div className="text-xs text-gray-500">{appointment.patient.patientNumber}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Dr. {appointment.doctor.user.lastName}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {appointment.type}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${appointment.status === 'CONFIRMED' ? 'bg-sky-100 text-sky-700' : 
                          appointment.status === 'CHECKED_IN' ? 'bg-orange-100 text-orange-800' : 
                          appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                          appointment.status === 'NO_SHOW' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        {appointment.status.replace('_', ' ')}
                    </span>
                    {getPaymentBadge()}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {showActions && appointment.status === 'CONFIRMED' && (
                    <div className="flex justify-end gap-2 flex-wrap">
                         <button 
                            onClick={() => handleCheckIn(appointment.id, servicePaymentStatus)}
                            disabled={!isCleared}
                            title={!isCleared ? 'Payment must be cleared before check-in' : ''}
                            className={`text-white px-3 py-1 rounded-md text-xs ${
                                isCleared 
                                    ? 'bg-sky-500 hover:bg-sky-600' 
                                    : 'bg-gray-300 cursor-not-allowed'
                            }`}
                        >
                            Check In
                        </button>

                        {servicePaymentStatus === 'PAYMENT_SUBMITTED' && ['ADMIN', 'ACCOUNTANT', 'RECEPTIONIST'].includes(user?.role || '') && (
                            <button
                                onClick={async () => {
                                    try {
                                        await AppointmentService.clearPayment(appointment.id);
                                        toast.success('Payment cleared');
                                        loadAppointments();
                                    } catch(e: any) { toast.error(e.response?.data?.message || 'Failed'); }
                                }}
                                className="bg-green-50 text-green-600 px-3 py-1 rounded-md text-xs hover:bg-green-100 flex items-center gap-1"
                            >
                                <DollarSign className="w-3 h-3" /> Clear
                            </button>
                        )}

                        {servicePaymentStatus !== 'CLEARED' && servicePaymentStatus !== 'WAIVED' && user?.role === Role.ADMIN && (
                            <button
                                onClick={() => setWaiveModal({open: true, appointmentId: appointment.id})}
                                className="bg-purple-50 text-purple-600 px-3 py-1 rounded-md text-xs hover:bg-purple-100 flex items-center gap-1"
                            >
                                <Shield className="w-3 h-3" /> Waive
                            </button>
                        )}

                        <button 
                            onClick={() => handleNoShow(appointment.id)}
                            className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-md text-xs border border-red-200"
                        >
                            No Show
                        </button>
                    </div>
                )}
            </td>
        </tr>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Reception Dashboard</h1>
                <div className="flex gap-3">
                    <button 
                         onClick={loadAppointments}
                         className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                    >
                        <RotateCw className="w-4 h-4" />
                        Refresh
                    </button>
                    <button 
                        onClick={() => navigate('/receptionist/booking')}
                        className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600"
                    >
                        <Calendar className="w-4 h-4" />
                        Book Appointment
                    </button>
                    <button 
                        onClick={() => navigate('/receptionist/register')}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                        <UserPlus className="w-4 h-4" />
                        New Patient
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm">Total Appointments</div>
                    <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm">Expected (Pending)</div>
                    <div className="text-2xl font-bold text-sky-500">{stats.confirmed}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm">Warning Room (Arrived)</div>
                    <div className="text-2xl font-bold text-orange-600">{stats.checkedIn}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm">Completed</div>
                    <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                </div>
            </div>

            {/* Waiting Room Section */}
             {waitingList.length > 0 && (
                <div className="bg-orange-50 rounded-xl shadow-sm border border-orange-100 overflow-hidden mb-6">
                    <div className="p-4 border-b border-orange-100 flex items-center gap-2 text-orange-800">
                        <CheckCircle className="w-5 h-5" />
                        <h2 className="text-lg font-semibold">Waiting Room (Checked In)</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <tbody className="divide-y divide-orange-100">
                                {waitingList.map(app => <AppointmentRow key={app.id} appointment={app} />)}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Main Appointment List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Upcoming / Recent Schedule</h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* Confirmed First */}
                            {upcomingList.map(app => <AppointmentRow key={app.id} appointment={app} showActions={true} />)}
                            
                            {/* Then others */}
                            {otherList.map(app => <AppointmentRow key={app.id} appointment={app} />)}
                        </tbody>
                    </table>
                    {appointments.length === 0 && (
                         <div className="p-8 text-center text-gray-500">
                             No appointments scheduled for today.
                         </div>
                    )}
                </div>
            </div>

            {/* Waiver Modal */}
            {waiveModal.open && waiveModal.appointmentId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Shield className="text-purple-500" /> Emergency Waiver
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">
                            This will waive the payment requirement for this appointment. Please provide a reason.
                        </p>
                        <textarea
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 h-24 mb-4"
                            placeholder="Reason for waiver (e.g., Emergency patient, VIP, etc.)"
                            value={waiveReason}
                            onChange={e => setWaiveReason(e.target.value)}
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => { setWaiveModal({open: false, appointmentId: null}); setWaiveReason(''); }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await AppointmentService.waivePayment(waiveModal.appointmentId!, waiveReason || 'Emergency waiver');
                                        toast.success('Payment waived');
                                        setWaiveModal({open: false, appointmentId: null});
                                        setWaiveReason('');
                                        loadAppointments();
                                    } catch(e: any) { toast.error(e.response?.data?.message || 'Failed to waive'); }
                                }}
                                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium"
                            >
                                Confirm Waiver
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceptionistDashboard;
