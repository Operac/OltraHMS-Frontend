import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Download, Calendar, User, Search, Beaker, Pill, Clock, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { PatientService } from '../../services/patient.service';

interface MedicalRecord {
    id: string;
    visitDate: string;
    createdAt: string;
    doctor: {
        firstName: string;
        lastName: string;
        specialization: string;
    };
    diagnosis: string;
    notes: string;
    prescriptions: any[];
    labResults: any[];
}

const Records = () => {
    const { token } = useAuth();
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'history' | 'labs' | 'prescriptions'>('history');

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                // Use PatientService
                const data = await PatientService.getMedicalRecords();
                setRecords(data);
            } catch (error) {
                console.error('Failed to fetch records', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchRecords();
    }, [token]);

    const handleDownload = async (recordId: string) => {
       // Placeholder for download logic - strictly speaking this endpoint might need to be verified or created if not existing
        alert(`Download function for record ${recordId} (PDF generation would happen here)`);
    };

    // Derived Data for Tabs
    const getAllLabs = () => {
        return records.flatMap(r => r.labResults?.map(l => ({ ...l, recordDate: r.visitDate, doctor: r.doctor })) || []);
    };

    const getAllPrescriptions = () => {
        return records.flatMap(r => r.prescriptions?.map(p => ({ ...p, recordDate: r.visitDate, doctor: r.doctor })) || []);
    };

    // Filtering Logic
    const getFilteredContent = () => {
        const searchlower = searchTerm.toLowerCase();
        
        switch (activeTab) {
            case 'history':
                return records.filter(r => 
                    r.doctor?.lastName?.toLowerCase().includes(searchlower) ||
                    r.diagnosis?.toLowerCase().includes(searchlower)
                );
            case 'labs':
                return getAllLabs().filter(l => 
                    l.testType?.toLowerCase().includes(searchlower) ||
                    l.result?.toLowerCase().includes(searchlower)
                );
            case 'prescriptions':
                return getAllPrescriptions().filter(p => 
                    p.medication?.name?.toLowerCase().includes(searchlower)
                );
            default:
                return [];
        }
    };

    const filteredData = getFilteredContent();

    if (loading) return (
        <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm gap-4">
                <div>
                     <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
                     <p className="text-gray-500 text-sm">Access your complete medical history, lab results, and prescriptions.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder={`Search ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => { setActiveTab('history'); setSearchTerm(''); }}
                        className={`${activeTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                    >
                        <Clock className="w-4 h-4" /> Visit History
                    </button>
                    <button
                        onClick={() => { setActiveTab('labs'); setSearchTerm(''); }}
                        className={`${activeTab === 'labs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                    >
                        <Beaker className="w-4 h-4" /> Lab Results
                        <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{getAllLabs().length}</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('prescriptions'); setSearchTerm(''); }}
                        className={`${activeTab === 'prescriptions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                    >
                        <Pill className="w-4 h-4" /> Prescriptions
                        <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{getAllPrescriptions().length}</span>
                    </button>
                </nav>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 gap-4">
                {activeTab === 'history' && (
                    filteredData.length > 0 ? (
                        filteredData.map((record: any) => (
                            <div key={record.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">
                                            {record.diagnosis || 'Medical Consultation'}
                                        </h3>
                                        <p className="text-gray-600 text-sm mt-1">{record.notes}</p>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(record.visitDate || record.createdAt), 'MMM d, yyyy')}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> Dr. {record.doctor?.lastName} ({record.doctor?.specialization})</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-end md:self-center">
                                     <button 
                                        onClick={() => handleDownload(record.id)}
                                        className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
                                    >
                                        <Download className="w-4 h-4" /> Download
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : <EmptyState message="No medical history found." />
                )}

                {activeTab === 'labs' && (
                    filteredData.length > 0 ? (
                        filteredData.map((lab: any, idx: number) => (
                            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 flex-shrink-0">
                                        <Beaker className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{lab.testType}</h4>
                                        <div className="mt-1 flex items-center gap-2">
                                             <span className="text-sm text-gray-500">Result:</span>
                                             <span className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-sm">{lab.result}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Ordered on {format(new Date(lab.recordDate), 'MMM d, yyyy')} by Dr. {lab.doctor?.lastName}
                                        </p>
                                    </div>
                                </div>
                                {lab.fileUrl && (
                                     <a href={lab.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                                        <Download className="w-4 h-4" /> View Report
                                     </a>
                                )}
                            </div>
                        ))
                    ) : <EmptyState message="No lab results found." />
                )}

                {activeTab === 'prescriptions' && (
                    filteredData.length > 0 ? (
                        filteredData.map((presc: any, idx: number) => (
                            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
                                        <Pill className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{presc.medication?.name || 'Unknown Medication'}</h4>
                                        <p className="text-sm text-gray-600">{presc.dosage} - {presc.frequency} for {presc.duration}</p>
                                        <div className="flex gap-2 mt-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                presc.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {presc.status}
                                            </span>
                                             <span className="text-xs text-gray-400 py-0.5">
                                                Prescribed: {format(new Date(presc.recordDate), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : <EmptyState message="No prescriptions found." />
                )}
            </div>
        </div>
    );
};

const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
        <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500 font-medium">{message}</p>
    </div>
);

export default Records;
