
import { useState, useEffect } from 'react';
import { radiologyService } from '../../services/radiology.service';
import type { RadiologyRequest } from '../../services/radiology.service';
import { Activity, FileText, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

const RadiologyDashboard = () => {
    const [requests, setRequests] = useState<RadiologyRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'PENDING' | 'COMPLETED'>('PENDING');
    
    // Modal State
    const [selectedRequest, setSelectedRequest] = useState<RadiologyRequest | null>(null);
    const [findings, setFindings] = useState('');
    const [impression, setImpression] = useState('');
    const [files, setFiles] = useState<FileList | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadRequests();
    }, [filterStatus]);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const data = await radiologyService.getRequests({ status: filterStatus === 'PENDING' ? 'PENDING' : 'COMPLETED' });
            // API might return all if we don't filter strictly, but let's assume service handles it
            // Or we client side filter if API is loose. 
            // The controller supports ?status=...
            setRequests(data);
        } catch (error) {
            console.error('Failed to load requests', error);
            toast.error('Failed to load radiology worklist');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;
        if (!files || files.length === 0) {
            toast.error('Please select at least one image');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('findings', findings);
        formData.append('impression', impression);
        
        Array.from(files).forEach((file) => {
            formData.append('images', file);
        });

        try {
            await radiologyService.addReport(selectedRequest.id, formData);
            toast.success('Report uploaded successfully');
            setSelectedRequest(null);
            setFindings('');
            setImpression('');
            setFiles(null);
            loadRequests(); 
        } catch (error) {
            console.error('Failed to upload report', error);
            toast.error('Failed to upload report');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                        <Activity className="text-blue-600" /> Radiology Dashboard
                    </h1>
                    <p className="text-gray-600">Manage imaging requests and reports.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setFilterStatus('PENDING')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'PENDING' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
                    >
                        Pending Worklist
                    </button>
                    <button 
                        onClick={() => setFilterStatus('COMPLETED')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'COMPLETED' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}
                    >
                       Completed
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {requests.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No {filterStatus.toLowerCase()} requests found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium text-sm uppercase">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Patient</th>
                                        <th className="p-4">Test</th>
                                        <th className="p-4">Priority</th>
                                        <th className="p-4">Doctor</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {requests.map(req => (
                                        <tr key={req.id} className="hover:bg-gray-50">
                                            <td className="p-4 text-sm whitespace-nowrap">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                                <div className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleTimeString()}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-gray-900">{req.patient.firstName} {req.patient.lastName}</div>
                                                <div className="text-xs text-gray-500">{req.patient.patientNumber}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-medium">{req.test.name}</span>
                                                <div className="text-xs text-gray-500">{req.test.modality}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                    ${req.priority === 'STAT' ? 'bg-red-100 text-red-800' : 
                                                      req.priority === 'URGENT' ? 'bg-orange-100 text-orange-800' : 
                                                      'bg-blue-100 text-blue-800'}`}>
                                                    {req.priority}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                {req.doctorName || (req.doctor?.firstName ? `Dr. ${req.doctor.firstName} ${req.doctor.lastName}` : 'Unknown')}
                                            </td>
                                            <td className="p-4 text-right">
                                                {filterStatus === 'PENDING' ? (
                                                    <button 
                                                        onClick={() => setSelectedRequest(req)}
                                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center justify-end gap-1 ml-auto"
                                                    >
                                                        <Upload size={16} /> Upload Report
                                                    </button>
                                                ) : (
                                                    <a 
                                                        href={req.report?.imageUrls?.[0] || '#'} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center justify-end gap-1 ml-auto"
                                                    >
                                                        <FileText size={16} /> View Report
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Upload Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-semibold text-lg">Upload Radiology Report</h3>
                            <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpload} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                                    {selectedRequest.patient.firstName} {selectedRequest.patient.lastName} - {selectedRequest.test.name}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Findings</label>
                                <textarea 
                                    required
                                    value={findings}
                                    onChange={e => setFindings(e.target.value)}
                                    rows={4}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    placeholder="Detailed radiological findings..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Impression</label>
                                <textarea 
                                    required
                                    value={impression}
                                    onChange={e => setImpression(e.target.value)}
                                    rows={2}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    placeholder="Summary impression..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Images (DICOM/JPG/PNG)</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500">
                                                <span>Upload files</span>
                                                <input 
                                                    id="file-upload" 
                                                    name="file-upload" 
                                                    type="file" 
                                                    className="sr-only" 
                                                    multiple 
                                                    accept="image/*,application/pdf"
                                                    onChange={e => setFiles(e.target.files)}
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                                        {files && files.length > 0 && (
                                            <div className="text-sm text-green-600 font-medium mt-2">
                                                {files.length} files selected
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRequest(null)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                            Uploading...
                                        </>
                                    ) : (
                                        'Submit Report'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RadiologyDashboard;
