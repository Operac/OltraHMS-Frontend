import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

const PatientBooking = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState<any[]>([]);
    const [step, setStep] = useState(1); // 1: Doctor, 2: Slot
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load Doctors
        api.get('/receptionist/doctors').then(res => {
            setDoctors(res.data);
            setLoading(false);
        }).catch(err => console.error("Failed to load doctors", err));
    }, []);

    const handleDoctorSelect = (doc: any) => {
        setSelectedDoctor(doc);
        generateSlots();
        setStep(2);
    };

    // Simulate Slot Generation (Real app would check availability)
    const generateSlots = () => {
        const timeSlots = [];
        for (let i = 9; i < 17; i++) {
            timeSlots.push(`${i}:00`);
            timeSlots.push(`${i}:30`);
        }
        setSlots(timeSlots);
    };

    const handleBooking = async (time: string) => {
        if (!confirm(`Book appointment with Dr. ${selectedDoctor.user.lastName} at ${time}?`)) return;

        const [hours, mins] = time.split(':').map(Number);
        const startTime = new Date(selectedDate);
        startTime.setHours(hours, mins, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(mins + 30);

        try {
            await toast.promise(
                api.post('/appointments', {
                    doctorId: selectedDoctor.id, // Ensure this is Staff ID
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                    type: 'TELEMEDICINE',
                    reason: 'Online Consultation Request'
                }),
                {
                    loading: 'Booking appointment...',
                    success: 'Booking Confirmed! Check your dashboard.',
                    error: 'Failed to book appointment'
                }
            );
            navigate('/patient');
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Book Online Consultation</h1>

            {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.map(doc => (
                        <div 
                            key={doc.id} 
                            onClick={() => handleDoctorSelect(doc)}
                            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-blue-500 cursor-pointer transition-all group"
                        >
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold mb-4">
                                {doc.user.firstName[0]}{doc.user.lastName[0]}
                            </div>
                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600">Dr. {doc.user.firstName} {doc.user.lastName}</h3>
                            <p className="text-sm text-gray-500">{doc.specialization}</p>
                            <div className="mt-4 flex items-center gap-2 text-xs text-green-600 font-medium">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> Available Today
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {step === 2 && selectedDoctor && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-gray-900">Select a Time Slot</h2>
                                <p className="text-sm text-gray-500">with Dr. {selectedDoctor.user.lastName} on {selectedDate}</p>
                            </div>
                            <button onClick={() => setStep(1)} className="text-sm text-blue-600 hover:underline">Change Doctor</button>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <input 
                            type="date" 
                            className="mb-6 p-2 border rounded"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />

                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                            {slots.map(time => (
                                <button 
                                    key={time}
                                    onClick={() => handleBooking(time)}
                                    className="p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all text-sm font-medium"
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientBooking;
