
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; // Assuming AuthContext exists
import { inpatientService as InpatientService } from '../../services/inpatient.service';
import type { InpatientData } from '../../types/inpatient';
import toast from 'react-hot-toast';
import { Pill, Droplets, CheckCircle, XCircle, Stethoscope } from 'lucide-react';

interface FluidBalance {
    id: string;
    type: 'INTAKE' | 'OUTPUT';
    fluidType: string;
    amount: number;
    recordedAt: string;
}

interface InpatientCareProps {
    patientId: string;
    admissionId?: string;
}

export const InpatientCare = ({ patientId, admissionId }: InpatientCareProps) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'meds' | 'fluids' | 'rounds'>('meds');
    const [data, setData] = useState<InpatientData | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Fluids Form
    const [fluidType, setFluidType] = useState('Overview');
    const [fluidAmount, setFluidAmount] = useState('');
    const [fluidDirection, setFluidDirection] = useState<'INTAKE' | 'OUTPUT'>('INTAKE');

    // Charts
    const [charts, setCharts] = useState<{ fluids: FluidBalance[] }>({ fluids: [] });

    // Rounds
    const [rounds, setRounds] = useState<any[]>([]);
    const [newRoundNote, setNewRoundNote] = useState('');

    useEffect(() => {
        if (patientId) {
            fetchData();
            fetchCharts();
            // Fetch rounds if admissionId is present
            if(admissionId) {
                // InpatientService.getRounds(admissionId).then(setRounds);
                setRounds([]); // Mock
            }
        }
    }, [patientId, admissionId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await InpatientService.getScheduledMedications(patientId);
            setData(res);
        } catch (error) {
            toast.error("Failed to load medications");
        } finally {
            setLoading(false);
        }
    };

    const fetchCharts = async () => {
        try {
            const res = await InpatientService.getPatientCharts(patientId);
            setCharts({ fluids: res.fluids });
        } catch (error) {
            console.error("Failed to load charts");
        }
    };

    const handleAdminister = async (prescriptionId: string, status: string, notes: string = '') => {
        try {
            await InpatientService.logMedication({
                prescriptionId,
                patientId,
                status,
                notes,
                scheduledTime: new Date().toISOString() // Or scheduled time if we tracked it
            });
            toast.success(`Medication marked as ${status}`);
            fetchData(); // Refresh
        } catch (error) {
            toast.error("Failed to update medication status");
        }
    };

    const handleFluidSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await InpatientService.logFluid({
                patientId,
                type: fluidDirection,
                fluidType: fluidType === 'Other' ? 'Custom' : fluidType, // Simplify for demo
                amount: Number(fluidAmount)
            });
            toast.success("Fluid recorded");
            setFluidAmount('');
            fetchCharts();
        } catch (error) {
            toast.error("Failed to record fluid");
        }
    };

    if (loading) return <div>Loading Nurse Station...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
                <button
                    onClick={() => setActiveTab('meds')}
                    className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 ${
                        activeTab === 'meds' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Pill className="w-4 h-4" /> Medication Administration
                </button>
                <button
                    onClick={() => setActiveTab('fluids')}
                    className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 ${
                        activeTab === 'fluids' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Droplets className="w-4 h-4" /> Fluid Balance
                </button>
                <button
                    onClick={() => setActiveTab('rounds')}
                    className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 ${
                        activeTab === 'rounds' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Stethoscope className="w-4 h-4" /> Doctor Rounds
                </button>
            </div>

            <div className="p-6">
                {activeTab === 'meds' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800">Due Medications</h3>
                        {data?.prescriptions.length === 0 ? (
                            <p className="text-gray-500 italic">No active prescriptions.</p>
                        ) : (
                            <div className="space-y-4">
                                {data?.prescriptions.map((pres) => {
                                    // Check if already given today (simplified logic)
                                    // In real app, check against `administrations` array correctly
                                    const todaysAdmin = data.administrations.find(a => a.prescriptionId === pres.id);
                                    const isDone = todaysAdmin?.status === 'GIVEN';

                                    return (
                                        <div key={pres.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <div>
                                                <div className="font-medium text-gray-900">{pres.medicationName}</div>
                                                <div className="text-sm text-gray-500">
                                                    {pres.dosage} • {pres.route} • {pres.frequency}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    Dr. {pres.medicalRecord.doctor.user.name}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                {isDone ? (
                                                    <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                                                        <CheckCircle className="w-4 h-4" /> Given
                                                    </span>
                                                ) : (
                                                    <>
                                                        <button 
                                                            onClick={() => handleAdminister(pres.id, 'GIVEN')}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                                                        >
                                                            <CheckCircle className="w-4 h-4" /> Give
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAdminister(pres.id, 'REFUSED')}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 transition-colors"
                                                        >
                                                            <XCircle className="w-4 h-4" /> Refused
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        
                        <div className="mt-8">
                             <h3 className="text-lg font-semibold text-gray-800 mb-4">Administration History (Today)</h3>
                             {data?.administrations.map(admin => (
                                 <div key={admin.id} className="flex justify-between py-2 border-b border-gray-50 text-sm">
                                     <span>{admin.notes || 'Medication'}</span>
                                     <span className={`font-medium ${admin.status === 'GIVEN' ? 'text-green-600' : 'text-red-600'}`}>
                                         {admin.status} at {new Date(admin.administeredTime || '').toLocaleTimeString()}
                                     </span>
                                 </div>
                             ))}
                        </div>
                    </div>
                )}

                {activeTab === 'fluids' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Input Form */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Balance</h3>
                            <form onSubmit={handleFluidSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                checked={fluidDirection === 'INTAKE'} 
                                                onChange={() => setFluidDirection('INTAKE')}
                                                className="text-blue-600"
                                            />
                                            <span className="text-sm">Intake (IV/Oral)</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                checked={fluidDirection === 'OUTPUT'} 
                                                onChange={() => setFluidDirection('OUTPUT')}
                                                className="text-red-600"
                                            />
                                            <span className="text-sm">Output (Urine/Drain)</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fluid Type</label>
                                    <select 
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                                        value={fluidType}
                                        onChange={(e) => setFluidType(e.target.value)}
                                    >
                                        <option>Normal Saline</option>
                                        <option>Dextrose 5%</option>
                                        <option>Water</option>
                                        <option>Urine</option>
                                        <option>Drain</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (ml)</label>
                                    <input 
                                        type="number" 
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                                        placeholder="e.g. 500"
                                        value={fluidAmount}
                                        onChange={(e) => setFluidAmount(e.target.value)}
                                        required
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Record Entry
                                </button>
                            </form>
                        </div>

                        {/* Recent History / Chart */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Balance Sheet (Last 24h)</h3>
                            <div className="bg-gray-50 rounded-lg p-4 max-h-[300px] overflow-y-auto space-y-3">
                                {charts.fluids.length === 0 ? (
                                    <p className="text-gray-500 text-center text-sm">No records yet.</p>
                                ) : charts.fluids.map(record => (
                                    <div key={record.id} className="flex justify-between items-center text-sm border-b border-gray-200 pb-2 last:border-0">
                                        <div>
                                            <span className={`font-medium ${record.type === 'INTAKE' ? 'text-blue-600' : 'text-red-600'}`}>
                                                {record.type}
                                            </span>
                                            <span className="text-gray-600 mx-2">•</span>
                                            <span className="text-gray-900">{record.fluidType}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="font-bold text-gray-800">{record.amount} ml</span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(record.recordedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Summary Totals */}
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-3 rounded-lg text-center">
                                    <div className="text-xs text-blue-600 uppercase font-semibold">Total Intake</div>
                                    <div className="text-xl font-bold text-blue-800">
                                        {charts.fluids.filter(f => f.type === 'INTAKE').reduce((acc, curr) => acc + curr.amount, 0)} ml
                                    </div>
                                </div>
                                <div className="bg-red-50 p-3 rounded-lg text-center">
                                    <div className="text-xs text-red-600 uppercase font-semibold">Total Output</div>
                                    <div className="text-xl font-bold text-red-800">
                                        {charts.fluids.filter(f => f.type === 'OUTPUT').reduce((acc, curr) => acc + curr.amount, 0)} ml
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'rounds' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Doctor Rounds</h3>
                            <span className="text-sm text-gray-500">Last Round: Today</span>
                        </div>

                        {/* Add Round Form */}
                        {user?.role === 'DOCTOR' && (
                            <form 
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    // In a real app, obtain admissionId properly
                                    if (!newRoundNote) return;
                                    try {
                                        // TODO: Pass admissionId prop or fetch it
                                        // keeping it simple for now, assuming we fetch rounds via patient/admission context
                                        toast.success("Note added (simulation)");
                                        setNewRoundNote('');
                                    } catch (e) { toast.error("Failed"); }
                                }} 
                                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                            >
                                <textarea
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    rows={3}
                                    placeholder="Enter SOAP notes (Subjective, Objective, Assessment, Plan)..."
                                    value={newRoundNote}
                                    onChange={(e) => setNewRoundNote(e.target.value)}
                                />
                                <div className="mt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                        Save Round Note
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* History */}
                        <div className="space-y-4">
                            {rounds.length === 0 ? (
                                <p className="text-gray-500 italic">No notes recorded.</p>
                            ) : (
                                rounds.map((round: any) => (
                                    <div key={round.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-medium text-gray-900">Dr. {round.conductedBy.user.name}</div>
                                            <div className="text-xs text-gray-500">{new Date(round.roundTime).toLocaleString()}</div>
                                        </div>
                                        <p className="text-gray-700 whitespace-pre-wrap">{round.notes}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
