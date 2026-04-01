import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDailyAppointments } from '../../services/receptionist.service';
import { inpatientService } from '../../services/inpatient.service';
import { Heart, Thermometer, Activity, Clock, User, Stethoscope, Syringe, RotateCw, BedDouble } from 'lucide-react';
import { Loading } from '../../components/ui/Loading';

const NurseDashboard = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingWards, setLoadingWards] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [vitalsForm, setVitalsForm] = useState({
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        weight: '',
        height: ''
    });

    useEffect(() => {
        loadAppointments();
        loadWards();
    }, []);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const data = await getDailyAppointments();
            setAppointments(data);
        } catch (error) {
            console.error("Failed to load appointments", error);
        } finally {
            setLoading(false);
        }
    };

    const loadWards = async () => {
        try {
            setLoadingWards(true);
            const data = await inpatientService.getAllWards();
            setWards(data);
        } catch (error) {
            console.error("Failed to load wards", error);
        } finally {
            setLoadingWards(false);
        }
    };

    // Filter: patients who are checked in (waiting for doctor/nurse to see)
    const waitingPatients = appointments.filter(a => a.status === 'CHECKED_IN');
    const completedToday = appointments.filter(a => a.status === 'COMPLETED');

    const handleRecordVitals = async (patient: any) => {
        setSelectedPatient(patient);
    };

    const handleSaveVitals = async () => {
        if (!selectedPatient) return;
        
        // In a real implementation, this would call an API to save vitals
        // For now, we'll just show a success message
        alert(`Vitals recorded for ${selectedPatient.patient.firstName} ${selectedPatient.patient.lastName}`);
        setSelectedPatient(null);
        setVitalsForm({
            bloodPressure: '',
            heartRate: '',
            temperature: '',
            respiratoryRate: '',
            oxygenSaturation: '',
            weight: '',
            height: ''
        });
    };

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Stethoscope className="w-8 h-8 text-sky-500" /> Nurse Dashboard
                </h1>
                <div className="flex gap-3">
                    <button 
                        onClick={loadAppointments}
                        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                    >
                        <RotateCw className="w-4 h-4" />
                        Refresh
                    </button>
                    <button 
                        onClick={() => navigate('/treatments')}
                        className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600"
                    >
                        <Syringe className="w-4 h-4" />
                        Treatment Room
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <Clock className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <div className="text-gray-500 text-sm">Waiting for Vitals</div>
                            <div className="text-2xl font-bold text-gray-800">{waitingPatients.length}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <Activity className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <div className="text-gray-500 text-sm">Completed Today</div>
                            <div className="text-2xl font-bold text-gray-800">{completedToday.length}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-50 rounded-lg">
                            <User className="w-5 h-5 text-sky-500" />
                        </div>
                        <div>
                            <div className="text-gray-500 text-sm">Total Appointments</div>
                            <div className="text-2xl font-bold text-gray-800">{appointments.length}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Syringe className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <div className="text-gray-500 text-sm">Treatment Room</div>
                            <div className="text-2xl font-bold text-gray-800">
                                <button 
