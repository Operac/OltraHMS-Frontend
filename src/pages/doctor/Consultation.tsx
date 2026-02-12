import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getPatientHistory, saveConsultation, updateAppointmentStatus } from '../../services/doctor.service';
import { 
  User, Activity, Pill, FlaskConical, CheckCircle, Video, History 
} from 'lucide-react';

const Consultation = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const { token, user } = useAuth();
    
    const [patient, setPatient] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [soap, setSoap] = useState({
        subjective: '',
        objective: '',
        assessment: '',
        plan: ''
    });

    const [vitals, setVitals] = useState({
        bpSystolic: '',
        bpDiastolic: '',
        temperature: '',
        heartRate: '',
        oxygenSaturation: ''
    });

    const [showRxModal, setShowRxModal] = useState(false);
    const [showLabModal, setShowLabModal] = useState(false);
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [labOrders, setLabOrders] = useState<any[]>([]);

    const [newRx, setNewRx] = useState({ name: '', dosage: '', frequency: '', duration: '' });
    const [newLab, setNewLab] = useState({ test: '', priority: 'ROUTINE' });

    useEffect(() => {
        const fetchContext = async () => {
            if (!appointmentId) return;
            try {
                const res = await api.get(`/appointments/${appointmentId}`);
                setPatient(res.data.patient);

                if (res.data.status === 'CONFIRMED' || res.data.status === 'CHECKED_IN') {
                    await updateAppointmentStatus(appointmentId!, 'IN_PROGRESS');
                }

                if (res.data.patientId) {
                    const historyData = await getPatientHistory(res.data.patientId);
                    setHistory(historyData.history || []);
                }

            } catch (err) {
                console.error("Failed to load consultation context", err);
            } finally {
                setLoading(false);
            }
        };
        fetchContext();
    }, [appointmentId, token]);

    const addPrescription = () => {
        if(!newRx.name || !newRx.dosage) return;
        setPrescriptions([...prescriptions, { ...newRx, id: Date.now() }]);
        setNewRx({ name: '', dosage: '', frequency: '', duration: '' });
        setShowRxModal(false);
    };

    const addLabOrder = () => {
        if(!newLab.test) return;
        setLabOrders([...labOrders, { ...newLab, id: Date.now() }]);
        setNewLab({ test: '', priority: 'ROUTINE' });
        setShowLabModal(false);
    };

    const handleSave = async (status: 'DRAFT' | 'COMPLETED') => {
        setSaving(true);
        try {
            await toast.promise(
                saveConsultation({
                    appointmentId,
                    patientId: patient?.id,
                    doctorId: user?.staffId,
                    soap,
                    vitals: JSON.stringify(vitals), 
                    prescriptions,
                    labOrders,
                    billingItems: [] 
                }),
                {
                    loading: 'Saving consultation...',
                    success: status === 'COMPLETED' ? 'Consultation completed!' : 'Draft saved successfully!',
                    error: 'Failed to save record'
                }
            );
            
            if (status === 'COMPLETED') {
                navigate('/'); // Go back to dashboard
            }
        } catch (err) {
            console.error("Failed to save record", err);
        } finally {
            setSaving(false);
        }
    };

    const calculateAge = (dob: string) => {
        if (!dob) return '--';
        const birthDate = new Date(dob);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading patient data...</div>;

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6 flex flex-col h-[calc(100vh-80px)]">
            {/* Header */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                        {patient?.firstName?.[0]}{patient?.lastName?.[0]}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{patient?.firstName} {patient?.lastName}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {patient?.gender}</span>
                            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {calculateAge(patient?.dateOfBirth)} yrs</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                     <button 
                        onClick={() => navigate(`/consultation/video/${appointmentId}`)}
                        className="px-3 py-2 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 font-medium flex items-center gap-2 text-sm"
                    >
                        <Video className="w-4 h-4" /> Video Call
                    </button>
                    <button 
                        onClick={() => handleSave('COMPLETED')}
                        disabled={saving}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 text-sm shadow-sm"
                    >
                        <CheckCircle className="w-4 h-4" /> Finish Consultation
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
                {/* Left Sidebar: Patient History */}
                <div className="col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 font-bold text-gray-700 flex items-center gap-2">
                        <History className="w-4 h-4" /> Patient History
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {history.length === 0 ? (
                            <div className="text-center text-gray-400 py-8 text-sm">No previous history</div>
                        ) : (
                            history.map((record: any) => (
                                <div key={record.id} className="border-l-2 border-blue-200 pl-4 py-1">
                                    <div className="text-xs text-gray-500 mb-1">{new Date(record.visitDate).toLocaleDateString()}</div>
                                    <div className="font-medium text-sm text-gray-900 line-clamp-2">{record.diagnosis || record.assessment || 'Checkup'}</div>
                                    <div className="text-xs text-blue-600 mt-1">Dr. {record.doctor?.user?.firstName} {record.doctor?.user?.lastName}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main: SOAP Editor */}
                <div className="col-span-6 space-y-4 overflow-y-auto pr-2 pb-4">
                     <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide text-blue-600">Subjective</h2>
                        <textarea 
                            className="w-full p-3 border border-gray-200 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none bg-gray-50 focus:bg-white transition-colors"
                            placeholder="Chief Complaint, HPI..."
                            value={soap.subjective}
                            onChange={(e) => setSoap({...soap, subjective: e.target.value})}
                        />
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide text-blue-600">Objective</h2>
                        <div className="grid grid-cols-4 gap-3 mb-4">
                            <div><label className="text-[10px] text-gray-500 font-bold uppercase">BP (Sys)</label><input type="number" className="w-full p-2 border rounded text-sm bg-gray-50" value={vitals.bpSystolic} onChange={(e) => setVitals({...vitals, bpSystolic: e.target.value})} /></div>
                            <div><label className="text-[10px] text-gray-500 font-bold uppercase">BP (Dia)</label><input type="number" className="w-full p-2 border rounded text-sm bg-gray-50" value={vitals.bpDiastolic} onChange={(e) => setVitals({...vitals, bpDiastolic: e.target.value})} /></div>
                            <div><label className="text-[10px] text-gray-500 font-bold uppercase">Temp (°C)</label><input type="number" className="w-full p-2 border rounded text-sm bg-gray-50" value={vitals.temperature} onChange={(e) => setVitals({...vitals, temperature: e.target.value})} /></div>
                            <div><label className="text-[10px] text-gray-500 font-bold uppercase">HR (bpm)</label><input type="number" className="w-full p-2 border rounded text-sm bg-gray-50" value={vitals.heartRate} onChange={(e) => setVitals({...vitals, heartRate: e.target.value})} /></div>
                        </div>
                        <textarea 
                             className="w-full p-3 border border-gray-200 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none bg-gray-50 focus:bg-white transition-colors"
                             placeholder="Physical Exam Findings..."
                             value={soap.objective}
                             onChange={(e) => setSoap({...soap, objective: e.target.value})}
                        />
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide text-blue-600">Assessment</h2>
                        <textarea 
                             className="w-full p-3 border border-gray-200 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none bg-gray-50 focus:bg-white transition-colors"
                             placeholder="Diagnosis & Clinical Impressions..."
                             value={soap.assessment}
                             onChange={(e) => setSoap({...soap, assessment: e.target.value})}
                        />
                    </div>

                     <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide text-blue-600">Plan</h2>
                        <textarea 
                             className="w-full p-3 border border-gray-200 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none bg-gray-50 focus:bg-white transition-colors"
                             placeholder="Treatment Plan, Education, Follow-up..."
                             value={soap.plan}
                             onChange={(e) => setSoap({...soap, plan: e.target.value})}
                        />
                    </div>
                </div>

                {/* Right Sidebar: Actions */}
                <div className="col-span-3 space-y-4">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2"><Pill className="w-4 h-4 text-purple-600" /> Prescriptions</h3>
                            <button onClick={() => setShowRxModal(true)} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded hover:bg-purple-100 font-bold">+ Add</button>
                        </div>
                        {prescriptions.length === 0 ? (
                            <div className="text-sm text-gray-400 italic">No prescriptions added</div>
                        ) : (
                            <ul className="space-y-2">
                                {prescriptions.map(p => (
                                    <li key={p.id} className="text-sm bg-purple-50 p-2 rounded border border-purple-100 text-purple-900">
                                        <div className="font-bold">{p.name}</div>
                                        <div className="text-xs opacity-75">{p.dosage} • {p.frequency}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                         <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2"><FlaskConical className="w-4 h-4 text-blue-600" /> Lab Orders</h3>
                            <button onClick={() => setShowLabModal(true)} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 font-bold">+ Add</button>
                        </div>
                        {labOrders.length === 0 ? (
                            <div className="text-sm text-gray-400 italic">No labs ordered</div>
                        ) : (
                            <ul className="space-y-2">
                                {labOrders.map(l => (
                                    <li key={l.id} className="text-sm bg-blue-50 p-2 rounded border border-blue-100 text-blue-900">
                                        <div className="font-bold">{l.test}</div>
                                        <div className="text-xs opacity-75 uppercase">{l.priority}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Prescription Modal */}
            {showRxModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl">
                        <h3 className="text-xl font-bold mb-4">Add Prescription</h3>
                        <div className="space-y-4">
                            <input className="w-full p-2 border rounded" placeholder="Medication Name" value={newRx.name} onChange={e=>setNewRx({...newRx, name: e.target.value})} />
                            <input className="w-full p-2 border rounded" placeholder="Dosage (e.g., 500mg)" value={newRx.dosage} onChange={e=>setNewRx({...newRx, dosage: e.target.value})} />
                            <input className="w-full p-2 border rounded" placeholder="Frequency (e.g., 2x daily)" value={newRx.frequency} onChange={e=>setNewRx({...newRx, frequency: e.target.value})} />
                            <input className="w-full p-2 border rounded" placeholder="Duration (e.g., 5 days)" value={newRx.duration} onChange={e=>setNewRx({...newRx, duration: e.target.value})} />
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={()=>setShowRxModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                                <button onClick={addPrescription} className="px-4 py-2 bg-blue-600 text-white rounded">Add</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lab Modal */}
            {showLabModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl">
                        <h3 className="text-xl font-bold mb-4">Order Lab Test</h3>
                        <div className="space-y-4">
                            <input className="w-full p-2 border rounded" placeholder="Test Name" value={newLab.test} onChange={e=>setNewLab({...newLab, test: e.target.value})} />
                            <select className="w-full p-2 border rounded" value={newLab.priority} onChange={e=>setNewLab({...newLab, priority: e.target.value})}>
                                <option value="ROUTINE">Routine</option>
                                <option value="URGENT">Urgent</option>
                                <option value="STAT">STAT (Immediate)</option>
                            </select>
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={()=>setShowLabModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                                <button onClick={addLabOrder} className="px-4 py-2 bg-purple-600 text-white rounded">Order</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Consultation;
