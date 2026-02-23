import { useState, useEffect } from 'react';
import { AdmissionService } from '../../services/admission.service';
import { Bed, CheckCircle, Activity, XCircle, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
// import { useAuth } from '../../context/AuthContext';
import PatientSearchModal from '../receptionist/PatientSearchModal';
import DepositModal from '../../components/finance/DepositModal';

const AdmissionDashboard = () => {
    // const { user } = useAuth(); // Removed unused user
    const [wards, setWards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBed, setSelectedBed] = useState<any>(null);
    const [showAdmitModal, setShowAdmitModal] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [selectedAdmission, setSelectedAdmission] = useState<{id: string, patientName: string} | null>(null);

    useEffect(() => {
        loadBeds();
    }, []);

    const loadBeds = async () => {
        setLoading(true);
        try {
            const data = await AdmissionService.getBeds();
            setWards(data); 
        } catch (error) {
            toast.error('Failed to load bed status');
        } finally {
            setLoading(false);
        }
    };

    const handleAdmit = async (patient: any) => {
        if (!selectedBed) return;
        try {
            await AdmissionService.admitPatient({
                patientId: patient.id,
                wardId: selectedBed.wardId,
                bedId: selectedBed.id,
                reason: 'Standard Admission', // Default reason or ask user
                estimatedDuration: 5 // Default
            });
            toast.success(`Patient admitted to Bed ${selectedBed.number}`);
            setShowAdmitModal(false);
            setSelectedBed(null);
            loadBeds();
        } catch (error) {
            toast.error('Admission failed');
        }
    };

    const handleDischarge = async (admissionId: string) => {
        if (!window.confirm("Confirm discharge? This will generate the final invoice.")) return;
        
        try {
            await AdmissionService.dischargePatient(admissionId);
            toast.success('Patient discharged. Invoice sent to Finance.');
            loadBeds();
        } catch (error) {
            toast.error('Discharge failed');
        }
    };

    // Helper to get status color
    const getStatusColor = (status: string) => {
        switch(status) {
            case 'VACANT_CLEAN': return 'bg-green-50 border-green-200 text-green-700'; // Corrected status
            case 'OCCUPIED': return 'bg-red-50 border-red-200 text-red-700';
            case 'VACANT_DIRTY': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
            default: return 'bg-white border-gray-200';
        }
    };

    // Calculate totals
    const totalBeds = wards.reduce((acc, ward) => acc + (ward.beds?.length || 0), 0);
    const availableBeds = wards.reduce((acc, ward) => acc + (ward.beds?.filter((b: any) => b.status === 'VACANT_CLEAN').length || 0), 0);
    const occupiedBeds = wards.reduce((acc, ward) => acc + (ward.beds?.filter((b: any) => b.status === 'OCCUPIED').length || 0), 0);

    return (
        <div className="p-6 space-y-6"> 
            <div className="space-y-6">
                
                {/* Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-500">Total Beds</div>
                            <div className="text-2xl font-bold text-gray-900">{totalBeds}</div>
                        </div>
                        <Bed className="w-8 h-8 text-blue-600 opacity-20" />
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-500">Available</div>
                            <div className="text-2xl font-bold text-green-600">
                                {availableBeds}
                            </div>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600 opacity-20" />
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-500">Occupied</div>
                            <div className="text-2xl font-bold text-red-600">
                                {occupiedBeds}
                            </div>
                        </div>
                        <Activity className="w-8 h-8 text-red-600 opacity-20" />
                    </div>
                </div>

                {/* Ward Views */}
                {loading ? (
                    <div className="py-12 text-center text-gray-500">Loading wards...</div>
                ) : (
                    wards.map(ward => (
                        <div key={ward.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Bed className="w-5 h-5" /> {ward.name} <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{ward.type}</span>
                            </h2>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {ward.beds.map((bed: any) => (
                                    <div 
                                        key={bed.id}
                                        className={`relative p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 aspect-square cursor-pointer transition-all hover:scale-105 ${getStatusColor(bed.status)}`}
                                        onClick={() => {
                                            if(bed.status === 'VACANT_CLEAN') {
                                                setSelectedBed(bed);
                                                setShowAdmitModal(true);
                                            }
                                        }}
                                    >
                                        <div className="font-bold text-lg">{bed.number}</div>
                                        <div className="text-[10px] uppercase font-bold tracking-wider">{bed.status.replace('VACANT_', '')}</div>
                                        
                                        {bed.status === 'OCCUPIED' && bed.currAdmission && bed.currAdmission[0] && (
                                            <div className="absolute inset-0 bg-black/80 text-white rounded-lg flex flex-col items-center justify-center p-2 opacity-0 hover:opacity-100 transition-opacity">
                                                <div className="text-xs text-center mb-2">
                                                    {bed.currAdmission[0].patient.firstName}<br/>{bed.currAdmission[0].patient.lastName}
                                                </div>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDischarge(bed.currAdmission[0].id); }}
                                                    className="bg-red-600 px-3 py-1 rounded text-xs hover:bg-red-700 w-full"
                                                >
                                                    Discharge
                                                </button>
                                                <button 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        setSelectedAdmission({
                                                            id: bed.currAdmission[0].id,
                                                            patientName: `${bed.currAdmission[0].patient.firstName} ${bed.currAdmission[0].patient.lastName}`
                                                        });
                                                        setShowDepositModal(true);
                                                    }}
                                                    className="bg-green-600 px-3 py-1 mt-1 rounded text-xs hover:bg-green-700 w-full flex items-center justify-center gap-1"
                                                >
                                                    <DollarSign className="w-3 h-3" /> Deposit
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Admission Modal */}
            {showAdmitModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl w-full max-w-2xl p-6 relative">
                        <button 
                            onClick={() => { setShowAdmitModal(false); setSelectedBed(null); }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                        
                        <h2 className="text-xl font-bold mb-4">Admit Patient to Bed {selectedBed?.number}</h2>
                        
                        <PatientSearchModal 
                            onSelect={handleAdmit}
                            onClose={() => setShowAdmitModal(false)}
                        />
                    </div>
                </div>
            )}

            {showDepositModal && selectedAdmission && (
                <DepositModal
                    admissionId={selectedAdmission.id}
                    patientName={selectedAdmission.patientName}
                    onClose={() => setShowDepositModal(false)}
                    onSuccess={() => { setShowDepositModal(false); loadBeds(); }}
                />
            )}
        </div>
    );
};

export default AdmissionDashboard;