onClick={() => navigate('/treatments')}
                                    className="text-sky-600 hover:text-sky-800 text-sm underline"
                                >
                                    Open
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Waiting for Vitals Section */}
            {waitingPatients.length > 0 && (
                <div className="bg-orange-50 rounded-xl shadow-sm border border-orange-100 overflow-hidden">
                    <div className="p-4 border-b border-orange-100 flex items-center gap-2 text-orange-800">
                        <Thermometer className="w-5 h-5" />
                        <h2 className="text-lg font-semibold">Patients Waiting for Vitals</h2>
                    </div>
                    <div className="p-4">
                        <p className="text-sm text-orange-700 mb-4">
                            These patients have been checked in by reception. Please take their vitals before the doctor sees them.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {waitingPatients.map((appointment) => (
                                <div 
                                    key={appointment.id}
                                    className="bg-white p-4 rounded-lg border border-orange-100 shadow-sm"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {appointment.patient.firstName} {appointment.patient.lastName}
                                            </div>
                                            <div className="text-xs text-gray-500">{appointment.patient.patientNumber}</div>
                                        </div>
                                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            #{appointment.queuePosition || '-'}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-3">
                                        <div>Dr. {appointment.doctor?.user?.lastName || 'N/A'}</div>
                                        <div className="text-gray-500">{appointment.type}</div>
                                    </div>
                                    <button 
                                        onClick={() => handleRecordVitals(appointment)}
                                        className="w-full bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 flex items-center justify-center gap-2"
                                    >
                                        <Heart className="w-4 h-4" />
                                        Record Vitals
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* No Waiting Patients */}
            {waitingPatients.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Patients Waiting</h3>
                    <p className="text-gray-500">
                        There are no patients waiting for vitals at the moment. Patients will appear here after being checked in by the receptionist.
                    </p>
                </div>
            )}

            {/* Inpatient Wards Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <BedDouble className="w-5 h-5 text-sky-500" />
                        Inpatient Wards
                    </h2>
                    <button 
                        onClick={() => navigate('/inpatient')}
                        className="text-sky-600 hover:text-sky-800 text-sm"
                    >
                        View All →
                    </button>
                </div>
                <div className="p-4">
                    {loadingWards ? (
                        <div className="text-gray-500">Loading wards...</div>
                    ) : wards.length === 0 ? (
                        <div className="text-gray-500">No wards found. Seed database first!</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {wards.slice(0, 6).map((ward) => (
                                <div 
                                    key={ward.id}
                                    onClick={() => navigate(`/inpatient/ward/${ward.id}`)}
                                    className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:border-sky-200 cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{ward.name}</h3>
                                            <div className="text-xs text-gray-500 uppercase">{ward.type}</div>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                                            ward.type === 'ICU' ? 'bg-red-100 text-red-700' : 'bg-sky-100 text-sky-700'
                                        }`}>
                                            {ward.type}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <div className="flex justify-between">
                                            <span>Occupancy:</span>
                                            <span className="font-medium">{ward.stats.occupied} / {ward.stats.total}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                            <div 
                                                className={`h-1.5 rounded-full ${
                                                    ward.stats.occupied / ward.stats.total > 0.8 ? 'bg-red-500' : 'bg-green-500'
                                                }`}
                                                style={{ width: `${(ward.stats.occupied / ward.stats.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Vitals Recording Modal */}
            {selectedPatient && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Heart className="w-5 h-5 text-red-500" />
                                Record Vitals
                            </h2>
                            <p className="text-gray-500 mt-1">
                                {selectedPatient.patient.firstName} {selectedPatient.patient.lastName}
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Blood Pressure (mmHg)
                                    </label>
                                    <input
                                        type="text"
                                        value={vitalsForm.bloodPressure}
                                        onChange={(e) => setVitalsForm({...vitalsForm, bloodPressure: e.target.value})}
                                        placeholder="120/80"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Heart Rate (bpm)
                                    </label>
                                    <input
                                        type="number"
                                        value={vitalsForm.heartRate}
                                        onChange={(e) => setVitalsForm({...vitalsForm, heartRate: e.target.value})}
                                        placeholder="72"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Temperature (°F)
                                    </label>
                                    <input
                                        type="text"
                                        value={vitalsForm.temperature}
                                        onChange={(e) => setVitalsForm({...vitalsForm, temperature: e.target.value})}
                                        placeholder="98.6"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Respiratory Rate
                                    </label>
                                    <input
                                        type="number"
                                        value={vitalsForm.respiratoryRate}
                                        onChange={(e) => setVitalsForm({...vitalsForm, respiratoryRate: e.target.value})}
                                        placeholder="16"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Oxygen Saturation (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={vitalsForm.oxygenSaturation}
                                        onChange={(e) => setVitalsForm({...vitalsForm, oxygenSaturation: e.target.value})}
                                        placeholder="98"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Weight (kg)
                                    </label>
                                    <input
                                        type="text"
                                        value={vitalsForm.weight}
                                        onChange={(e) => setVitalsForm({...vitalsForm, weight: e.target.value})}
                                        placeholder="70"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                            <button
                                onClick={() => setSelectedPatient(null)}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveVitals}
                                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
                            >
                                Save Vitals
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NurseDashboard;
