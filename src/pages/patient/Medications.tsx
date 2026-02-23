import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Pill, Calendar, AlertCircle, CheckCircle, Download, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';

const Medications = () => {
    const { token } = useAuth();
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMeds = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                // Determine API endpoint based on role via headers (backend handles `patientId` deduction)
                const res = await axios.get(`${API_URL}/prescriptions`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPrescriptions(res.data);
            } catch (err) {
                console.error("Failed to fetch medications", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMeds();
    }, [token]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading medications...</div>;

    const activeMeds = prescriptions.filter(p => p.status !== 'CANCELLED');


    // Helper to calculate expiry or remaining days
    const getStatusColor = (status: string) => {
        if (status === 'DISPENSED') return 'bg-green-100 text-green-700';
        if (status === 'PENDING') return 'bg-yellow-100 text-yellow-700';
        if (status === 'REFILL_REQUESTED') return 'bg-amber-100 text-amber-700';
        return 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Medications</h1>
                    <p className="text-gray-500 mt-1">Manage current prescriptions and refill history</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeMeds.length === 0 && (
                     <div className="col-span-full text-center p-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No Active Prescriptions</h3>
                        <p className="text-gray-500">You don't have any active medications at the moment.</p>
                     </div>
                )}

                {activeMeds.map(med => (
                    <div key={med.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="p-5 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Pill className="w-6 h-6 text-blue-600" />
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(med.status)}`}>
                                    {med.status}
                                </span>
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{med.medicationName}</h3>
                            <p className="text-sm text-gray-500 mb-4">{med.dosage} • {med.frequency}</p>
                            
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>Prescribed: {format(new Date(med.createdAt), 'MMM d, yyyy')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Duration: {med.duration} Days</span>
                                </div>
                                {med.instructions && (
                                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 mt-2">
                                        <span className="font-semibold block text-xs uppercase text-gray-400 mb-1">Instructions</span>
                                        {med.instructions}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center text-sm">
                            <span className="text-gray-500">Dr. {med.medicalRecord?.doctor?.user?.lastName}</span>
                            {/* Logic for refills could go here */}
                             {med.status === 'REFILL_REQUESTED' && (
                                <span className="text-amber-600 font-medium flex items-center gap-1">
                                    <RefreshCcw className="w-4 h-4 animate-spin-slow" /> Refill Requested
                                </span>
                             )}
                             {med.status === 'DISPENSED' && (
                                 <button
                                     onClick={async () => {
                                         if(!confirm('Request refill for ' + med.medicationName + '?')) return;
                                         try {
                                             const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                                             await axios.post(`${API_URL}/prescriptions/${med.id}/refill`, {}, {
                                                 headers: { Authorization: `Bearer ${token}` }
                                             });
                                             // Refresh locally or reload
                                             alert('Refill requested.');
                                             window.location.reload(); 
                                         } catch (e) {
                                             alert('Failed to request refill');
                                         }
                                     }}
                                     className="text-blue-600 font-medium flex items-center gap-1 hover:underline"
                                 >
                                    <RefreshCcw className="w-4 h-4" /> Request Refill
                                 </button>
                             )}

                             {med.status === 'PENDING' && (
                                <span className="text-blue-600 font-medium flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" /> Pickup at Pharmacy
                                </span>
                             )}
                             {med.medicalRecordId && (
                                 <button
                                     onClick={async () => {
                                         try {
                                             const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                                             const res = await axios.get(`${API_URL}/medical-records/${med.medicalRecordId}/download`, {
                                                 headers: { Authorization: `Bearer ${token}` },
                                                 responseType: 'blob'
                                             });
                                             const url = window.URL.createObjectURL(new Blob([res.data]));
                                             const link = document.createElement('a');
                                             link.href = url;
                                             link.setAttribute('download', `Prescription_${med.medicationName}.pdf`);
                                             document.body.appendChild(link);
                                             link.click();
                                             link.remove();
                                         } catch (e) {
                                             alert('Failed to download');
                                         }
                                     }}
                                     className="text-gray-500 hover:text-blue-600 flex items-center gap-1"
                                     title="Download Prescription PDF"
                                 >
                                     <Download className="w-4 h-4" />
                                 </button>
                             )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Medications;
