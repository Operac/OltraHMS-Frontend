
import { useState } from 'react';
import { Search, User, FileText, ArrowLeft } from 'lucide-react';
import PatientSearchModal from '../../pages/receptionist/PatientSearchModal';
import { InpatientCare } from '../../components/nurse/InpatientCare';

const TreatmentDashboard = () => {
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [showSearch, setShowSearch] = useState(false);
    const [patientName, setPatientName] = useState('');

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Treatment Room</h1>
                    <p className="text-gray-500">Manage outpatient injections and treatments</p>
                </div>
                {!selectedPatientId && (
                    <button 
                        onClick={() => setShowSearch(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                    >
                        <Search className="w-4 h-4" /> Find Patient
                    </button>
                )}
                {selectedPatientId && (
                    <button 
                        onClick={() => { setSelectedPatientId(null); setPatientName(''); }}
                        className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Search
                    </button>
                )}
            </div>

            {!selectedPatientId ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User className="w-10 h-10" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Patient</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        Search for a patient to view their medication schedule, record vitals, or administer treatments.
                    </p>
                    <button 
                        onClick={() => setShowSearch(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm inline-flex items-center gap-2"
                    >
                        <Search className="w-5 h-5" /> Search Patient Records
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center gap-3">
                        <User className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-900">Treating: <span className="font-bold text-lg ml-1">{patientName}</span></span>
                    </div>
                    
                    {/* Reuse InpatientCare component which handles MAR and Fluids */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                         <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-500" /> Care Plan & Administration
                            </h3>
                        </div>
                        <InpatientCare patientId={selectedPatientId} />
                    </div>
                </div>
            )}

            {showSearch && (
                <PatientSearchModal 
                    onClose={() => setShowSearch(false)}
                    onSelect={(patient) => {
                        setSelectedPatientId(patient.id);
                        setPatientName(`${patient.firstName} ${patient.lastName}`);
                        setShowSearch(false);
                    }}
                />
            )}
        </div>
    );
};

export default TreatmentDashboard;
