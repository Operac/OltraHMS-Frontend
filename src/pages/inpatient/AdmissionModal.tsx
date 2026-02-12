import { useState, useEffect } from 'react';
import { Search, X, User } from 'lucide-react';
import { InpatientService } from '../../services/inpatient.service';
import * as ReceptionistService from '../../services/receptionist.service'; // Re-use search

interface AdmissionModalProps {
    bed: any;
    onClose: () => void;
    onSuccess: () => void;
}

const AdmissionModal = ({ bed, onClose, onSuccess }: AdmissionModalProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    // Search Patients
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length > 2) {
                try {
                    // Use existing search from Receptionist flow
                    // Note: We might need to make ReceptionistService methods static or export them better
                    // Or just duplicate the search call here for clean dependency
                    const results = await ReceptionistService.searchPatients(searchTerm);
                    setPatients(results);
                } catch (error) {
                    console.error("Search failed");
                }
            } else {
                setPatients([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleAdmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatient) return;

        setLoading(true);
        try {
            await InpatientService.admitPatient({
                patientId: selectedPatient.id,
                bedId: bed.id,
                reason,
                estimatedDischargeDate: undefined // Optional for now
            });
            onSuccess();
        } catch (error) {
            alert("Failed to admit patient");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Admit Patient to Bed {bed.number}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleAdmit} className="space-y-6">
                    {/* Patient Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient</label>
                        {!selectedPatient ? (
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text"
                                    placeholder="Search by name or number..."
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                                {patients.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg border border-t-0 border-gray-200 max-h-48 overflow-y-auto z-10">
                                        {patients.map(p => (
                                            <div 
                                                key={p.id}
                                                onClick={() => setSelectedPatient(p)}
                                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                                            >
                                                <div className="font-medium text-gray-900">{p.firstName} {p.lastName}</div>
                                                <div className="text-xs text-gray-500">#{p.patientNumber} • {new Date(p.dateOfBirth).toLocaleDateString()}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{selectedPatient.firstName} {selectedPatient.lastName}</div>
                                        <div className="text-xs text-blue-600">#{selectedPatient.patientNumber}</div>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => setSelectedPatient(null)}
                                    className="text-xs text-red-500 hover:underline"
                                >
                                    Change
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Admission Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Admission Reason</label>
                        <textarea 
                            required
                            rows={3}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Diagnosis, critical condition details..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={!selectedPatient || loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Admitting...' : 'Confirm Admission'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdmissionModal;
