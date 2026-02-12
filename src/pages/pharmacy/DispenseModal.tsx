import { useState } from 'react';
import { X, AlertTriangle, Check, Package } from 'lucide-react';
import { PharmacyService, type DispenseItem } from '../../services/pharmacy.service';

interface DispenseModalProps {
    prescription: any;
    inventory: any[]; // List of Meds with batches
    onClose: () => void;
    onSuccess: () => void;
}

const DispenseModal = ({ prescription, inventory, onClose, onSuccess }: DispenseModalProps) => {
    const [selectedBatches, setSelectedBatches] = useState<DispenseItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Find the prescribed med in inventory
    // Note: In real app, we match by specific ID. 
    // Assuming prescription.medicationName matches or we have ID.
    // For now, let's filter inventory by name match since schema uses name in Prescription.
    const relevantStock = inventory.find(m => m.name === prescription.medicationName);

    const updateBatchQty = (batchId: string, qty: number, medicationId: string) => {
        if (qty < 0) return;
        
        const existing = selectedBatches.find(b => b.batchId === batchId);
        if (existing) {
            if (qty === 0) {
                setSelectedBatches(selectedBatches.filter(b => b.batchId !== batchId));
            } else {
                setSelectedBatches(selectedBatches.map(b => b.batchId === batchId ? { ...b, quantity: qty } : b));
            }
        } else if (qty > 0) {
            setSelectedBatches([...selectedBatches, { batchId, quantity: qty, medicationId }]);
        }
    };

    const totalSelected = selectedBatches.reduce((sum, b) => sum + b.quantity, 0);
    const required = prescription.quantity;
    const isComplete = totalSelected >= required;

    const handleDispense = async () => {
        try {
            if (!isComplete && !confirm(`You have selected ${totalSelected} / ${required}. Dispense partially?`)) return;
            
            setLoading(true);
            await PharmacyService.dispense(prescription.id, selectedBatches);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Dispensing failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Dispense Medication</h2>
                    <button onClick={onClose}><X className="w-6 h-6 text-gray-400 hover:text-gray-600" /></button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Prescription Details */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex justify-between mb-2">
                             <span className="text-sm text-blue-600 font-semibold">PRESCRIPTION</span>
                             <span className="text-sm text-blue-600 font-bold">Qty: {prescription.quantity}</span>
                        </div>
                        <div className="font-medium text-lg text-blue-900">{prescription.medicationName}</div>
                        <div className="text-sm text-blue-700">{prescription.dosage} - {prescription.frequency}</div>
                        <div className="text-xs text-blue-500 mt-1">Patient: {prescription.patient.firstName} {prescription.patient.lastName}</div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 text-sm">
                            <AlertTriangle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    {/* Batch Selection */}
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4" /> Available Batches
                        </h3>
                        
                        {!relevantStock ? (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                Medication not found in inventory system.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {relevantStock.batches.map((batch: any) => (
                                    <div key={batch.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                        <div>
                                            <div className="font-medium text-gray-800">Batch #{batch.batchNumber}</div>
                                            <div className="text-xs text-gray-500">Exp: {new Date(batch.expiryDate).toLocaleDateString()}</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-sm text-gray-600">
                                                Available: <span className="font-bold">{batch.quantity}</span>
                                            </div>
                                            <input 
                                                type="number" 
                                                min="0"
                                                max={batch.quantity}
                                                className="w-20 p-1 border rounded text-right"
                                                placeholder="0"
                                                onChange={(e) => updateBatchQty(batch.id, parseInt(e.target.value) || 0, relevantStock.id)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div className="text-sm">
                            Selected: <span className={`font-bold ${totalSelected < required ? 'text-orange-600' : 'text-green-600'}`}>
                                {totalSelected}
                            </span> / {required}
                        </div>
                        <button 
                            onClick={handleDispense}
                            disabled={loading || totalSelected === 0}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    <Check className="w-4 h-4" /> Confirm Dispense
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DispenseModal;
