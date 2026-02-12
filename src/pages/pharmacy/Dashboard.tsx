import { useState, useEffect } from 'react';
import { Pill, AlertCircle, ShoppingCart, RefreshCw, Package, Truck } from 'lucide-react';
import { PharmacyService } from '../../services/pharmacy.service';
import DispenseModal from './DispenseModal';
import PurchaseOrderForm from './PurchaseOrderForm';

const PharmacyDashboard = () => {
    const [activeTab, setActiveTab] = useState<'QUEUE' | 'INVENTORY'>('QUEUE');
    const [queue, setQueue] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modals
    const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
    const [showPOForm, setShowPOForm] = useState(false);

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
            } else {
                const data = await PharmacyService.getInventory();
                setInventory(data);
            }
        } catch (error) {
            console.error("Failed to load pharmacy data", error);
        } finally {
            setLoading(false);
        }
    };

    // --- RENDERERS ---

    const renderQueue = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                    <tr>
                        <th className="px-6 py-3 text-left">Date</th>
                        <th className="px-6 py-3 text-left">Patient</th>
                        <th className="px-6 py-3 text-left">Medication</th>
                        <th className="px-6 py-3 text-left">Prescriber</th>
                        <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {queue.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                No pending prescriptions.
                            </td>
                        </tr>
                    ) : queue.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-600">
                                {new Date(p.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{p.patient.firstName} {p.patient.lastName}</div>
                                <div className="text-xs text-gray-500">{p.patient.patientNumber}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-medium text-blue-800">{p.medicationName}</div>
                                <div className="text-xs text-gray-500">{p.dosage} - {p.frequency}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                                Dr. {p.medicalRecord?.doctor?.user?.lastName}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => setSelectedPrescription(p)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 shadow-sm"
                                >
                                    Dispense
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderInventory = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="text-sm text-gray-500">Current Stock Levels</div>
                <button 
                    onClick={() => setShowPOForm(true)}
                    className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-100 border border-green-200"
                >
                    <Truck className="w-4 h-4" /> Receive Stock
                </button>
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
                    {inventory.map((item) => (
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Pill className="w-8 h-8 text-blue-600" /> Pharmacy Management
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
                    className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'QUEUE' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" /> Prescription Queue
                        {queue.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{queue.length}</span>}
                    </div>
                    {activeTab === 'QUEUE' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('INVENTORY')}
                    className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'INVENTORY' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" /> Inventory & Stock
                    </div>
                    {activeTab === 'INVENTORY' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
                </button>
            </div>

            {/* Content */}
            {activeTab === 'QUEUE' ? renderQueue() : renderInventory()}

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
        </div>
    );
};

export default PharmacyDashboard;
