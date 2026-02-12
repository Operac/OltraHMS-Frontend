import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Check, ChevronRight, ChevronLeft, Search 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format, addMinutes } from 'date-fns';

const steps = ['Select Patient', 'Select Doctor', 'Select Time', 'Confirm'];

const NewAppointment = () => {
    const navigate = useNavigate();
    const { token, user } = useAuth(); // Get user
    
    // If patient, start at step 1 (Doctor Selection)
    const isPatient = user?.role === 'PATIENT';
    const [currentStep, setCurrentStep] = useState(isPatient ? 1 : 0);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Data State
    const [patients, setPatients] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Selection State
    const [selectedPatient, setSelectedPatient] = useState<any>(
        isPatient ? { 
            id: user?.id, 
            firstName: user?.firstName, 
            lastName: user?.lastName 
        } : null
    );
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [reason, setReason] = useState('');

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch doctors initially
                const docRes = await axios.get('http://localhost:3000/api/staff/doctors', {
                     headers: { Authorization: `Bearer ${token}` }
                });
                setDoctors(docRes.data);
            } catch (err) {
                console.error('Failed to load doctors');
            }
        };
        fetchData();
    }, [token]);

    // Search Patients (Only for staff)
    useEffect(() => {
        if (isPatient) return; 

        const searchPatients = async () => {
            try {
                const url = searchQuery 
                    ? `http://localhost:3000/api/patients?search=${searchQuery}`
                    : `http://localhost:3000/api/patients?limit=10`; 
                
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
        if (currentStep === 2 && !selectedTime) return setError('Please select a time slot');
        
        setError('');
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => setCurrentStep(prev => prev - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
             const startTime = new Date(`${selectedDate}T${selectedTime}`);
             const endTime = addMinutes(startTime, 30); 

             await axios.post('http://localhost:3000/api/appointments', {
                 patientId: isPatient ? undefined : selectedPatient.id, // Optional for patient
                 doctorId: selectedDoctor.id, 
                 startTime: startTime.toISOString(),
                 endTime: endTime.toISOString(),
                 type: 'FIRST_VISIT', 
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
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {patients.map(p => (
                                <div 
                                    key={p.id}
                                    onClick={() => setSelectedPatient(p)}
                                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedPatient?.id === p.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
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
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedDoctor?.id === doc.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
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
                // Simple Time Slot Generator
                const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
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
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                {timeSlots.map(time => (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={`py-2 px-3 text-sm rounded-lg border ${selectedTime === time ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
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
                            <span className="font-bold">First Visit (30 min)</span>
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
                     <div key={idx} className={`flex flex-col items-center gap-2 bg-white px-2 ${(isPatient && idx === 0) ? 'hidden' : ''}`}>
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${idx <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                             {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
                         </div>
                         <span className={`text-xs ${idx <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>{step}</span>
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
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default NewAppointment;
