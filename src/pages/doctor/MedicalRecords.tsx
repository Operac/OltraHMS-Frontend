import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, FileText, Calendar, Eye, X, Printer } from 'lucide-react';
import { format } from 'date-fns';

const MedicalRecords = () => {
    const { token } = useAuth();
    const [searchParams] = useSearchParams();
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecord, setSelectedRecord] = useState<any>(null);

    useEffect(() => {
        fetchRecords();
        const recordId = searchParams.get('recordId');
        if (recordId) {
            fetchRecordDetails(recordId);
        }
    }, [token, searchParams]);

    const fetchRecords = async () => {
        try {
            const pid = searchParams.get('patientId');
            const url = pid 
                ? `http://localhost:3000/api/medical-records?patientId=${pid}`
                : 'http://localhost:3000/api/medical-records';
                
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecords(res.data);
            
            // If patientId is present, maybe auto-expand the first one or just show list?
            // For now, just filtering is enough.
        } catch (err) {
            console.error("Failed to fetch records", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecordDetails = async (id: string) => {
        try {
            const res = await axios.get(`http://localhost:3000/api/medical-records/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedRecord(res.data);
        } catch(err) {
            console.error("Failed to fetch details", err);
            // alert("Could not load details"); // Removing alert to reduce noise if invalid ID
        }
    };

    const filteredRecords = records.filter(r => {
        const term = searchTerm.toLowerCase();
        const pName = (r.patient?.firstName || '') + ' ' + (r.patient?.lastName || '');
        const subj = typeof r.subjective === 'object' && r.subjective !== null 
            ? JSON.stringify(r.subjective) 
            : (r.subjective || '');
        
        return pName.toLowerCase().includes(term) ||
               subj.toLowerCase().includes(term);
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-6">
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #record-modal, #record-modal * {
                            visibility: visible;
                        }
                        #record-modal {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            background: white;
                            z-index: 9999;
                        }
                        .no-print {
                            display: none !important;
                        }
                    }
                `}
            </style>
            
            <div className="flex justify-between items-center mb-6 no-print">
                <h1 className="text-2xl font-bold text-gray-800">Medical Records</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Search patient or diagnosis..." 
                        className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading records...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden no-print">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Date</th>
                                <th className="p-4 font-semibold text-gray-600">Patient</th>
                                <th className="p-4 font-semibold text-gray-600">Subjective (Complaint)</th>
                                <th className="p-4 font-semibold text-gray-600">Assessment</th>
                                <th className="p-4 font-semibold text-gray-600">Doctor</th>
                                <th className="p-4 font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRecords.length > 0 ? filteredRecords.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {format(new Date(record.visitDate), 'MMM dd, yyyy')}
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-gray-900">
                                        {record.patient?.firstName} {record.patient?.lastName}
                                    </td>
                                    <td className="p-4 text-gray-600 truncate max-w-xs block">
                                        {/* Handle both string and object JSON formats */}
                                        {typeof record.subjective === 'object' && record.subjective !== null 
                                            ? (record.subjective.chiefComplaint || JSON.stringify(record.subjective))
                                            : record.subjective}
                                    </td>
                                    <td className="p-4 text-blue-600 font-medium">
                                        {typeof record.assessment === 'object' && record.assessment !== null
                                            ? (record.assessment.primaryDiagnosis || JSON.stringify(record.assessment))
                                            : record.assessment}
                                    </td>
                                    <td className="p-4 text-gray-500 text-sm">
                                        Dr. {record.doctor?.user?.lastName}
                                    </td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => fetchRecordDetails(record.id)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1"
                                        >
                                            <Eye className="w-4 h-4" /> View
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">No records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {selectedRecord && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div id="record-modal" className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 no-print">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Medical Record</h2>
                                <p className="text-gray-500 text-sm">ID: {selectedRecord.id}</p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={handlePrint}
                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg flex items-center gap-2 font-medium transition-colors"
                                >
                                    <Printer className="w-5 h-5" />
                                    <span>Print / Download</span>
                                </button>
                                <button onClick={() => setSelectedRecord(null)} className="p-2 hover:bg-gray-200 rounded-full">
                                    <X className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>
                        </div>
                        
                        {/* Printable Header for print view only (usually hidden, but we show modal content) */}
                        <div className="hidden print:block p-6 text-center border-b">
                            <h2 className="text-3xl font-bold text-teal-900">OltraHMS Medical Report</h2>
                            <p className="text-gray-500">Confidential Medical Record</p>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-8 print:overflow-visible">
                            {/* ... Content ... */}
                            {/* Header Info */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="text-xs font-bold text-blue-800 uppercase mb-2">Patient</h3>
                                    <p className="text-lg font-bold">{selectedRecord.patient?.firstName} {selectedRecord.patient?.lastName}</p>
                                    <p className="text-sm text-blue-700">
                                        {selectedRecord.patient?.gender} 
                                        {selectedRecord.patient?.dateOfBirth && (
                                            <> • {format(new Date(selectedRecord.patient.dateOfBirth), 'yyyy-MM-dd')}</>
                                        )}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-right">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Encounter Info</h3>
                                    <p className="text-gray-900 font-medium">
                                        Date: {selectedRecord.visitDate ? format(new Date(selectedRecord.visitDate), 'PPP') : 'N/A'}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        Dr. {selectedRecord.doctor?.user?.firstName} {selectedRecord.doctor?.user?.lastName}
                                    </p>
                                </div>
                            </div>

                            {/* SOAP Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h3 className="font-bold text-gray-700 border-b pb-1">Subjective</h3>
                                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[100px] whitespace-pre-wrap">
                                        {typeof selectedRecord.subjective === 'object' ? JSON.stringify(selectedRecord.subjective, null, 2) : selectedRecord.subjective}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-gray-700 border-b pb-1">Objective</h3>
                                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[100px] whitespace-pre-wrap">
                                        {typeof selectedRecord.objective === 'object' ? JSON.stringify(selectedRecord.objective, null, 2) : selectedRecord.objective}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-gray-700 border-b pb-1">Assessment</h3>
                                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[100px] whitespace-pre-wrap">
                                        {typeof selectedRecord.assessment === 'object' ? JSON.stringify(selectedRecord.assessment, null, 2) : selectedRecord.assessment}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-gray-700 border-b pb-1">Plan</h3>
                                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[100px] whitespace-pre-wrap">
                                        {typeof selectedRecord.plan === 'object' ? JSON.stringify(selectedRecord.plan, null, 2) : selectedRecord.plan}
                                    </p>
                                </div>
                            </div>

                            {/* Prescriptions */}
                            {selectedRecord.prescriptions && selectedRecord.prescriptions.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-green-600" /> Prescriptions
                                    </h3>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="p-3 text-left">Medication</th>
                                                    <th className="p-3 text-left">Dosage</th>
                                                    <th className="p-3 text-left">Freq</th>
                                                    <th className="p-3 text-left">Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {selectedRecord.prescriptions.map((p: any) => (
                                                    <tr key={p.id}>
                                                        <td className="p-3 font-medium">{p.medicationName}</td>
                                                        <td className="p-3">{p.dosage}</td>
                                                        <td className="p-3">{p.frequency}</td>
                                                        <td className="p-3">{p.duration} days</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                             {/* Lab Orders */}
                             {selectedRecord.labOrders && selectedRecord.labOrders.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-teal-600" /> Lab Orders
                                    </h3>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="p-3 text-left">Test Name</th>
                                                    <th className="p-3 text-left">Priority</th>
                                                    <th className="p-3 text-left">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {selectedRecord.labOrders.map((l: any) => (
                                                    <tr key={l.id}>
                                                        <td className="p-3 font-medium">{l.testName}</td>
                                                        <td className="p-3">
                                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                                l.priority === 'STAT' ? 'bg-red-100 text-red-800' : 
                                                                l.priority === 'URGENT' ? 'bg-orange-100 text-orange-800' : 
                                                                'bg-blue-100 text-blue-800'
                                                            }`}>{l.priority}</span>
                                                        </td>
                                                        <td className="p-3">
                                                            <span className={`px-2 py-1 rounded text-xs ${
                                                                l.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'text-gray-500'
                                                            }`}>{l.status}</span>
                                                        </td>
                                                        {l.result && (
                                                            <td className="p-3 text-sm bg-gray-50">
                                                                <div className="font-semibold text-gray-700">Result:</div>
                                                                <pre className="whitespace-pre-wrap text-xs text-gray-600">
                                                                    {JSON.stringify(l.result.resultData, null, 2)}
                                                                </pre>
                                                                {l.result.aiInterpretation && (
                                                                    <div className="mt-1 text-xs text-teal-700">
                                                                        <strong>AI Note:</strong> {l.result.aiInterpretation}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicalRecords;
