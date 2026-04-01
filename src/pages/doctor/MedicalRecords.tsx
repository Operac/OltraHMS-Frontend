import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, FileText, Calendar, Eye, X, Printer, User } from 'lucide-react';
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
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const pid = searchParams.get('patientId');
            const url = pid 
                ? `${API_URL}/medical-records?patientId=${pid}`
                : `${API_URL}/medical-records`;
                
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
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const res = await axios.get(`${API_URL}/medical-records/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedRecord(res.data);
        } catch(err) {
            console.error("Failed to fetch details", err);
            // alert("Could not load details"); // Removing alert to reduce noise if invalid ID
        }
    };

    const filteredRecords = records.filter(r => {
        // Convert to string and then to lowercase to avoid errors
        const term = String(searchTerm).toLowerCase();
        const pName = String((r.patient?.firstName || '') + ' ' + (r.patient?.lastName || '')).toLowerCase();
        const subj = String(typeof r.subjective === 'object' && r.subjective !== null 
            ? JSON.stringify(r.subjective) 
            : (r.subjective || '')).toLowerCase();
        
        return pName.includes(term) ||
               subj.includes(term);
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
                        className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-sky-400"
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
                                    <td className="p-4 text-sky-500 font-medium">
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
                                            className="p-2 text-sky-500 hover:bg-sky-50 rounded-lg flex items-center gap-1"
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
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div id="record-modal" className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        {/* Modern Header with gradient */}
                        <div className="bg-gradient-to-r from-sky-600 to-indigo-600 p-6 text-white no-print">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold">Medical Record</h2>
                                    <p className="text-sky-100 text-sm mt-1">ID: {selectedRecord.id}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handlePrint}
                                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 font-medium transition-colors"
                                    >
                                        <Printer className="w-5 h-5" />
                                        <span className="hidden sm:inline">Print</span>
                                    </button>
                                    <button onClick={() => setSelectedRecord(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Printable Header */}
                        <div className="hidden print:block p-6 text-center border-b bg-gradient-to-r from-sky-600 to-indigo-600 text-white">
                            <h2 className="text-3xl font-bold">OltraHMS Medical Report</h2>
                            <p className="text-sky-100">Confidential Medical Record</p>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-8 print:overflow-visible">
                            {/* Patient & Encounter Info Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-sky-50 to-indigo-50 p-5 rounded-xl border border-sky-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-sky-500 text-white rounded-lg">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-sm font-bold text-sky-700 uppercase">Patient</h3>
                                    </div>
                                    <p className="text-xl font-bold text-gray-900">{selectedRecord.patient?.firstName} {selectedRecord.patient?.lastName}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded text-xs font-medium">
                                            {selectedRecord.patient?.gender}
                                        </span>
                                        {selectedRecord.patient?.dateOfBirth && (
                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                                {format(new Date(selectedRecord.patient.dateOfBirth), 'MMM dd, yyyy')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-5 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-indigo-500 text-white rounded-lg">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-500 uppercase">Encounter</h3>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {selectedRecord.visitDate ? format(new Date(selectedRecord.visitDate), 'MMMM dd, yyyy') : 'N/A'}
                                    </p>
                                    <p className="text-indigo-600 font-medium mt-1">
                                        Dr. {selectedRecord.doctor?.user?.firstName} {selectedRecord.doctor?.user?.lastName}
                                    </p>
                                </div>
                            </div>

                            {/* SOAP Notes - Colorful Cards */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-sky-500" /> Clinical Notes
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white rounded-xl border-2 border-amber-100 p-4 hover:shadow-md transition">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                            <h4 className="font-bold text-amber-700">Subjective</h4>
                                        </div>
                                        <p className="text-gray-600 bg-amber-50 p-3 rounded-lg min-h-[80px] whitespace-pre-wrap text-sm">
                                            {typeof selectedRecord.subjective === 'object' ? JSON.stringify(selectedRecord.subjective, null, 2) : selectedRecord.subjective || 'No data'}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-xl border-2 border-blue-100 p-4 hover:shadow-md transition">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                            <h4 className="font-bold text-blue-700">Objective</h4>
                                        </div>
                                        <p className="text-gray-600 bg-blue-50 p-3 rounded-lg min-h-[80px] whitespace-pre-wrap text-sm">
                                            {typeof selectedRecord.objective === 'object' ? JSON.stringify(selectedRecord.objective, null, 2) : selectedRecord.objective || 'No data'}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-xl border-2 border-emerald-100 p-4 hover:shadow-md transition">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                            <h4 className="font-bold text-emerald-700">Assessment</h4>
                                        </div>
                                        <p className="text-gray-600 bg-emerald-50 p-3 rounded-lg min-h-[80px] whitespace-pre-wrap text-sm">
                                            {typeof selectedRecord.assessment === 'object' ? JSON.stringify(selectedRecord.assessment, null, 2) : selectedRecord.assessment || 'No data'}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-xl border-2 border-purple-100 p-4 hover:shadow-md transition">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                                            <h4 className="font-bold text-purple-700">Plan</h4>
                                        </div>
                                        <p className="text-gray-600 bg-purple-50 p-3 rounded-lg min-h-[80px] whitespace-pre-wrap text-sm">
                                            {typeof selectedRecord.plan === 'object' ? JSON.stringify(selectedRecord.plan, null, 2) : selectedRecord.plan || 'No data'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Prescriptions - Modern Card */}
                            {selectedRecord.prescriptions && selectedRecord.prescriptions.length > 0 && (
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="bg-green-50 px-5 py-3 border-b border-green-100 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-green-600" />
                                        <h3 className="font-bold text-green-800">Prescriptions</h3>
                                        <span className="ml-auto px-2 py-0.5 bg-green-200 text-green-800 rounded-full text-xs font-bold">
                                            {selectedRecord.prescriptions.length}
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="p-3 text-left font-semibold text-gray-600">Medication</th>
                                                    <th className="p-3 text-left font-semibold text-gray-600">Dosage</th>
                                                    <th className="p-3 text-left font-semibold text-gray-600">Frequency</th>
                                                    <th className="p-3 text-left font-semibold text-gray-600">Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {selectedRecord.prescriptions.map((p: any) => (
                                                    <tr key={p.id} className="hover:bg-green-50/50">
                                                        <td className="p-3 font-medium text-gray-900">{p.medicationName}</td>
                                                        <td className="p-3 text-gray-600">{p.dosage}</td>
                                                        <td className="p-3 text-gray-600">{p.frequency}</td>
                                                        <td className="p-3 text-gray-600">{p.duration} days</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                             {/* Lab Orders - Modern Card */}
                             {selectedRecord.labOrders && selectedRecord.labOrders.length > 0 && (
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="bg-teal-50 px-5 py-3 border-b border-teal-100 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-teal-600" />
                                        <h3 className="font-bold text-teal-800">Lab Orders</h3>
                                        <span className="ml-auto px-2 py-0.5 bg-teal-200 text-teal-800 rounded-full text-xs font-bold">
                                            {selectedRecord.labOrders.length}
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="p-3 text-left font-semibold text-gray-600">Test Name</th>
                                                    <th className="p-3 text-left font-semibold text-gray-600">Priority</th>
                                                    <th className="p-3 text-left font-semibold text-gray-600">Status</th>
                                                    <th className="p-3 text-left font-semibold text-gray-600">Result</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {selectedRecord.labOrders.map((l: any) => (
                                                    <tr key={l.id} className="hover:bg-teal-50/50">
                                                        <td className="p-3 font-medium text-gray-900">{l.testName}</td>
                                                        <td className="p-3">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                                l.priority === 'STAT' ? 'bg-red-100 text-red-800' :
                                                                l.priority === 'URGENT' ? 'bg-orange-100 text-orange-800' :
                                                                'bg-sky-100 text-sky-700'
                                                            }`}>{l.priority}</span>
                                                        </td>
                                                        <td className="p-3">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                l.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                                l.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-600'
                                                            }`}>{l.status}</span>
                                                        </td>
                                                        <td className="p-3">
                                                            {l.result ? (
                                                                <div className="text-xs">
                                                                    <div className="font-semibold text-gray-700">Result:</div>
                                                                    <pre className="whitespace-pre-wrap text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                                                                        {JSON.stringify(l.result.resultData, null, 2)}
                                                                    </pre>
                                                                    {l.result.aiInterpretation && (
                                                                        <div className="mt-2 text-teal-700 bg-teal-50 p-2 rounded">
                                                                            <strong>AI Note:</strong> {l.result.aiInterpretation}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 text-xs">Pending</span>
                                                            )}
                                                        </td>
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
