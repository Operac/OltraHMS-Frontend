import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Eye, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminService } from '../../services/admin.service';
import { format } from 'date-fns';

const LeaveManagement = () => {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
    
    // Review Modal State
    const [selectedLeave, setSelectedLeave] = useState<any | null>(null);
    const [conflicts, setConflicts] = useState<any[]>([]);
    const [checkingConflicts, setCheckingConflicts] = useState(false);

    useEffect(() => {
        loadLeaves();
    }, [filter]);

    const loadLeaves = async () => {
        setLoading(true);
        try {
            const status = filter === 'ALL' ? undefined : filter;
            const data = await AdminService.getAllLeaves(status);
            setLeaves(data);
        } catch (error) {
            console.error("Failed to load leaves");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        if (!confirm(`Are you sure you want to ${newStatus} this request?`)) return;

        try {
            await AdminService.updateLeaveStatus(id, newStatus);
            toast.success(`Leave request ${newStatus}`);
            setSelectedLeave(null);
            loadLeaves();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update status");
            console.error(error);
        }
    };

    const handleReviewClick = async (leave: any) => {
        setSelectedLeave(leave);
        setCheckingConflicts(true);
        try {
            const data = await AdminService.getConflictingLeaves(leave.id);
            setConflicts(data);
        } catch (error) {
            console.error("Failed to check conflicts");
            setConflicts([]);
        } finally {
            setCheckingConflicts(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
                <select 
                    className="p-2 border rounded-lg bg-white shadow-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="ALL">All Requests</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-3 text-left">Staff</th>
                            <th className="px-6 py-3 text-left">Type & Reason</th>
                            <th className="px-6 py-3 text-left">Dates</th>
                            <th className="px-6 py-3 text-left">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                             <tr><td colSpan={5} className="p-6 text-center">Loading...</td></tr>
                        ) : leaves.length === 0 ? (
                            <tr><td colSpan={5} className="p-6 text-center text-gray-500">No leave requests found</td></tr>
                        ) : leaves.map((leave) => (
                            <tr key={leave.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{leave.staff?.user?.firstName} {leave.staff?.user?.lastName}</div>
                                    <div className="text-xs text-gray-500">ID: {leave.staff?.staffNumber}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-medium text-gray-700 block">{leave.leaveType?.name || 'Unknown'}</span>
                                    <span className="text-sm text-gray-500 truncate max-w-xs block" title={leave.reason}>{leave.reason}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">{leave.days} Days</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                                        {leave.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {leave.status === 'PENDING' && (
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleReviewClick(leave)}
                                                className="text-blue-600 hover:text-blue-800 p-1 rounded bg-blue-50 hover:bg-blue-100 flex items-center gap-1 px-3 text-sm font-medium" 
                                                title="Review Request"
                                            >
                                                <Eye className="w-4 h-4" /> Review
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Review Modal */}
            {selectedLeave && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Review Leave Request</h2>
                            <button onClick={() => setSelectedLeave(null)} className="text-gray-400 hover:text-gray-600">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 mb-1">Staff Member</p>
                                    <p className="font-medium text-gray-900">{selectedLeave.staff?.user?.firstName} {selectedLeave.staff?.user?.lastName}</p>
                                    <p className="text-xs text-gray-500">{selectedLeave.staff?.staffNumber}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Leave Type</p>
                                    <p className="font-medium text-gray-900">{selectedLeave.leaveType?.name}</p>
                                    <p className="text-xs text-gray-500">{selectedLeave.days} Days Requested</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Dates</p>
                                    <p className="font-medium text-gray-900 border border-gray-200 rounded p-2 bg-gray-50">
                                        {format(new Date(selectedLeave.startDate), 'MMM dd, yyyy')} &rarr; {format(new Date(selectedLeave.endDate), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Reason</p>
                                    <p className="text-gray-700 bg-gray-50 p-2 rounded border border-gray-200 min-h-[40px]">{selectedLeave.reason}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    Conflict Detection 
                                    {checkingConflicts ? (
                                        <span className="text-sm font-normal text-gray-500 animate-pulse">Checking...</span>
                                    ) : (
                                        <span className={`text-sm font-normal px-2 py-0.5 rounded-full ${conflicts.length > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {conflicts.length > 0 ? `${conflicts.length} Overlapping Leaves` : 'No Conflicts Found'}
                                        </span>
                                    )}
                                </h3>
                                
                                {!checkingConflicts && conflicts.length > 0 && (
                                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 space-y-3">
                                        <div className="flex items-start gap-3 text-red-800 font-medium">
                                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                            <p>The following staff members in the same department already have approved leave during this requested period:</p>
                                        </div>
                                        <ul className="pl-8 space-y-2 text-sm text-red-700 list-disc">
                                            {conflicts.map(conflict => (
                                                <li key={conflict.id}>
                                                    <span className="font-semibold">{conflict.staff?.user?.firstName} {conflict.staff?.user?.lastName}</span> 
                                                    ({format(new Date(conflict.startDate), 'MMM dd')} - {format(new Date(conflict.endDate), 'MMM dd')})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {!checkingConflicts && conflicts.length === 0 && (
                                    <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-green-800 text-sm flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" /> All clear. No other staff in their department are scheduled for leave during this time.
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                             <button 
                                onClick={() => handleStatusUpdate(selectedLeave.id, 'REJECTED')}
                                className="px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 font-medium rounded-lg"
                            >
                                Reject Request
                            </button>
                            <button 
                                onClick={() => handleStatusUpdate(selectedLeave.id, 'APPROVED')}
                                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 font-medium rounded-lg shadow-sm"
                            >
                                Approve Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveManagement;
