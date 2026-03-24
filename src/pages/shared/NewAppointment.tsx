import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Check, ChevronRight, ChevronLeft, Search 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format, addMinutes, getDay } from 'date-fns';
import { SettingsService } from '../../services/settings.service';
import type { HospitalSettings } from '../../services/settings.service';

// TypeScript interfaces for type safety
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientNumber?: string;
  phone?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

type AppointmentType = 'FIRST_VISIT' | 'FOLLOW_UP' | 'EMERGENCY' | 'TELEMEDICINE' | '';

const steps = ['Select Patient', 'Select Doctor', 'Select Time', 'Confirm'];

const NewAppointment = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preSelectedDoctorId = searchParams.get('doctorId');
    const preSelectedPatientId = searchParams.get('patientId');
    const { token, user } = useAuth(); // Get user

    
    // If patient, start at step 1 (Doctor Selection)
    // If patient, start at step 1 (Doctor Selection)
    const isPatient = user?.role === 'PATIENT';
    const isDoctor = user?.role === 'DOCTOR';
    const [currentStep, setCurrentStep] = useState(isPatient ? 1 : 0);

    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Data State - now with proper typing
    const [patients, setPatients] = useState<Patient[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Selection State - now with proper typing
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
        isPatient ? { 
            id: user?.id || '', 
            firstName: user?.firstName || '', 
            lastName: user?.lastName || '' 
        } : null
    );
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [appointmentType, setAppointmentType] = useState<AppointmentType>('');
    const [reason, setReason] = useState('');
    const [hospitalSettings, setHospitalSettings] = useState<HospitalSettings | null>(null);


    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!token) return;
                
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                // Fetch hospital settings for time slots
                const settingsRes = await SettingsService.getHospitalSettings();
                setHospitalSettings(settingsRes);
                
                // Fetch doctors initially
                const docRes = await axios.get(`${API_URL}/staff/doctors`, {
                     headers: { Authorization: `Bearer ${token}` }
                });
                setDoctors(docRes.data);
                
                // Pre-select doctor if ID is in URL
                if (preSelectedDoctorId) {
                    const foundDoc = docRes.data.find((d: Doctor) => d.id === preSelectedDoctorId);
                    if (foundDoc) {
                        setSelectedDoctor(foundDoc);
                        // Skip to time selection if patient
                        if (isPatient) setCurrentStep(2);
                    }
                } else if (isDoctor && user?.staffId) {
                    // Auto-select self if Doctor
                    const myProfile = docRes.data.find((d: Doctor) => d.id === user.staffId);
                    if (myProfile) {
                        setSelectedDoctor(myProfile);
                    }
                }

            } catch (err) {
                console.error('Failed to load doctors');
            }
        };
        fetchData();
    }, [token, preSelectedDoctorId, isPatient, isDoctor, user?.staffId]);

    // Fetch Pre-selected Patient
    useEffect(() => {
        if (preSelectedPatientId && !isPatient && token) {
            const fetchPatient = async () => {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                    const res = await axios.get(`${API_URL}/patients/${preSelectedPatientId}`, {
                         headers: { Authorization: `Bearer ${token}` }
                    });
                    setSelectedPatient(res.data);
                    
                    // If Doctor is also selected (or self), go to step 2
                    if (isDoctor || (preSelectedDoctorId && selectedDoctor)) {
                         setCurrentStep(2);
                    } else {
                         setCurrentStep(1); // Go to select doctor
                    }

                } catch (err) {
                    console.error("Failed to fetch pre-selected patient");
                }
            };
            fetchPatient();
        }
    }, [preSelectedPatientId, token, isPatient, isDoctor, selectedDoctor, preSelectedDoctorId]);


    // Search Patients (Only for staff)
    useEffect(() => {
        if (isPatient) return; 

        const searchPatients = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                const url = searchQuery 
                    ? `${API_URL}/patients?search=${searchQuery}`
                    : `${API_URL}/patients?limit=10`; 
                
                const res = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const patientList = res.data.data || res.data.patients || [];
                setPatients(patientList);
            } catch (err) {
                console.error("Error fetching patients:", err);
            }
        };
        const timeout = setTimeout(searchPatients, 500);
        return () => clearTimeout(timeout);
    }, [searchQuery, token, isPatient]);

    const handleNext = () => {
        if (currentStep === 0 && !selectedPatient && !isPatient) return setError('Please select a patient');
        if (currentStep === 1 && !selectedDoctor) return setError('Please select a doctor');
        if (currentStep === 2) {
             if (!selectedTime) return setError('Please select a time slot');
             if (!appointmentType) return setError('Please select an appointment type');
        }

        
        setError('');
        
        let nextStep = currentStep + 1;

        
        // Skip Step 1 (Doctor Selection) if Doctor or pre-selected
        if (nextStep === 1 && (isDoctor || (preSelectedDoctorId && selectedDoctor))) {
            nextStep = 2;
        }

        
        setCurrentStep(nextStep);
    };


    const handleBack = () => {
        let prevStep = currentStep - 1;
        
        if (prevStep === 1 && (isDoctor || (preSelectedDoctorId && selectedDoctor))) {
            prevStep = 0;
        }

        // If patient was pre-selected, we might want to prevent going back to 0? 
        // Or just let them go back to see/change it? 
        // For now, standard behavior. 
        
        setCurrentStep(prevStep);
    };



    const handleSubmit = async () => {
        if (!selectedDoctor?.id) {
            setError('Please select a doctor');
            return;
        }
        
        setLoading(true);
        try {
             const startTime = new Date(`${selectedDate}T${selectedTime}`);
             const endTime = addMinutes(startTime, 30); 

             const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
             await axios.post(`${API_URL}/appointments`, {
                 patientId: isPatient ? undefined : selectedPatient?.id, // Optional for patient
                 doctorId: selectedDoctor.id, 
                 startTime: startTime.toISOString(),
                 endTime: endTime.toISOString(),
                 type: appointmentType || 'FIRST_VISIT', 
                 reason

             }, {
                 headers: { Authorization: `Bearer ${token}` }
             });

             navigate('/appointments');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    // Render Steps
    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                if (isPatient) return null; // Should not happen given initial state, but safe guard
                return (
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Search patient by name or ID..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {patients.map(p => (
                                <div 
                                    key={p.id}
                                    onClick={() => setSelectedPatient(p)}
                                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedPatient?.id === p.id ? 'border-sky-400 bg-sky-50' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="font-bold text-gray-900">{p.firstName} {p.lastName}</div>
                                    <div className="text-sm text-gray-500">{p.patientNumber} • {p.phone}</div>
                                </div>
                            ))}
                            {patients.length === 0 && searchQuery.length > 2 && (
                                <p className="text-center text-gray-500">No patients found</p>
                            )}
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {doctors.map(doc => (
                            <div 
                                key={doc.id}
                                onClick={() => setSelectedDoctor(doc)}
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedDoctor?.id === doc.id ? 'border-sky-400 bg-sky-50' : 'hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-500 font-bold">
                                        Dr
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{doc.name}</div>
                                        <div className="text-sm text-gray-500">{doc.specialization}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 2:
                // Dynamic Time Slot Generator based on hospital settings
                const generateTimeSlots = () => {
                    if (!hospitalSettings) {
                        // Fallback to old behavior if settings not loaded
                        return ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
                    }
                    
                    const selectedDateObj = new Date(selectedDate);
                    const dayOfWeek = getDay(selectedDateObj); // 0 = Sunday, 1 = Monday, etc.
                    const dayMap: { [key: number]: string } = {
                        0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
                        4: 'thursday', 5: 'friday', 6: 'saturday'
                    };
                    const dayKey = dayMap[dayOfWeek];
                    const isOpenKey = `${dayKey}IsOpen` as keyof typeof hospitalSettings;
                    const openKey = `${dayKey}Open` as keyof typeof hospitalSettings;
                    const closeKey = `${dayKey}Close` as keyof typeof hospitalSettings;
                    
                    // Check if hospital is open on this day
                    if (!hospitalSettings[isOpenKey]) {
                        return [];
                    }
                    
                    const openTime = String(hospitalSettings[openKey] || '09:00');
                    const closeTime = String(hospitalSettings[closeKey] || '17:00');
                    const slotDuration = Number(hospitalSettings.timeSlotDuration) || 30;
                    
                    const slots: string[] = [];
                    const [openHour, openMin] = openTime.split(':').map(Number);
                    const [closeHour, closeMin] = closeTime.split(':').map(Number);
                    
                    let currentTime = new Date(selectedDate);
                    currentTime.setHours(openHour, openMin, 0, 0);
                    
                    const endTime = new Date(selectedDate);
                    endTime.setHours(closeHour, closeMin, 0, 0);
                    
                    while (currentTime < endTime) {
                        slots.push(format(currentTime, 'HH:mm'));
                        currentTime = addMinutes(currentTime, slotDuration);
                    }
                    
                    return slots;
                };
                
                const timeSlots = generateTimeSlots();
                
                // Show warning if no slots available
                const isHospitalClosed = timeSlots.length === 0 && hospitalSettings;
                
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                            <input 
                                type="date" 
                                className="w-full p-2 border rounded-lg"
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                                min={format(new Date(), 'yyyy-MM-dd')}
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Available Slots</label>
                            {isHospitalClosed ? (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-center">
                                    Hospital is closed on this day. Please select another date.
                                </div>
                            ) : timeSlots.length === 0 ? (
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-center">
                                    Loading available slots...
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                    {timeSlots.map(time => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={`py-2 px-3 text-sm rounded-lg border ${selectedTime === time ? 'bg-sky-500 text-white border-sky-500' : 'hover:bg-gray-50'}`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
                             <select
                                className="w-full p-2 border rounded-lg bg-white"
                                value={appointmentType}
                                onChange={e => setAppointmentType(e.target.value as AppointmentType)}
                             >
                                <option value="">Select Type</option>
                                <option value="FIRST_VISIT">First Visit</option>
                                <option value="FOLLOW_UP">Follow-up</option>
                                <option value="EMERGENCY">Emergency</option>
                                <option value="TELEMEDICINE">Telemedicine</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>

                             <textarea 
                                className="w-full p-2 border rounded-lg"
                                rows={3}
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="Consultation reason..."
                             />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Patient</span>
                            <span className="font-bold">{isPatient ? 'Myself' : `${selectedPatient?.firstName} ${selectedPatient?.lastName}`}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Doctor</span>
                            <span className="font-bold">{selectedDoctor?.name}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Date & Time</span>
                            <span className="font-bold">{selectedDate} at {selectedTime}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Type</span>
                            <span className="font-bold">{appointmentType.replace('_', ' ')}</span>
                        </div>

                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">New Appointment</h1>
            
            {/* Progress Bar */}
            <div className="flex justify-between mb-8 relative">
                 <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 translate-y-[-50%]" />
                 {steps.map((step, idx) => (
                     <div key={idx} className={`flex flex-col items-center gap-2 bg-white px-2 ${(isPatient && idx === 0) ? 'hidden' : ''} ${(isDoctor && idx === 1) ? 'hidden' : ''}`}>

                         <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${idx <= currentStep ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                             {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
                         </div>
                         <span className={`text-xs ${idx <= currentStep ? 'text-sky-500 font-medium' : 'text-gray-400'}`}>{step}</span>
                     </div>
                 ))}
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm flex items-center">
                    <span className="mr-2">⚠️</span> {error}
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-[400px]">
                {renderStepContent()}
            </div>

            <div className="flex justify-between mt-6">
                <button 
                    onClick={handleBack}
                    disabled={currentStep === 0 || (isPatient && currentStep === 1)}
                    className={`px-6 py-2 rounded-lg flex items-center gap-2 ${currentStep === 0 || (isPatient && currentStep === 1) ? 'opacity-0' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                >


                    <ChevronLeft className="w-4 h-4" /> Back
                </button>
                
                {currentStep === steps.length - 1 ? (
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm"
                    >
                        {loading ? 'Confirming...' : 'Confirm Appointment'}
                    </button>
                ) : (
                    <button 
                        onClick={handleNext}
                        className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 flex items-center gap-2 shadow-sm"
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default NewAppointment;
