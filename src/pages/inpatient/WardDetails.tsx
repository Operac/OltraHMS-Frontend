import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, LogOut, PaintBucket } from 'lucide-react';
import { inpatientService as InpatientService } from '../../services/inpatient.service';
import AdmissionModal from './AdmissionModal';
import InpatientCareModal from '../../components/nurse/InpatientCareModal';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ui/ConfirmModal';

const WardDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ward, setWard] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedBed, setSelectedBed] = useState<any>(null); // For Admission
    const [showAdmitModal, setShowAdmitModal] = useState(false);
    const [showCareModal, setShowCareModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<{id: string, name: string, admissionId: string} | null>(null);
    const [dischargeConfirm, setDischargeConfirm] = useState<{isOpen: boolean, admissionId: string | null}>({isOpen: false, admissionId: null});

    useEffect(() => {
        loadWard();
    }, [id]);

    const loadWard = async () => {
        if (!id) return;
        try {
            const data = await InpatientService.getWardDetails(id);
            setWard(data);
        } catch (error) {
            console.error("Failed to load ward details");
        } finally {
            setLoading(false);
        }
    };

    const handleBedClick = (bed: any) => {
        if (bed.status === 'VACANT_CLEAN') {
            setSelectedBed(bed);
            setShowAdmitModal(true);
        } else if (bed.status === 'VACANT_DIRTY') {
             // Don't auto-clean, user must click the button
             // Just show the bed as dirty
        } else {
             // Already occupied - Show Care Modal
             if (bed.currAdmission?.[0]?.patient) {
                 const patient = bed.currAdmission[0].patient;
                 setSelectedPatient({
                     id: patient.id,
                     name: `${patient.firstName} ${patient.lastName}`,
                     admissionId: bed.currAdmission[0].id
                 });
                 setShowCareModal(true);
             }
        }
    };

    const handleCleanBed = async (bedId: string) => {
        try {
            await InpatientService.updateBedStatus(bedId, 'VACANT_CLEAN');
            toast.success('Bed marked as cleaned');
            loadWard();
        } catch (error) {
            toast.error('Failed to update bed');
        }
    };

    const confirmDischarge = (admissionId: string) => {
        setDischargeConfirm({ isOpen: true, admissionId });
    };

    const handleDischarge = async () => {
        const admissionId = dischargeConfirm.admissionId;
        if (!admissionId) return;
        setDischargeConfirm({ isOpen: false, admissionId: null });
        try {
            await InpatientService.dischargePatient(admissionId);
            toast.success('Patient discharged successfully');
            loadWard();
        } catch (error) {
            toast.error('Failed to discharge');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse p-2">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 rounded w-64"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-32 bg-gray-100 rounded-xl border-2 border-gray-200"></div>
                    ))}
                </div>
            </div>
        );
    }
    if (!ward) return <div>Ward not found</div>;

    return (
        <div className="space-y-6">
            <button onClick={() => navigate('/inpatient')} className="flex items-center text-gray-500 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5 mr-1" /> Back to Wards
            </button>

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">{ward.name} <span className="text-gray-400 text-lg">({ward.type})</span></h1>
                <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Available</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Occupied</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded-full"></div> Dirty</div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {ward.beds.map((bed: any) => (
                    <button 
                        key={bed.id}
                        type="button"
                        onClick={() => handleBedClick(bed)}
                        className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer h-32 flex flex-col justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                            bed.status === 'OCCUPIED' ? 'bg-red-50 border-red-200 hover:border-red-300' :
                            bed.status === 'VACANT_CLEAN' ? 'bg-green-50 border-green-200 hover:border-green-300' :
                            'bg-yellow-50 border-yellow-200 hover:border-yellow-300'
                        }`}
                    >
                        <div className="flex justify-between items-start">
                            <span className="font-bold text-lg text-gray-700">{bed.number}</span>
                            {bed.status === 'VACANT_DIRTY' && <PaintBucket className="w-5 h-5 text-yellow-600" />}
                        </div>
                        
                        {bed.status === 'OCCUPIED' && bed.currAdmission?.[0] ? (
                            <div className="text-sm">
                                <div className="font-medium text-red-900 truncate">
                                    {bed.currAdmission[0].patient.firstName} {bed.currAdmission[0].patient.lastName}
                                </div>
                                <div className="text-red-500 text-xs">
                                    #{bed.currAdmission[0].patient.patientNumber}
                                </div>
                                
                                <button 
                                    onClick={(e) => { e.stopPropagation(); confirmDischarge(bed.currAdmission[0].id); }}
                                    className="absolute bottom-2 right-2 p-1.5 bg-white rounded-full shadow hover:bg-red-50 text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                    title="Discharge Patient"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : bed.status === 'VACANT_CLEAN' ? (
                            <div className="text-center text-green-600 text-sm font-medium">
                                <UserPlus className="w-6 h-6 mx-auto mb-1 opacity-50" />
                                Empty
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="text-yellow-700 text-sm mb-2 font-medium">Needs Cleaning</div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleCleanBed(bed.id); }}
                                    className="px-3 py-1.5 bg-yellow-500 text-white text-xs rounded-lg hover:bg-yellow-600 font-bold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                                >
                                    Mark Cleaned
                                </button>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {showAdmitModal && selectedBed && (
                <AdmissionModal 
                    bed={selectedBed} 
                    onClose={() => setShowAdmitModal(false)}
                    onSuccess={() => { setShowAdmitModal(false); loadWard(); }}
                />
            )}

            {showCareModal && selectedPatient && (
                <InpatientCareModal
                    patientId={selectedPatient.id}
                    admissionId={selectedPatient.admissionId}
                    patientName={selectedPatient.name}
                    onClose={() => setShowCareModal(false)}
                />
            )}

            <ConfirmModal
                isOpen={dischargeConfirm.isOpen}
                title="Discharge Patient"
                message="Are you sure you want to discharge this patient? This action will finalize their current admission record."
                confirmText="Discharge"
                onConfirm={handleDischarge}
                onCancel={() => setDischargeConfirm({ isOpen: false, admissionId: null })}
            />
        </div>
    );
};

export default WardDetails;
