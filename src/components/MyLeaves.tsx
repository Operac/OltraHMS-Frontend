import { useState, useEffect } from 'react';
import { Calendar, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { HRService } from '../services/hr.service';
import { format } from 'date-fns';

const MyLeaves = () => {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [balances, setBalances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        reason: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [leavesData, balancesData] = await Promise.all([
                HRService.getMyLeaves(),
                HRService.getMyBalances()
            ]);
            setLeaves(leavesData);
            setBalances(balancesData);
            if (balancesData.length > 0) {
                setFormData(prev => ({ ...prev, leaveTypeId: balancesData[0].leaveTypeId }));
            }
        } catch (error) {
            console.error("Failed to load leaves/balances");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await toast.promise(
                HRService.requestLeave(formData),
                {
                    loading: 'Submitting leave request...',
                    success: 'Leave requested successfully!',
                    error: 'Failed to submit request'
                }
            );
            setShowModal(false);
            loadData();
            setFormData({ leaveTypeId: balances.length > 0 ? balances[0].leaveTypeId : '', startDate: '', endDate: '', reason: '' });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">My Leave History</h3>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus className="w-5 h-5" /> Request Leave
                </button>
            </div>

            {/* Balances Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {balances.map(b => (
                    <div key={b.leaveTypeId} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm text-center">
                        <p className="text-sm text-gray-500 font-medium mb-1">{b.leaveTypeName}</p>
                        <p className="text-2xl font-bold text-gray-800">{b.allocatedDays - b.usedDays} <span className="text-sm font-normal text-gray-500">days left</span></p>
                        <p className="text-xs text-gray-400 mt-1">Used {b.usedDays} of {b.allocatedDays}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-3 text-left">Type</th>
                            <th className="px-6 py-3 text-left">Dates</th>
                            <th className="px-6 py-3 text-left">Days</th>
                            <th className="px-6 py-3 text-left">Status</th>
                            <th className="px-6 py-3 text-left">Reason</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                             <tr><td colSpan={5} className="p-6 text-center">Loading...</td></tr>
                        ) : leaves.length === 0 ? (
                            <tr><td colSpan={5} className="p-6 text-center text-gray-500">No leave requests found</td></tr>
                        ) : leaves.map((leave) => (
                            <tr key={leave.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{leave.leaveType?.name || 'Unknown'}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">{leave.days}</td>
                                <td className="px-6 py-4">
                                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                                        leave.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {leave.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{leave.reason}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Request Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-lg font-bold mb-4">Request Leave</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                <select 
                                    className="w-full p-2 border rounded"
                                    value={formData.leaveTypeId}
                                    onChange={e => setFormData({...formData, leaveTypeId: e.target.value})}
                                    required
                                >
                                    {balances.map(b => (
                                        <option key={b.leaveTypeId} value={b.leaveTypeId}>{b.leaveTypeName} ({b.allocatedDays - b.usedDays} left)</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                    <input type="date" required className="w-full p-2 border rounded" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                                    <input type="date" required className="w-full p-2 border rounded" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reason</label>
                                <textarea 
                                    required 
                                    className="w-full p-2 border rounded h-24" 
                                    value={formData.reason} 
                                    onChange={e => setFormData({...formData, reason: e.target.value})}
                                    placeholder="Enter reason for leave..."
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyLeaves;
