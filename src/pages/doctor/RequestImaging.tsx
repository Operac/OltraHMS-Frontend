
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { radiologyService } from '../../services/radiology.service';
import type { RadiologyTest } from '../../services/radiology.service';
import * as doctorService from '../../services/doctor.service';
import { Activity, User, Search, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface PatientOption {
    id: string;
    firstName: string;
    lastName: string;
    patientNumber: string;
}

const RequestImaging = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Form State
    const [patientId, setPatientId] = useState(searchParams.get('patientId') || '');
    const [testId, setTestId] = useState('');
    const [priority, setPriority] = useState('ROUTINE');
    const [notes, setNotes] = useState('');
    
    // Data State
    const [tests, setTests] = useState<RadiologyTest[]>([]);
    const [patient, setPatient] = useState<PatientOption | null>(null);
    const [loadingTests, setLoadingTests] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Initial Load
    useEffect(() => {
        loadTests();
        if (patientId) {
            loadPatient(patientId);
        }
    }, []);

    const loadTests = async () => {
        try {
            const data = await radiologyService.getTests();
            setTests(data);
        } catch (error) {
            toast.error('Failed to load radiology tests');
        } finally {
            setLoadingTests(false);
        }
    };

    const loadPatient = async (id: string) => {
        try {
            // Using doctorService which now uses /patients/:id
            const data = await doctorService.getPatient(id);
            setPatient(data);
        } catch (error) {
            setPatient(null);
            // Don't toast error if just searching/typing
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientId || !testId) {
            toast.error('Please select a patient and a test');
            return;
        }

        setSubmitting(true);
        try {
            await radiologyService.createRequest({
                patientId,
                testId,
                priority,
                notes
            });
            toast.success('Radiology request created successfully');
            navigate('/radiology'); // Go to dashboard or stay? Dashboard seems right for Doctor view too.
        } catch (error) {
            console.error(error);
            toast.error('Failed to create request');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                    <Activity className="text-blue-600" /> Request Imaging
                </h1>
                <p className="text-gray-600">Order X-Rays, MRI, CT Scans for patients.</p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Patient Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                        {patient ? (
                            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold">
                                        {patient.firstName[0]}{patient.lastName[0]}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{patient.firstName} {patient.lastName}</p>
                                        <p className="text-xs text-blue-600">{patient.patientNumber}</p>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => { setPatient(null); setPatientId(''); }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    Change
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                               <input 
                                    type="text" 
                                    placeholder="Enter Patient ID..." 
                                    value={patientId}
                                    onChange={(e) => setPatientId(e.target.value)}
                                    onBlur={() => { if(patientId) loadPatient(patientId); }}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                <p className="text-xs text-gray-500 mt-1">Enter ID and click away to search.</p>
                            </div>
                        )}
                    </div>

                    {/* Test Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Imaging Test</label>
                        <select 
                            required
                            value={testId}
                            onChange={(e) => setTestId(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select a test...</option>
                            {tests.map(test => (
                                <option key={test.id} value={test.id}>
                                    {test.name} ({test.modality}) - ${test.price}
                                </option>
                            ))}
                        </select>
                        {loadingTests && <p className="text-xs text-gray-500 mt-1">Loading tests...</p>}
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <div className="flex gap-4">
                            {['ROUTINE', 'URGENT', 'STAT'].map(p => (
                                <label key={p} className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="priority" 
                                        value={p}
                                        checked={priority === p}
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className={`text-sm font-medium ${p === 'STAT' ? 'text-red-600' : 'text-gray-700'}`}>
                                        {p}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Notes</label>
                        <textarea 
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Reason for exam, symptoms..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting || !patientId}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting ? 'Submitting...' : <><CheckCircle size={18} /> Submit Request</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default RequestImaging;
