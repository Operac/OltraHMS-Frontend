import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { UserX } from 'lucide-react';

const PatientBooking = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState<any[]>([]);
    const [step, setStep] = useState(1); // 1: Doctor, 2: Slot
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [appointmentType, setAppointmentType] = useState('TELEMEDICINE');
    const [slots, setSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingSlots, setIsFetchingSlots] = useState(false);
    const [bookingConfirm, setBookingConfirm] = useState<{isOpen: boolean, time: string | null}>({isOpen: false, time: null});

    useEffect(() => {
        // Load Doctors
        api.get('/receptionist/doctors').then(res => {
            setDoctors(res.data);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to load doctors", err);
            setLoading(false);
        });
    }, []);

    const handleDoctorSelect = (doc: any) => {
        setSelectedDoctor(doc);
        setStep(2);
    };

    useEffect(() => {
        if (step === 2 && selectedDoctor && selectedDate) {
            fetchAvailability();
        }
    }, [step, selectedDoctor, selectedDate]);

    const fetchAvailability = async () => {
        setIsFetchingSlots(true);
        try {
            // Fetch the doctor's existing appointments for that day
            const res = await api.get(`/appointments`, {
                params: {
                    doctorId: selectedDoctor.id, // Using staff ID
                    date: selectedDate
                }
            });
            const bookedAppointments = res.data;
            
            // Collect the precise start times that are occupied
            const occupiedTimes = new Set(
                bookedAppointments
                  .filter((apt: any) => apt.status !== 'CANCELLED')
                  .map((apt: any) => {
                    const d = new Date(apt.startTime);
                    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
                  })
            );

            const timeSlots = [];
            const [sYear, sMonth, sDay] = selectedDate.split('-').map(Number);
            // Construct a local date safely without UTC offset bugs
            const localSelectedDate = new Date(sYear, sMonth - 1, sDay);
            const now = new Date();
            const isToday = 
                localSelectedDate.getDate() === now.getDate() &&
                localSelectedDate.getMonth() === now.getMonth() &&
                localSelectedDate.getFullYear() === now.getFullYear();

            for (let i = 9; i < 17; i++) {
                const hourStr00 = `${i}:00`;
                const hourStr30 = `${i}:30`;
                
                // Exclude times that have already passed today based on purely local clock
                const is00Past = isToday && (i < now.getHours() || (i === now.getHours() && now.getMinutes() > 0));
                const is30Past = isToday && (i < now.getHours() || (i === now.getHours() && now.getMinutes() > 30));

                if (!occupiedTimes.has(hourStr00) && !is00Past) {
                    timeSlots.push(hourStr00);
                }
                if (!occupiedTimes.has(hourStr30) && !is30Past) {
                    timeSlots.push(hourStr30);
                }
            }
            setSlots(timeSlots);
        } catch (error) {
            console.error("Failed to fetch slots", error);
            toast.error("Failed to load doctor's availability");
        } finally {
            setIsFetchingSlots(false);
        }
    };

    const confirmBooking = (time: string) => {
        setBookingConfirm({ isOpen: true, time });
    };

    const handleBooking = async () => {
        const time = bookingConfirm.time;
        if (!time) return;
        setBookingConfirm({ isOpen: false, time: null });

        // Parse hour and minute 
        const [hours, mins] = time.split(':').map(Number);
        const [sYear, sMonth, sDay] = selectedDate.split('-').map(Number);
        
        // This Date object properly represents the user's local chosen time
        const startTime = new Date(sYear, sMonth - 1, sDay, hours, mins, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(mins + 30);

        try {
            await api.post('/appointments', {
                doctorId: selectedDoctor.id, 
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                type: appointmentType,
                reason: 'Online Consultation Request'
            });
            
            toast.success('Booking Confirmed! Check your dashboard.');
            navigate('/patient');
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to book appointment');
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="h-8 bg-gray-200 rounded w-64 mb-6 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 animate-pulse">
                            <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="flex gap-2 items-center">
                                <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Book Online Consultation</h1>

            {step === 1 && (
                <>
                    {doctors.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mt-8">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm text-gray-400">
                               <UserX className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Providers Available</h3>
                            <p className="text-gray-500 max-w-md mx-auto">There are currently no doctors available for telemedicine consultations. Please check back later.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {doctors.map(doc => (
                                <button 
                                    key={doc.id}
                                    type="button"
                                    onClick={() => handleDoctorSelect(doc)}
                                    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-sky-400 cursor-pointer transition-all group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                >
                                    <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center text-sky-500 text-xl font-bold mb-4 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                                        {doc.user.firstName[0]}{doc.user.lastName[0]}
                                    </div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-sky-500 transition-colors">Dr. {doc.user.firstName} {doc.user.lastName}</h3>
                                    <p className="text-sm text-gray-500">{doc.specialization}</p>
                                    <div className="mt-4 flex items-center gap-2 text-xs text-green-600 font-medium">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Available
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}

            {step === 2 && selectedDoctor && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-gray-900">Select a Time Slot</h2>
                                <p className="text-sm text-gray-500">with Dr. {selectedDoctor.user.lastName}</p>
                            </div>
                            <button onClick={() => setStep(1)} className="text-sm text-sky-500 hover:underline">Change Doctor</button>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <input 
                                type="date" 
                                className="p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-700 font-medium flex-1 sm:flex-none"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toLocaleDateString('en-CA')}
                            />
                            <select
                                className="p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 text-gray-700 font-medium flex-1 sm:flex-none cursor-pointer"
                                value={appointmentType}
                                onChange={(e) => setAppointmentType(e.target.value)}
                            >
                                <option value="TELEMEDICINE">Telemedicine</option>
                                <option value="IN_PERSON">In-Person</option>
                            </select>
                        </div>

                        {isFetchingSlots ? (
                            <div className="space-y-6 animate-pulse">
                                <div>
                                    <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                        {[1,2,3,4,5,6].map(i => <div key={i} className="h-11 bg-gray-100 rounded-lg border border-gray-200"></div>)}
                                    </div>
                                </div>
                            </div>
                        ) : slots.length === 0 ? (
                            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-500 font-medium">No available slots on this date.</p>
                                <p className="text-sm text-gray-400 mt-1">Please try selecting another date.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Morning Slots */}
                                {slots.filter(t => parseInt(t) < 12).length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                            Morning
                                        </h3>
                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                            {slots.filter(t => parseInt(t) < 12).map(time => (
                                                <button 
                                                    key={time}
                                                    onClick={() => confirmBooking(time)}
                                                    className="p-3 rounded-lg border border-gray-200 hover:border-sky-400 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 hover:text-sky-600 transition-all text-sm font-medium"
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Afternoon Slots */}
                                {slots.filter(t => parseInt(t) >= 12).length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                            Afternoon
                                        </h3>
                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                            {slots.filter(t => parseInt(t) >= 12).map(time => (
                                                <button 
                                                    key={time}
                                                    onClick={() => confirmBooking(time)}
                                                    className="p-3 rounded-lg border border-gray-200 hover:border-sky-400 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 hover:text-sky-600 transition-all text-sm font-medium"
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {bookingConfirm.time && selectedDoctor && (
                <ConfirmModal
                    isOpen={bookingConfirm.isOpen}
                    title="Confirm Appointment"
                    message={`Are you sure you want to book ${appointmentType === 'TELEMEDICINE' ? 'a telemedicine' : 'an in-person'} appointment with Dr. ${selectedDoctor.user.lastName} on ${selectedDate} at ${bookingConfirm.time}?`}
                    confirmText="Book Appointment"
                    onConfirm={handleBooking}
                    onCancel={() => setBookingConfirm({ isOpen: false, time: null })}
                />
            )}
        </div>
    );
};

export default PatientBooking;
