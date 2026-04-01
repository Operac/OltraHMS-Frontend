import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Plus, ChevronLeft, ChevronRight, Filter, Clock, Video, CalendarX } from 'lucide-react';
import { Role } from '../../constants/roles';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, addDays, subDays, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ui/ConfirmModal';

const Appointments = () => {
    const navigate = useNavigate();
    const { token, user } = useAuth();

    // Check if mobile screen
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // View state: 'day' | 'week' | 'month' | 'list' - default to 'list' on mobile
    const [view, setView] = useState<'day' | 'week' | 'month' | 'list'>(isMobile ? 'list' : 'week');

    // Update view when screen size changes
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile && (view === 'week' || view === 'day' || view === 'month')) {
                setView('list');
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [view]);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelConfirm, setCancelConfirm] = useState<{isOpen: boolean, appointmentId: string | null}>({isOpen: false, appointmentId: null});

    // Week View Logic
    // Date Logic based on View
    const getDays = () => {
        if (view === 'day') {
            return [currentDate];
        } else if (view === 'week') {
            const start = startOfWeek(currentDate, { weekStartsOn: 1 });
            const end = endOfWeek(currentDate, { weekStartsOn: 1 });
            return eachDayOfInterval({ start, end });
        } else {
            // Month View
            const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
            const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
            return eachDayOfInterval({ start, end });
        }
    };

    const days = getDays();

    // Simple Time Grid (8 AM - 6 PM)
    const hours = Array.from({ length: 11 }, (_, i) => i + 8); 

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                let query = `${API_URL}/appointments?startDate=${days[0].toISOString()}&endDate=${days[days.length - 1].toISOString()}`;
                
                if (user?.role === Role.DOCTOR && user.staffId) {
                    query += `&doctorId=${user.staffId}`;
                }

                const res = await axios.get(query, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAppointments(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, [currentDate, token]);

    const getAppointmentsForSlot = (day: Date, hour: number) => {
        return appointments.filter(apt => {
            const aptDate = new Date(apt.startTime);
            return isSameDay(aptDate, day) && aptDate.getHours() === hour;
        });
    };

    const confirmCancel = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setCancelConfirm({ isOpen: true, appointmentId: id });
    };

    const handleCancelAppointment = async () => {
        const id = cancelConfirm.appointmentId;
        if (!id) return;
        setCancelConfirm({ isOpen: false, appointmentId: null });
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            await axios.patch(`${API_URL}/appointments/${id}/status`, 
                { status: 'CANCELLED' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Refresh
            let query = `${API_URL}/appointments?startDate=${days[0].toISOString()}&endDate=${days[days.length - 1].toISOString()}`;
            if (user?.role === Role.DOCTOR && user.staffId) {
                query += `&doctorId=${user.staffId}`;
            }
            const res = await axios.get(query, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(res.data);
            toast.success('Appointment cancelled.');
        } catch (error) {
            console.error('Failed to cancel', error);
            toast.error('Failed to cancel appointment.');
        }
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-100px)] flex flex-col p-6 animate-pulse">
                <div className="flex justify-between mb-6">
                    <div>
                        <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-64"></div>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                        <div className="w-40 h-10 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
                <div className="h-16 bg-gray-200 rounded-t-xl mb-1"></div>
                <div className="flex-1 bg-gray-100 rounded-b-xl"></div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                     <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                     <p className="text-gray-500">Manage schedule and bookings</p>
                </div>
                <div className="flex gap-3">
                    <button className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600">
                        <Filter className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => navigate('/appointments/new')}
                        className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 flex items-center gap-2 font-medium"
                    >
                        <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Appointment</span>
                    </button>
                </div>
            </div>

            {/* Calendar Controls */}
            <div className="bg-white border text-center p-3 sm:p-4 rounded-t-xl border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-4">
                     <button onClick={() => {
                         if (view === 'day') setCurrentDate(subDays(currentDate, 1));
                         else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
                         else setCurrentDate(subMonths(currentDate, 1));
                     }} className="p-1 hover:bg-gray-100 rounded">
                         <ChevronLeft className="w-5 h-5" />
                     </button>
                     <h2 className="text-lg font-bold min-w-[140px] sm:w-48 text-center">
                         {view === 'month'
                             ? format(currentDate, 'MMMM yyyy')
                             : view === 'list'
                                ? format(currentDate, 'MMMM yyyy')
                                : `${format(days[0], 'MMM d')} - ${format(days[days.length - 1], 'MMM d, yyyy')}`
                     }
                     </h2>
                     <button onClick={() => {
                         if (view === 'day') setCurrentDate(addDays(currentDate, 1));
                         else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
                         else setCurrentDate(addMonths(currentDate, 1));
                     }} className="p-1 hover:bg-gray-100 rounded">
                         <ChevronRight className="w-5 h-5" />
                     </button>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg text-sm w-full sm:w-auto justify-center">
                    <button onClick={() => setView('list')} className={`px-3 py-1 rounded transition-colors flex-1 sm:flex-none ${view === 'list' ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-900'}`}>List</button>
                    <button onClick={() => setView('week')} className={`px-3 py-1 rounded transition-colors hidden sm:block ${view === 'week' ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-900'}`}>Week</button>
                    <button onClick={() => setView('day')} className={`px-3 py-1 rounded transition-colors hidden sm:block ${view === 'day' ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-900'}`}>Day</button>
                </div>
            </div>

            {/* Calendar Grid / List View */}
            <div className="bg-white border-x border-b border-gray-200 rounded-b-xl flex-1 overflow-auto">
                
                {/* List View - Mobile Friendly */}
                {view === 'list' ? (
                    <div className="p-2 sm:p-4 space-y-2 sm:space-y-3">
                        {appointments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <CalendarX className="w-12 h-12 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No appointments found</h3>
                                <p className="text-sm">There are no scheduled appointments for this period.</p>
                            </div>
                        ) : (
                            appointments
                                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                                .map(apt => (
                                    <div
                                        key={apt.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer gap-3"
                                        onClick={() => {
                                            if (user?.role === Role.DOCTOR) navigate(`/consultation/${apt.id}`);
                                            else if (apt.type === 'TELEMEDICINE' || apt.type === 'TELEHEALTH') navigate(`/consultation/video/${apt.id}`);
                                        }}
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-sky-100 rounded-lg flex flex-col items-center justify-center text-sky-600 flex-shrink-0">
                                                <span className="text-xs font-bold">{format(new Date(apt.startTime), 'dd')}</span>
                                                <span className="text-[9px] sm:text-[10px] uppercase">{format(new Date(apt.startTime), 'MMM')}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-medium text-gray-900 truncate">
                                                    {user?.role === Role.PATIENT
                                                        ? `Dr. ${apt.doctor?.user?.firstName || ''} ${apt.doctor?.user?.lastName || ''}`
                                                        : `${apt.patient?.firstName || ''} ${apt.patient?.lastName || ''}`
                                                    }
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 sm:gap-2">
                                                    <Clock className="w-3 h-3 flex-shrink-0" />
                                                    <span className="whitespace-nowrap">{format(new Date(apt.startTime), 'h:mm a')} - {format(new Date(apt.endTime), 'h:mm a')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-14 sm:ml-0">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                apt.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600' :
                                                apt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {apt.status}
                                            </span>
                                            {(apt.type === 'TELEMEDICINE' || apt.type === 'TELEHEALTH') && (
                                                <Video className="w-4 h-4 text-teal-500 flex-shrink-0" />
                                            )}
                                            {user?.role === Role.PATIENT && apt.status !== 'CANCELLED' && new Date(apt.startTime) > new Date() && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); confirmCancel(apt.id, e); }}
                                                    className="px-2 sm:px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-200 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                ) : view === 'month' ? (
                     <div className="grid grid-cols-7 h-full">
                         {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                             <div key={day} className="p-2 border-b border-r text-center font-medium bg-gray-50 text-gray-500 text-sm">
                                 {day}
                             </div>
                         ))}
                         {days.map(day => (
                             <div 
                                 key={day.toISOString()} 
                                 className={`min-h-[100px] border-b border-r p-2 hover:bg-gray-50 transition-colors ${!isSameMonth(day, currentDate) ? 'bg-gray-50/50 text-gray-400' : ''}`}
                             >
                                 <div className={`text-sm font-semibold mb-2 ${isSameDay(day, new Date()) ? 'bg-sky-500 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
                                     {format(day, 'd')}
                                 </div>
                                 <div className="space-y-1">
                                    {appointments
                                        .filter(apt => isSameDay(new Date(apt.startTime), day))
                                        .map(apt => (
                                            <div 
                                                key={apt.id}
                                                onClick={(e) => {
                                                     e.stopPropagation();
                                                     if (user?.role === Role.DOCTOR) navigate(`/consultation/${apt.id}`);
                                                     else if (apt.type === 'TELEMEDICINE' || apt.type === 'TELEHEALTH') navigate(`/consultation/video/${apt.id}`);
                                                }}
                                                className={`text-[10px] p-1 rounded truncate cursor-pointer flex justify-between items-center ${
                                                    (apt.type === 'TELEHEALTH' || apt.type === 'TELEMEDICINE') ? 'bg-teal-100 text-teal-700' : 'bg-sky-100 text-sky-600'
                                                }`}
                                            >
                                                <span className="truncate">
                                                    {format(new Date(apt.startTime), 'HH:mm')} {user?.role === Role.PATIENT ? apt.doctor?.user?.lastName : apt.patient.lastName}
                                                </span>
                                                {user?.role === Role.PATIENT && apt.status !== 'CANCELLED' && new Date(apt.startTime) > new Date() && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); confirmCancel(apt.id, e); }}
                                                        className="ml-1 text-red-500 hover:text-red-700 font-bold"
                                                        title="Cancel"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    }
                                 </div>
                             </div>
                         ))}
                     </div>
                ) : (
                    // Day & Week View Implementation
                    <div className="overflow-x-auto w-full">
                        <div className={`grid ${view === 'day' ? 'grid-cols-[80px_minmax(300px,1fr)]' : 'grid-cols-[80px_repeat(7,minmax(150px,1fr))]'} min-w-max w-full`}>
                        {/* Time Column Header */}
                        <div className="p-4 border-b border-r bg-gray-50 font-medium text-gray-500 text-sm">Time</div>
                        {/* Day Headers */}
                        {days.map(day => (
                            <div key={day.toString()} className={`p-4 border-b border-r text-center ${isSameDay(day, new Date()) ? 'bg-sky-50' : 'bg-gray-50'}`}>
                                <div className={`text-xs font-semibold uppercase mb-1 ${isSameDay(day, new Date()) ? 'text-sky-500' : 'text-gray-500'}`}>
                                    {format(day, 'EEE')}
                                </div>
                                <div className={`text-xl font-bold ${isSameDay(day, new Date()) ? 'text-sky-600' : 'text-gray-800'}`}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        ))}

                        {/* Time Slots */}
                        {hours.map(hour => (
                            <Fragment key={`row-${hour}`}>
                                <div key={`time-${hour}`} className="p-3 border-b border-r text-xs text-gray-400 text-center font-medium sticky left-0 bg-white">
                                    {hour}:00
                                </div>
                                {days.map(day => {
                                    const slots = getAppointmentsForSlot(day, hour);
                                    return (
                                        <div key={`slot-${day}-${hour}`} className="border-b border-r min-h-[80px] relative hover:bg-gray-50 transition-colors p-1">
                                            {slots.map(apt => (
                                                <div 
                                                    key={apt.id}
                                                    // If doctor, go to details. If patient, alert or go to video if active.
                                                    onClick={() => {
                                                        if (user?.role === Role.DOCTOR) navigate(`/consultation/${apt.id}`);
                                                    }}
                                                    className={`p-2 rounded text-xs mb-1 cursor-pointer transition-colors border-l-4 ${
                                                        (apt.type === 'TELEHEALTH' || apt.type === 'TELEMEDICINE') ? 'bg-teal-100 border-teal-500 hover:bg-teal-200' : 'bg-sky-100 border-sky-400 hover:bg-sky-200'
                                                    }`}
                                                >
                                                    <div className={`font-bold truncate ${(apt.type === 'TELEHEALTH' || apt.type === 'TELEMEDICINE') ? 'text-teal-900' : 'text-sky-900'}`}>
                                                        {user?.role === Role.PATIENT 
                                                            ? `Dr. ${apt.doctor?.user?.lastName}`
                                                            : `${apt.patient.firstName} ${apt.patient.lastName}`
                                                        }
                                                    </div>
                                                    <div className={`${(apt.type === 'TELEHEALTH' || apt.type === 'TELEMEDICINE') ? 'text-teal-700' : 'text-sky-600'} flex items-center gap-1`}>
                                                        {format(new Date(apt.startTime), 'h:mm')}
                                                        {(apt.type === 'TELEHEALTH' || apt.type === 'TELEMEDICINE') && <span className="ml-1 text-[10px] bg-teal-200 px-1 rounded">V</span>}
                                                    </div>
                                                    
                                                    {/* Patient Actions */}
                                                    {user?.role === Role.PATIENT && (
                                                        <div className="mt-1 space-y-1">
                                                            {(apt.type === 'TELEHEALTH' || apt.type === 'TELEMEDICINE') && apt.status !== 'CANCELLED' && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigate(`/consultation/video/${apt.id}`);
                                                                    }} 
                                                                    className="w-full text-center bg-teal-600 text-white py-1 rounded hover:bg-teal-700 font-bold"
                                                                >
                                                                    Video
                                                                </button>
                                                            )}
                                                            {apt.status !== 'CANCELLED' && new Date(apt.startTime) > new Date() && (
                                                                <button 
                                                                    onClick={(e) => confirmCancel(apt.id, e)}
                                                                    className="w-full text-center bg-red-100 text-red-600 py-1.5 rounded hover:bg-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 font-medium transition-colors cursor-pointer"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </Fragment>
                        ))}
                        </div>
                    </div>
                )}
            </div>
            
            <ConfirmModal
                isOpen={cancelConfirm.isOpen}
                title="Cancel Appointment"
                message="Are you sure you want to cancel this appointment?"
                confirmText="Cancel Appointment"
                onConfirm={handleCancelAppointment}
                onCancel={() => setCancelConfirm({ isOpen: false, appointmentId: null })}
            />
        </div>
    );
};

export default Appointments;
