import { useState, useEffect } from 'react';
import { Pill, AlertCircle, ShoppingCart, RefreshCw, Package, Truck, Plus, BarChart3, Shield, DollarSign, CheckCircle, Trash2 } from 'lucide-react';
import { PharmacyService } from '../../services/pharmacy.service';
import axios from 'axios';
import DispenseModal from './DispenseModal';
import PurchaseOrderForm from './PurchaseOrderForm';
import AddMedicationModal from './AddMedicationModal';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Role } from '../../constants/roles';

const PharmacyDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'QUEUE' | 'INVENTORY' | 'REPORTS' | 'REFILL_REQUESTS'>('QUEUE');
    const [queue, setQueue] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Modals
    const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
    const [showPOForm, setShowPOForm] = useState(false);
    const [showAddMedModal, setShowAddMedModal] = useState(false);
    const [waiveModal, setWaiveModal] = useState<{open: boolean, prescriptionId: string | null}>({open: false, prescriptionId: null});
    const [waiveReason, setWaiveReason] = useState('');

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'QUEUE') {
                const data = await PharmacyService.getQueue();
                setQueue(data);
                // Also fetch inventory in background for modal
                const invData = await PharmacyService.getInventory();
                setInventory(invData);
            } else if (activeTab === 'REPORTS') {
                const data = await PharmacyService.getReport();
                setReport(data);
            } else if (activeTab === 'REFILL_REQUESTS') {
                const data = await PharmacyService.getRefillRequests();
                setQueue(data); // Reuse queue state for refill requests
            } else {
                const data = await PharmacyService.getInventory();
                setInventory(data);
            }
        } catch (error) {
            console.error("Failed to load pharmacy data", error);
            toast.error("Failed to load pharmacy data");
        } finally {
            setLoading(false);
        }
    };

    // --- RENDERERS ---

    const handleCreateInvoice = async (prescriptionId: string) => {
        try {
            await PharmacyService.createInvoice(prescriptionId);
            toast.success('Invoice Created & Sent to Cashier');
            loadData();
        } catch (error) {
            toast.error('Failed to create invoice');
        }
    };

    const renderQueue = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                    <tr>
                        <th className="px-6 py-3 text-left">Date</th>
                        <th className="px-6 py-3 text-left">Patient</th>
                        <th className="px-6 py-3 text-left">Medication</th>
                        <th className="px-6 py-3 text-left">Prescriber</th>
                        <th className="px-6 py-3 text-left">Payment</th>
                        <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {queue.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                No pending prescriptions.
                            </td>
                        </tr>
                    ) : (
                        queue.map((p: any) => {
                            const invoice = p.medicalRecord?.invoice;
                            const isPaid = invoice?.status === 'PAID';
                            const hasInvoice = !!invoice;
                            const servicePaymentStatus = p.paymentStatus || 'AWAITING_PAYMENT';
                            const isCleared = servicePaymentStatus === 'CLEARED' || servicePaymentStatus === 'WAIVED';

                            const getPaymentBadge = () => {
                                switch (servicePaymentStatus) {
                                    case 'AWAITING_PAYMENT':
                                        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">AWAITING PAYMENT</span>;
                                    case 'PAYMENT_SUBMITTED':
                                        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">SUBMITTED</span>;
                                    case 'CLEARED':
                                        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">CLEARED</span>;
                                    case 'WAIVED':
                                        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">WAIVED</span>;
                                    default:
                                        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{servicePaymentStatus}</span>;
                                }
                            };

                            return (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(p.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{p.patient.firstName} {p.patient.lastName}</div>
                                        <div className="text-xs text-gray-500">{p.patient.patientNumber}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-sky-700">{p.medicationName}</div>
                                        <div className="text-xs text-gray-500">{p.dosage} - {p.frequency}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        Dr. {p.medicalRecord?.doctor?.user?.lastName}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {getPaymentBadge()}
                                            {hasInvoice && (
                                                <span className="text-[10px] text-gray-400">{invoice.invoiceNumber}</span>
                                            )}
                                            {p.waiverReason && (
                                                <span className="text-[10px] text-purple-500" title={p.waiverReason}>
                                                    {p.waiverReason}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {!hasInvoice ? (
                                            <button 
                                                onClick={() => handleCreateInvoice(p.id)}
                                                className="text-sky-500 hover:text-sky-700 text-xs font-medium border border-sky-200 hover:bg-sky-50 px-3 py-1.5 rounded-lg"
                                            >
                                                Create Bill
                                            </button>
                                        ) : (
                                            <>
                                                <button 
                                                    onClick={() => setSelectedPrescription(p)}
                                                    disabled={!isPaid && !isCleared}
                                                    className={`px-4 py-2 rounded-lg text-sm shadow-sm ${
                                                        (isPaid || isCleared)
                                                            ? 'bg-sky-500 text-white hover:bg-sky-600' 
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                    {(isPaid || isCleared) ? 'Dispense' : 'Await Payment'}
                                                </button>
                                            </>
                                        )}

                                        {servicePaymentStatus === 'AWAITING_PAYMENT' && user?.role === Role.PATIENT && (
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await PharmacyService.submitPayment(p.id);
                                                        toast.success('Payment submitted for confirmation');
                                                        loadData();
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
                                                        await PharmacyService.clearPayment(p.id);
                                                        toast.success('Payment cleared');
                                                        loadData();
                                                    } catch(e: any) { toast.error(e.response?.data?.message || 'Failed'); }
                                                }}
                                                className="text-sm bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"
                                            >
                                                <DollarSign className="w-3 h-3" /> Clear Payment
                                            </button>
                                        )}

                                        {servicePaymentStatus !== 'CLEARED' && servicePaymentStatus !== 'WAIVED' && user?.role === Role.ADMIN && (
                                            <button
                                                onClick={() => setWaiveModal({open: true, prescriptionId: p.id})}
                                                className="text-sm bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1"
                                            >
                                                <Shield className="w-3 h-3" /> Waive
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderInventory = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="text-sm text-gray-500">Current Stock Levels</div>
                <div className="flex gap-2">
                    {['ADMIN', 'PHARMACIST'].includes(user?.role || '') && (
                        <button 
                            onClick={() => setShowAddMedModal(true)}
                            className="flex items-center gap-2 text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-sky-100 border border-sky-200"
                        >
                            <Plus className="w-4 h-4" /> Add Product
                        </button>
                    )}
                    <button 
                        onClick={() => setShowPOForm(true)}
                        className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-100 border border-green-200"
                    >
                        <Truck className="w-4 h-4" /> Receive Stock
                    </button>
                </div>
            </div>
            <table className="w-full">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                    <tr>
                        <th className="px-6 py-3 text-left">Medication</th>
                        <th className="px-6 py-3 text-left">Total Stock</th>
                        <th className="px-6 py-3 text-left">Batches</th>
                        <th className="px-6 py-3 text-left">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {inventory.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{item.name}</div>
                                <div className="text-xs text-gray-500">{item.category} | {item.dosageForm}</div>
                            </td>
                            <td className="px-6 py-4 text-lg font-bold text-gray-700">
                                {item.totalStock}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-2">
                                    {item.batches.map((b: any) => (
                                        <span key={b.id} className="px-2 py-1 bg-gray-100 rounded text-xs border border-gray-200 text-gray-600" title={`Exp: ${new Date(b.expiryDate).toLocaleDateString()}`}>
                                            #{b.batchNumber} ({b.quantity})
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {item.totalStock <= item.reorderLevel ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        <AlertCircle className="w-3 h-3" /> Low Stock
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        In Stock
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

     const renderReports = () => {
         if (!report) return <div className="p-8 text-center text-gray-500">Loading reports...</div>;
 
         return (
             <div className="space-y-6">
                 {/* Stats Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                         <div className="text-sm font-medium text-gray-500">Dispensed Today</div>
                         <div className="mt-2 text-3xl font-bold text-gray-900">{report.stats.today}</div>
                     </div>
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                         <div className="text-sm font-medium text-gray-500">This Week</div>
                         <div className="mt-2 text-3xl font-bold text-gray-900">{report.stats.week}</div>
                     </div>
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                         <div className="text-sm font-medium text-gray-500">This Month</div>
                         <div className="mt-2 text-3xl font-bold text-gray-900">{report.stats.month}</div>
                     </div>
                 </div>
 
                 {/* History Table */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                     <div className="p-4 border-b border-gray-100">
                         <h3 className="font-semibold text-gray-800">Recent Dispensing History</h3>
                     </div>
                     <table className="w-full">
                         <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                             <tr>
                                 <th className="px-6 py-3 text-left">Date</th>
                                 <th className="px-6 py-3 text-left">Medication</th>
                                 <th className="px-6 py-3 text-left">Prescriber</th>
                                 <th className="px-6 py-3 text-left">Patient</th>
                                 <th className="px-6 py-3 text-left">Qty</th>
                                 <th className="px-6 py-3 text-left">Dispensed By</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                             {report.history.map((item: any) => (
                                 <tr key={item.id} className="hover:bg-gray-50">
                                     <td className="px-6 py-4 text-sm text-gray-600">
                                         {new Date(item.dispensedAt).toLocaleString()}
                                     </td>
                                     <td className="px-6 py-4">
                                         <div className="font-medium text-gray-900">{item.medication.name}</div>
                                         <div className="text-xs text-gray-500">{item.medication.category}</div>
                                     </td>
                                     <td className="px-6 py-4 text-sm text-gray-600">
                                         Dr. {item.prescription.medicalRecord?.doctor?.user?.lastName || 'Unknown'}
                                     </td>
                                     <td className="px-6 py-4 text-sm text-gray-600">
                                         {item.prescription.patient.firstName} {item.prescription.patient.lastName}
                                     </td>
                                     <td className="px-6 py-4 font-medium text-gray-700">
                                         {item.quantity}
                                     </td>
                                      <td className="px-6 py-4 text-sm text-gray-500">
                                         {item.dispensedBy.user.firstName} {item.dispensedBy.user.lastName}
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </div>
         );
     };
     
     const renderRefillRequests = () => {
         return (
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="px-6 py-4 border-b border-gray-200">
                     <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                         <RefreshCw className="w-5 h-5 text-sky-500" /> Refill Requests ({queue.length})
                     </h2>
                 </div>
                 <div className="px-6 py-4 space-y-4">
                     {queue.length === 0 ? (
                         <div className="text-center py-8">
                             <AlertCircle className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                             <p className="text-gray-500">No refill requests found</p>
                         </div>
                     ) : (
                         <div className="overflow-x-auto">
                             <table className="w-full text-left">
                                 <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                                     <tr>
                                         <th className="px-6 py-3">Patient</th>
                                         <th className="px-6 py-3">Medication</th>
                                         <th className="px-6 py-3">Prescriber</th>
                                         <th className="px-6 py-3">Requested</th>
                                         <th className="px-6 py-3">Action</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-100">
                                     {queue.map((prescription: any) => (
                                         <tr key={prescription.id} className="hover:bg-gray-50">
                                             <td className="px-6 py-4">
                                                 <div className="flex flex-col">
                                                     <div className="font-medium text-gray-900">
                                                         {prescription.patient.firstName} {prescription.patient.lastName}
                                                     </div>
                                                     <div className="text-xs text-gray-500">
                                                         #{prescription.patient.patientNumber}
                                                     </div>
                                                 </div>
                                             </td>
                                             <td className="px-6 py-4">
                                                 <div className="font-medium text-sky-700">{prescription.medicationName}</div>
                                                 <div className="text-xs text-gray-500">{prescription.dosage} - {prescription.frequency}</div>
                                             </td>
                                             <td className="px-6 py-4 text-sm text-gray-600">
                                                 Dr. {prescription.medicalRecord?.doctor?.user?.lastName}
                                             </td>
                                             <td className="px-6 py-4 text-sm text-gray-600">
                                                 {new Date(prescription.requestedAt).toLocaleDateString()}
                                             </td>
                                             <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                      onClick={async () => {
                                                          if(!confirm('Approve refill for ' + prescription.medicationName + '?')) return;
                                                          try {
                                                              const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                                                              await axios.post(`${API_URL}/prescriptions/${prescription.id}/approve-refill`, {}, {
                                                                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                                              });
                                                              toast.success('Refill approved');
                                                              loadData();
                                                          } catch (e) {
                                                              toast.error('Failed to approve refill');
                                                          }
                                                      }}
                                                      className="text-green-500 font-medium flex items-center gap-1 hover:underline"
                                                  >
                                                  <CheckCircle className="w-4 h-4" /> Approve
                                                  </button>
                                                  <button
                                                      onClick={async () => {
                                                          if(!confirm('Deny refill for ' + prescription.medicationName + '?')) return;
                                                          try {
                                                              const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                                                              await axios.post(`${API_URL}/prescriptions/${prescription.id}/deny-refill`, {}, {
                                                                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                                              });
                                                              toast.success('Refill denied');
                                                              loadData();
                                                          } catch (e) {
                                                              toast.error('Failed to deny refill');
                                                          }
                                                      }}
                                                      className="text-red-500 font-medium flex items-center gap-1 hover:underline"
                                                  >
                                                  <Trash2 className="w-4 h-4" /> Deny
                                                  </button>
                                             </td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                         </div>
                     )}
                 </div>
             </div>
         );
     };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Pill className="w-8 h-8 text-sky-500" /> Pharmacy Management
                </h1>
                <div className="flex gap-2">
                    <button 
                        onClick={loadData}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-4 border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('QUEUE')}
                    className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'QUEUE' ? 'text-sky-500' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" /> Prescription Queue
                        {queue.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{queue.length}</span>}
                    </div>
                    {activeTab === 'QUEUE' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-500"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('INVENTORY')}
                    className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'INVENTORY' ? 'text-sky-500' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" /> Inventory & Stock
                    </div>
                    {activeTab === 'INVENTORY' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-500"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('REFILL_REQUESTS')}
                    className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'REFILL_REQUESTS' ? 'text-sky-500' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Refill Requests
                        {queue.length > 0 && activeTab === 'REFILL_REQUESTS' && <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{queue.length}</span>}
                    </div>
                    {activeTab === 'REFILL_REQUESTS' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-500"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('REPORTS')}
                    className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'REPORTS' ? 'text-sky-500' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" /> Reports
                    </div>
                    {activeTab === 'REPORTS' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-500"></div>}
                </button>
            </div>

            {/* Content */}
            {activeTab === 'QUEUE' && renderQueue()}
            {activeTab === 'INVENTORY' && renderInventory()}
            {activeTab === 'REPORTS' && renderReports()}
            {activeTab === 'REFILL_REQUESTS' && renderRefillRequests()}

            {/* Modals */}
            {selectedPrescription && (
                <DispenseModal 
                    prescription={selectedPrescription} 
                    inventory={inventory}
                    onClose={() => setSelectedPrescription(null)}
                    onSuccess={() => {
                        setSelectedPrescription(null);
                        loadData();
                    }}
                />
            )}

            {showPOForm && (
                <PurchaseOrderForm 
                    availableMeds={inventory} // Pass list for select dropdown
                    onClose={() => setShowPOForm(false)}
                    onSuccess={() => {
                        setShowPOForm(false);
                        loadData();
                    }}
                />
            )}

            {showAddMedModal && (
                <AddMedicationModal 
                    onClose={() => setShowAddMedModal(false)}
                    onSuccess={() => {
                        setShowAddMedModal(false);
                        loadData();
                    }}
                />
            )}

            {/* Waiver Modal */}
            {waiveModal.open && waiveModal.prescriptionId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Shield className="text-purple-500" /> Emergency Waiver
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">
                            This will waive the payment requirement for this prescription. Please provide a reason.
                        </p>
                        <textarea
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-400 h-24 mb-4"
                            placeholder="Reason for waiver (e.g., Emergency patient, VIP, etc.)"
                            value={waiveReason}
                            onChange={e => setWaiveReason(e.target.value)}
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => { setWaiveModal({open: false, prescriptionId: null}); setWaiveReason(''); }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await PharmacyService.waivePayment(waiveModal.prescriptionId!, waiveReason || 'Emergency waiver');
                                        toast.success('Payment waived');
                                        setWaiveModal({open: false, prescriptionId: null});
                                        setWaiveReason('');
                                        loadData();
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

export default PharmacyDashboard;
