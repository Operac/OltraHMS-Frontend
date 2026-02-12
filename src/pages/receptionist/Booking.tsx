import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { searchPatients, listDoctors, bookAppointment } from '../../services/receptionist.service';
import { ArrowLeft, Search } from 'lucide-react';

const Booking = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState(1);
    
    // Check for pre-selected patient from Registration page
    useEffect(() => {
        if (location.state?.patient) {
            setSelectedPatient(location.state.patient);
            setStep(2);
        }
    }, [location.state]);
    
    // Step 1: Patient Search
    const [searchQuery, setSearchQuery] = useState('');
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);

    // Step 2: Details
    const [doctors, setDoctors] = useState<any[]>([]);
    const [bookingData, setBookingData] = useState({
        doctorId: '',
        date: '',
        time: '',
        type: 'FIRST_VISIT',
        notes: ''
    });

    useEffect(() => {
        loadDoctors();
    }, []);

    const loadDoctors = async () => {
        try {
            const data = await listDoctors();
            setDoctors(data);
        } catch (err) {
            console.error("Failed to load doctors", err);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const results = await searchPatients(searchQuery);
            setPatients(results);
        } catch (err) {
            console.error("Search failed", err);
        }
    };

    const handleSelectPatient = (patient: any) => {
        setSelectedPatient(patient);
        setStep(2);
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatient) return;

        try {
            await bookAppointment({
                patientId: selectedPatient.id,
                doctorId: bookingData.doctorId,
                startTime: `${bookingData.date}T${bookingData.time}:00`,
                type: bookingData.type,
                notes: bookingData.notes
            });
            alert('Appointment booked successfully!');
            navigate('/receptionist');
        } catch (err: any) {
             console.error("Booking failed", err);
             alert(err.response?.data?.message || 'Failed to book appointment');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center gap-2">
                <button 
                    onClick={() => navigate('/receptionist')}
                    className="p-2 hover:bg-gray-100 rounded-full"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Book Appointment</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Steps Indicator */}
                <div className="col-span-1 space-y-4">
                    <div className={`p-4 rounded-xl border ${step >= 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                            <span className="font-medium">Select Patient</span>
                        </div>
                        {selectedPatient && (
                            <div className="mt-2 text-sm text-gray-600 ml-11">
                                {selectedPatient.firstName} {selectedPatient.lastName}
                            </div>
                        )}
                    </div>
                    <div className={`p-4 rounded-xl border ${step >= 2 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                            <span className="font-medium">Appointment Details</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-span-1 md:col-span-2">
                    {step === 1 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <form onSubmit={handleSearch} className="flex gap-4 mb-6">
                                <input
                                    type="text"
                                    placeholder="Search by name, phone, or ID..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                                    <Search className="w-5 h-5" />
                                </button>
                            </form>

                            <div className="space-y-3">
                                {patients.map(patient => (
                                    <div 
                                        key={patient.id} 
                                        onClick={() => handleSelectPatient(patient)}
                                        className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                                    >
                                        <div>
                                            <div className="font-medium text-gray-900">{patient.firstName} {patient.lastName}</div>
                                            <div className="text-sm text-gray-500">{patient.patientNumber} • {patient.phone}</div>
                                        </div>
                                        <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                                    </div>
                                ))}
                                {patients.length === 0 && searchQuery && (
                                    <div className="text-center text-gray-500 py-4">No patients found.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <form onSubmit={handleBookingSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
                                    <select
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={bookingData.doctorId}
                                        onChange={(e) => setBookingData({...bookingData, doctorId: e.target.value})}
                                    >
                                        <option value="">Select Doctor</option>
                                        {doctors.map(d => (
                                            <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={bookingData.date}
                                            onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                        <input
                                            type="time"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={bookingData.time}
                                            onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={bookingData.type}
                                        onChange={(e) => setBookingData({...bookingData, type: e.target.value})}
                                    >
                                        <option value="FIRST_VISIT">First Visit</option>
                                        <option value="FOLLOW_UP">Follow-up</option>
                                        <option value="EMERGENCY">Emergency</option>
                                        <option value="TELEMEDICINE">Telemedicine</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={bookingData.notes}
                                        onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        Confirm Booking
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Booking;
