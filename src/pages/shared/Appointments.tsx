import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Plus, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, addDays, subDays, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';

const Appointments = () => {
    const navigate = useNavigate();
    const { token, user } = useAuth();
    
    // View state: 'day' | 'week' | 'month'
    const [view, setView] = useState<'day' | 'week' | 'month'>('week');
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<any[]>([]); 
    const [loading, setLoading] = useState(true);

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
                let query = `${API_URL}/appointments?date=${currentDate.toISOString()}`;
                
                if (user?.role === 'DOCTOR' && user.staffId) {
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

    const handleCancelAppointment = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            await axios.patch(`${API_URL}/appointments/${id}/status`, 
                { status: 'CANCELLED' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Refresh
            const res = await axios.get(`${API_URL}/appointments?date=${currentDate.toISOString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(res.data);
            alert('Appointment cancelled.');
        } catch (error) {
            console.error('Failed to cancel', error);
            alert('Failed to cancel appointment.');
        }
    };

    if (loading) return <div className="p-6 text-center">Loading schedule...</div>;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
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
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
                    >
                        <Plus className="w-4 h-4" /> New Appointment
                    </button>
                </div>
            </div>

            {/* Calendar Controls */}
            <div className="bg-white border text-center p-4 rounded-t-xl border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                     <button onClick={() => {
                         if (view === 'day') setCurrentDate(subDays(currentDate, 1));
                         else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
                         else setCurrentDate(subMonths(currentDate, 1));
                     }} className="p-1 hover:bg-gray-100 rounded">
                         <ChevronLeft className="w-5 h-5" />
                     </button>
                     <h2 className="text-lg font-bold w-48 text-center">
                         {view === 'month' 
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
                <div className="flex bg-gray-100 p-1 rounded-lg text-sm">
                    <button onClick={() => setView('week')} className={`px-3 py-1 rounded transition-colors ${view === 'week' ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-900'}`}>Week</button>
                    <button onClick={() => setView('day')} className={`px-3 py-1 rounded transition-colors ${view === 'day' ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-900'}`}>Day</button>
                    <button onClick={() => setView('month')} className={`px-3 py-1 rounded transition-colors ${view === 'month' ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-900'}`}>Month</button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className={`bg-white border-x border-b border-gray-200 rounded-b-xl flex-1 overflow-auto ${view === 'month' ? '' : ''}`}>
                
                {/* Month View Implementation */}
                {view === 'month' ? (
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
                                 <div className={`text-sm font-semibold mb-2 ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
                                     {format(day, 'd')}
                                 </div>
                                 <div className="space-y-1">
                                    {appointments
                                        .filter(apt => isSameDay(new Date(apt.startTime), day))
                                        .map(apt => (
                                            <div 
                                                key={apt.id}
                                                onClick={() => {
                                                     if (user?.role === 'DOCTOR') navigate(`/consultation/${apt.id}`);
                                                }}
                                                className={`text-[10px] p-1 rounded truncate cursor-pointer ${
                                                    apt.type === 'TELEHEALTH' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'
                                                }`}
                                            >
                                                {format(new Date(apt.startTime), 'HH:mm')} {user?.role === 'PATIENT' ? apt.doctor?.user?.lastName : apt.patient.lastName}
                                            </div>
                                        ))
                                    }
                                 </div>
                             </div>
                         ))}
                     </div>
                ) : (
                    // Day & Week View Implementation
                    <div className={`grid ${view === 'day' ? 'grid-cols-1' : 'grid-cols-8'} min-w-[${view === 'day' ? '100%' : '800px'}]`}>
                        {/* Time Column Header */}
                        <div className="p-4 border-b border-r bg-gray-50 font-medium text-gray-500 text-sm">Time</div>
                        {/* Day Headers */}
                        {days.map(day => (
                            <div key={day.toString()} className={`p-4 border-b border-r text-center ${isSameDay(day, new Date()) ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                <div className={`text-xs font-semibold uppercase mb-1 ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {format(day, 'EEE')}
                                </div>
                                <div className={`text-xl font-bold ${isSameDay(day, new Date()) ? 'text-blue-700' : 'text-gray-800'}`}>
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
                                                        if (user?.role === 'DOCTOR') navigate(`/consultation/${apt.id}`);
                                                    }}
                                                    className={`p-2 rounded text-xs mb-1 cursor-pointer transition-colors border-l-4 ${
                                                        apt.type === 'TELEHEALTH' ? 'bg-teal-100 border-teal-500 hover:bg-teal-200' : 'bg-blue-100 border-blue-500 hover:bg-blue-200'
                                                    }`}
                                                >
                                                    <div className={`font-bold truncate ${apt.type === 'TELEHEALTH' ? 'text-teal-900' : 'text-blue-900'}`}>
                                                        {user?.role === 'PATIENT' 
                                                            ? `Dr. ${apt.doctor?.user?.lastName}`
                                                            : `${apt.patient.firstName} ${apt.patient.lastName}`
                                                        }
                                                    </div>
                                                    <div className={`${apt.type === 'TELEHEALTH' ? 'text-teal-700' : 'text-blue-700'} flex items-center gap-1`}>
                                                        {format(new Date(apt.startTime), 'h:mm')}
                                                        {apt.type === 'TELEHEALTH' && <span className="ml-1 text-[10px] bg-teal-200 px-1 rounded">V</span>}
                                                    </div>
                                                    
                                                    {/* Patient Actions */}
                                                    {user?.role === 'PATIENT' && (
                                                        <div className="mt-1 space-y-1">
                                                            {apt.type === 'TELEHEALTH' && apt.status !== 'CANCELLED' && (
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
                                                            {apt.status !== 'CANCELLED' && (
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleCancelAppointment(apt.id);
                                                                    }}
                                                                    className="w-full text-center bg-red-100 text-red-600 py-1 rounded hover:bg-red-200"
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
                )}
            </div>
        </div>
    );
};

export default Appointments;
