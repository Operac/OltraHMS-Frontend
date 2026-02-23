import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Calendar, User, Clock } from 'lucide-react';
import api from '../../lib/api';
import { format, parseISO } from 'date-fns';

interface Appointment {
    id: string;
    patient: {
        firstName: string;
        lastName: string;
        patientNumber: string;
    };
    startTime: string;
    endTime: string;
    status: string;
    type: string;
    reason?: string;
}

const TelemedicineDashboard = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTelemedicineAppointments();
    }, []);

    const fetchTelemedicineAppointments = async () => {
        try {
            // Fetch all appointments. Filter by type=TELEMEDICINE.
            // Since we added backend filter, we can use it.
            // We might want to fetch for "today" or "upcoming". 
            // For now, let's fetch for today.
            const today = new Date();
            const response = await api.get(`/appointments?type=TELEMEDICINE&date=${today.toISOString()}`);
            setAppointments(response.data);
        } catch (error) {
            console.error("Failed to load telemedicine appointments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinCall = (appointmentId: string) => {
        navigate(`/consultation/video/${appointmentId}`);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Video className="w-6 h-6 text-teal-600" /> Telemedicine Dashboard
            </h1>

            <div className="bg-teal-50 p-6 rounded-xl border border-teal-100 mb-8">
                <h2 className="text-lg font-semibold text-teal-900 mb-2">Instructions</h2>
                <p className="text-teal-700">
                    Here you can see all your scheduled **Online Consultations** for today. 
                    Click "Start Call" to initiate the video session with the patient.
                </p>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : appointments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No Online Consultations Today</h3>
                    <p className="text-gray-500">You don't have any telemedicine appointments scheduled for today.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {appointments.map((apt) => (
                        <div key={apt.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-teal-100 rounded-lg text-teal-600">
                                    <Video className="w-6 h-6" />
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                    apt.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {apt.status}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {apt.patient.firstName} {apt.patient.lastName}
                            </h3>
                            <div className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                                <User className="w-3 h-3" /> {apt.patient.patientNumber}
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                        {format(parseISO(apt.startTime), 'h:mm a')} - {format(parseISO(apt.endTime), 'h:mm a')}
                                    </span>
                                </div>
                                {apt.reason && (
                                    <div className="text-sm bg-gray-50 p-2 rounded text-gray-600">
                                        Reason: {apt.reason}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => handleJoinCall(apt.id)}
                                disabled={apt.status === 'CANCELLED'}
                                className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Video className="w-4 h-4" /> Start Call
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TelemedicineDashboard;
