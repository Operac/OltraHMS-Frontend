import React, { useState } from 'react';
import { Search, User } from 'lucide-react';
import { searchPatients } from '../../services/receptionist.service';

interface PatientSearchModalProps {
    onSelect: (patient: any) => void;
    onClose: () => void;
}

const PatientSearchModal: React.FC<PatientSearchModalProps> = ({ onSelect, onClose: _onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const results = await searchPatients(searchQuery);
            setPatients(results);
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    placeholder="Search by name, phone, or ID..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                />
                <button 
                    type="submit" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Searching...' : <Search className="w-5 h-5" />}
                </button>
            </form>

            <div className="max-h-60 overflow-y-auto space-y-2">
                {patients.map(patient => (
                    <div 
                        key={patient.id} 
                        onClick={() => onSelect(patient)}
                        className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer flex items-start gap-3 transition-colors"
                    >
                        <div className="bg-blue-100 p-2 rounded-full">
                            <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">{patient.firstName} {patient.lastName}</div>
                            <div className="text-xs text-gray-500">
                                ID: {patient.patientNumber} • Ph: {patient.phone}
                            </div>
                            <div className="text-xs text-gray-400">
                                DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))}
                
                {patients.length === 0 && searchQuery && !loading && (
                    <div className="text-center text-gray-500 py-4 text-sm">No patients found.</div>
                )}
            </div>
        </div>
    );
};

export default PatientSearchModal;
