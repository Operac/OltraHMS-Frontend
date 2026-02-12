import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  User, Phone, MapPin, Calendar, FileText, 
  ChevronLeft, Edit, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

interface PatientDetail {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  address: string;
  bloodGroup?: string;
  genotype?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  user: {
    email: string;
    status: string;
  };
  appointments: any[]; // Define stricter types later
  medicalRecords: any[];
}

const PatientDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    
    const [patient, setPatient] = useState<PatientDetail | null>(null);
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientRes, recordsRes] = await Promise.all([
                    axios.get(`http://localhost:3000/api/patients/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`http://localhost:3000/api/medical-records?patientId=${id}`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setPatient(patientRes.data);
                setRecords(recordsRes.data);
            } catch (err) {
                setError('Failed to load patient profile');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, token]);

    if (loading) return <div className="p-6 text-center">Loading patient profile...</div>;
    if (error || !patient) return (
        <div className="p-6 text-center text-red-500 flex flex-col items-center">
            <AlertCircle className="w-10 h-10 mb-2" />
            <p>{error || 'Patient not found'}</p>
            <button onClick={() => navigate('/patients')} className="text-blue-600 mt-4 hover:underline">Back to list</button>
        </div>
    );

    return (
        <div className="p-6 text-gray-900 animate-in fade-in duration-300">
             {/* Header */}
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/patients')}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            {patient.firstName} {patient.lastName}
                            <span className="text-sm font-normal bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                {patient.patientNumber}
                            </span>
                        </h1>
                        <p className="text-gray-500 text-sm">Registered on {format(new Date(), 'MMM d, yyyy')}</p> 
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => navigate(`/appointments/new?patientId=${patient.id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Calendar className="w-4 h-4" />
                        <span>Book Appointment</span>
                    </button>
                    <button 
                        onClick={() => alert("Edit Profile feature coming soon!")}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                    >
                        <Edit className="w-4 h-4" />
                        <span>Edit Profile</span>
                    </button>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sidebar: Demographics */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold mb-4">
                                {patient.firstName[0]}{patient.lastName[0]}
                            </div>
                            <h2 className="text-lg font-bold">{patient.firstName} {patient.lastName}</h2>
                            <p className="text-gray-500 capitalize">{patient.gender} • {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span>{patient.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <User className="w-4 h-4 text-gray-400" />
                                <span>{patient.user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{patient.address || 'No address provided'}</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 my-6 pt-6 grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Blood Group</p>
                                <p className="font-bold text-gray-900">{patient.bloodGroup ? patient.bloodGroup.replace('_', ' ') : '--'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Genotype</p>
                                <p className="font-bold text-gray-900">{patient.genotype || '--'}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold mb-2">Emergency Contact</h4>
                            {patient.emergencyContact?.name ? (
                                <div className="text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                                    <p className="font-medium text-red-900">{patient.emergencyContact.name}</p>
                                    <p className="text-red-700">{patient.emergencyContact.relationship}</p>
                                    <p className="text-red-700 mt-1">{patient.emergencyContact.phone}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">Not set</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs / Sections */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
                        <div className="border-b border-gray-200 px-6 py-4 flex items-center gap-6">
                            <button className="text-blue-600 font-medium border-b-2 border-blue-600 pb-4 -mb-4">Medical History</button>
                            <button className="text-gray-500 hover:text-gray-700 font-medium pb-4 -mb-4">Upcoming Appointments</button>
                            <button 
                                onClick={() => navigate(`/records?patientId=${patient.id}`)}
                                className="text-gray-500 hover:text-gray-700 font-medium pb-4 -mb-4"
                            >
                                Documents
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-8">
                            
                            {/* Notes List */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-gray-500" />
                                    Consultation History
                                </h3>
                                {records.length > 0 ? (
                                    <div className="space-y-4">
                                        {records.map((rec: any) => (
                                            <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <span className="text-xs font-bold text-blue-600 uppercase mb-1 block">
                                                            {format(new Date(rec.visitDate), 'MMM dd, yyyy')}
                                                        </span>
                                                        <h4 className="font-bold text-gray-800">{rec.assessment || 'No Diagnosis'}</h4>
                                                    </div>
                                                    <span className="text-xs text-gray-500">Dr. {rec.doctor?.user?.lastName}</span>
                                                </div>
                                                <div className="text-sm text-gray-600 mb-2">
                                                    <span className="font-semibold">Subjective: </span>
                                                    {rec.subjective}
                                                </div>
                                                <div className="flex gap-2 mt-3">
                                                    <button 
                                                        onClick={() => navigate(`/records?recordId=${rec.id}`)}
                                                        className="text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-100"
                                                    >
                                                        View Full Report
                                                    </button>
                                                    {rec.prescriptions?.length > 0 && (
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Rx: {rec.prescriptions.length} items</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500 text-sm">
                                        No clinical history recorded yet.
                                    </div>
                                )}
                            </div>

                             {/* Appointments Preview */}
                             <div className="mt-8 pt-8 border-t border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                                    Next Appointment
                                </h3>
                                
                                {patient.appointments && patient.appointments.length > 0 ? (
                                    <div 
                                        onClick={() => navigate(`/consultation/${patient.appointments[0].id}`)}
                                        className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
                                    >
                                         <div className="mr-4 text-center bg-white p-2 rounded shadow-sm min-w-[60px]">
                                             <div className="text-xs text-gray-500 uppercase">{format(new Date(patient.appointments[0].appointmentDate), 'MMM')}</div>
                                             <div className="text-lg font-bold text-gray-900">{format(new Date(patient.appointments[0].appointmentDate), 'dd')}</div>
                                         </div>
                                         <div className="flex-1">
                                             <h4 className="font-semibold text-gray-900">{patient.appointments[0].type}</h4>
                                             <p className="text-sm text-gray-500">{patient.appointments[0].reason || 'Regular checkup'}</p>
                                         </div>
                                         <button 
                                             onClick={(e) => {
                                                 e.stopPropagation();
                                                 navigate('/appointments');
                                             }}
                                             className="text-sm text-blue-600 hover:underline"
                                         >
                                             View All
                                         </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                        <p className="text-gray-500 mb-2">No upcoming appointments scheduled.</p>
                                        <button 
                                            onClick={() => navigate(`/appointments/new?patientId=${patient.id}`)}
                                            className="text-blue-600 font-medium hover:underline text-sm"
                                        >
                                            Book an Appointment
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
};

export default PatientDetails;
