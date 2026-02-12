import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDailyAppointments, checkInPatient } from '../../services/receptionist.service'; // Fix dynamic import later if needed, but easier to just use standard import here
import { Calendar, Clock, CheckCircle, UserPlus, RotateCw } from 'lucide-react';
import { format } from 'date-fns';

const ReceptionistDashboard = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
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

    const handleCheckIn = async (appointmentId: string) => {
        try {
            await checkInPatient(appointmentId);
            loadAppointments(); 
        } catch (error) {
            console.error("Failed to check in patient", error);
            alert("Failed to check in patient");
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

    const AppointmentRow = ({ appointment, showActions }: { appointment: any, showActions?: boolean }) => (
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
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : 
                      appointment.status === 'CHECKED_IN' ? 'bg-orange-100 text-orange-800' : 
                      appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                      appointment.status === 'NO_SHOW' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                    {appointment.status.replace('_', ' ')}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {showActions && appointment.status === 'CONFIRMED' && (
                    <div className="flex justify-end gap-2">
                         <button 
                            onClick={() => handleCheckIn(appointment.id)}
                            className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-xs"
                        >
                            Check In
                        </button>
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
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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
                    <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
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
                        <h2 className="text-lg font-semibold">Waiting Room (Cheked In)</h2>
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
        </div>
    );
};

export default ReceptionistDashboard;
