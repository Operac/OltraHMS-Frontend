import { useState, useEffect } from 'react';
import { labService } from '../../services/lab.service';
import type { LabOrder } from '../../services/lab.service';
import { Activity, FileText, Upload, CheckCircle, Shield, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../constants/roles';

const LabDashboard = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<LabOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
    const [uploading, setUploading] = useState(false);
    const [waiveModal, setWaiveModal] = useState<{open: boolean, orderId: string | null}>({open: false, orderId: null});
    const [waiveReason, setWaiveReason] = useState('');
    
    // Form State
    const [resultText, setResultText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await labService.getPendingOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to load orders', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await labService.updateStatus(id, status);
            loadOrders(); // Refresh
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('resultData', JSON.stringify({ summary: resultText }));
        if (file) {
            formData.append('file', file);
        }

        try {
            await labService.uploadResult(selectedOrder.id, formData);
            setSelectedOrder(null); // Close modal
            setResultText('');
            setFile(null);
            loadOrders(); // Refresh
        } catch (error) {
            console.error('Failed to upload result', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Activity className="text-sky-500" /> Lab Dashboard
                </h1>
                <p className="text-gray-600">Manage pending tests and upload results.</p>
            </header>

            {loading ? (
                <p>Loading queue...</p>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium text-sm uppercase">
                            <tr>
                                <th className="p-4">Patient</th>
                                <th className="p-4">Test Requested</th>
                                <th className="p-4">Priority</th>
                                <th className="p-4">Requested By</th>
                                <th className="p-4">Payment</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map(order => {
                                const invoice = order.medicalRecord.invoice;
                                const paymentStatus = invoice ? invoice.status : 'UNBILLED';
                                const isPaid = paymentStatus === 'PAID';
                                const isEmergency = order.priority === 'STAT';
                                const servicePaymentStatus = order.paymentStatus || 'AWAITING_PAYMENT';
                                const isCleared = servicePaymentStatus === 'CLEARED' || servicePaymentStatus === 'WAIVED';
                                const canProcess = isPaid || isEmergency || isCleared;

                                const getPaymentBadge = () => {
                                    switch (servicePaymentStatus) {
                                        case 'AWAITING_PAYMENT':
                                            return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">AWAITING PAYMENT</span>;
                                        case 'PAYMENT_SUBMITTED':
                                            return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">SUBMITTED</span>;
                                        case 'CLEARED':
                                            return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">CLEARED</span>;
                                        case 'WAIVED':
                                            return <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">WAIVED</span>;
                                        default:
                                            return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{servicePaymentStatus}</span>;
                                    }
                                };

                                return (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="font-medium">{order.patient.firstName} {order.patient.lastName}</div>
                                        <div className="text-xs text-gray-500">{order.patient.patientNumber}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-sky-500">{order.testName}</div>
                                        <div className="text-xs text-gray-500">{new Date(order.orderedAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            order.priority === 'STAT' ? 'bg-red-100 text-red-700' :
                                            order.priority === 'URGENT' ? 'bg-orange-100 text-orange-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {order.priority}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        Dr. {order.medicalRecord.doctor.user.lastName}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            {getPaymentBadge()}
                                            {invoice && (
                                                <span className={`text-[10px] ${
                                                    invoice.status === 'PAID' ? 'text-green-600' : 'text-gray-400'
                                                }`}>
                                                    Invoice: {invoice.status}
                                                </span>
                                            )}
                                            {order.waiverReason && (
                                                <span className="text-[10px] text-purple-500" title={order.waiverReason}>
                                                    {order.waiverReason}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            order.status === 'IN_PROGRESS' ? 'bg-sky-100 text-sky-600' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2 flex justify-end flex-wrap">
                                        {paymentStatus === 'UNBILLED' && (
                                            <button
                                                onClick={async () => {
                                                    if(confirm('Create invoice for this test?')) {
                                                        try {
                                                            await labService.createInvoice(order.id, 0);
                                                            loadOrders();
                                                        } catch(e) { toast.error('Failed to create invoice'); }
                                                    }
                                                }}
                                                className="text-sm bg-teal-50 text-teal-600 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors"
                                            >
                                                Create Bill
                                            </button>
                                        )}

                                        {servicePaymentStatus === 'AWAITING_PAYMENT' && user?.role === Role.PATIENT && (
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await labService.submitPayment(order.id);
                                                        toast.success('Payment submitted for confirmation');
                                                        loadOrders();
                                                    } catch(e: any) { toast.error(e.response?.data?.message || 'Failed'); }
                                                }}
                                                className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                Submit Payment
                                            </button>
                                        )}

                                        {servicePaymentStatus === 'PAYMENT_SUBMITTED' && ['ADMIN', 'ACCOUNTANT', 'RECEPTIONIST'].includes(user?.role || '') && (
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await labService.clearPayment(order.id);
                                                        toast.success('Payment cleared');
                                                        loadOrders();
                                                    } catch(e: any) { toast.error(e.response?.data?.message || 'Failed'); }
                                                }}
                                                className="text-sm bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"
                                            >
                                                <DollarSign className="w-3 h-3" /> Clear Payment
                                            </button>
                                        )}

                                        {servicePaymentStatus !== 'CLEARED' && servicePaymentStatus !== 'WAIVED' && user?.role === Role.ADMIN && (
                                            <button
                                                onClick={() => setWaiveModal({open: true, orderId: order.id})}
                                                className="text-sm bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1"
                                            >
                                                <Shield className="w-3 h-3" /> Waive
                                            </button>
                                        )}

                                        {order.status === 'PENDING' && (
                                            <button 
                                                onClick={() => handleStatusUpdate(order.id, 'IN_PROGRESS')}
                                                disabled={!canProcess}
                                                title={!canProcess ? "Payment Required" : ""}
                                                className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                                                    canProcess 
                                                    ? 'bg-sky-50 text-sky-500 hover:bg-sky-100' 
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                Start
                                            </button>
                                        )}
                                        {order.status === 'IN_PROGRESS' && (
                                            <button 
                                                onClick={() => setSelectedOrder(order)}
                                                className="text-sm bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"
                                            >
                                                <Upload className="w-3 h-3" /> Complete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                            })}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">
                                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                                        No pending lab requests.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Results Upload Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <FileText className="text-sky-500" /> Upload Results
                        </h2>
                        <div className="mb-4 bg-gray-50 p-4 rounded-lg text-sm border border-gray-100">
                            <p><strong>Patient:</strong> {selectedOrder.patient.firstName} {selectedOrder.patient.lastName}</p>
                            <p><strong>Test:</strong> {selectedOrder.testName}</p>
                        </div>
                        
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Result Summary / Notes</label>
                                <textarea 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-sky-400 h-32"
                                    placeholder="Enter test results data..."
                                    value={resultText}
                                    onChange={e => setResultText(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Attach Report (PDF/Image)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                                        accept=".pdf,image/*"
                                    />
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">{file ? file.name : 'Click to upload document'}</p>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end mt-6">
                                <button 
                                    type="button"
                                    onClick={() => setSelectedOrder(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={uploading}
                                    className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 font-medium disabled:opacity-50"
                                >
                                    {uploading ? 'Processing...' : 'Submit Results'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Waiver Modal */}
            {waiveModal.open && waiveModal.orderId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Shield className="text-purple-500" /> Emergency Waiver
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">
                            This will waive the payment requirement for this lab order. Please provide a reason.
                        </p>
                        <textarea
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 h-24 mb-4"
                            placeholder="Reason for waiver (e.g., Emergency patient, VIP, etc.)"
                            value={waiveReason}
                            onChange={e => setWaiveReason(e.target.value)}
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => { setWaiveModal({open: false, orderId: null}); setWaiveReason(''); }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await labService.waivePayment(waiveModal.orderId!, waiveReason || 'Emergency waiver');
                                        toast.success('Payment waived');
                                        setWaiveModal({open: false, orderId: null});
                                        setWaiveReason('');
                                        loadOrders();
                                    } catch(e: any) { toast.error(e.response?.data?.message || 'Failed to waive'); }
                                }}
                                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium"
                            >
                                Confirm Waiver
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabDashboard;
