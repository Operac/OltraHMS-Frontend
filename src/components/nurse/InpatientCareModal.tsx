import { X } from 'lucide-react';
import { InpatientCare } from './InpatientCare';
// import { inpatientService as InpatientService } from '../../services/inpatient.service';

interface InpatientCareModalProps {
    patientId: string;
    admissionId?: string;
    patientName: string;
    onClose: () => void;
}

const InpatientCareModal = ({ patientId, admissionId, patientName, onClose }: InpatientCareModalProps) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Inpatient Care</h2>
                        <p className="text-sm text-gray-500">Patient: {patientName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <InpatientCare patientId={patientId} admissionId={admissionId} />
                </div>
            </div>
        </div>
    );
};

export default InpatientCareModal;
