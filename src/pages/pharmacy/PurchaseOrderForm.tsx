import { useState } from 'react';
import { X } from 'lucide-react';
import { PharmacyService } from '../../services/pharmacy.service';

interface PurchaseOrderFormProps {
    onClose: () => void;
    onSuccess: () => void;
    availableMeds: any[]; // List of defined medications (names/ids)
}

const PurchaseOrderForm = ({ onClose, onSuccess, availableMeds }: PurchaseOrderFormProps) => {
    const [formData, setFormData] = useState({
        medicationId: '',
        batchNumber: '',
        expiryDate: '',
        quantity: 0,
        costPrice: 0,
        supplier: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await PharmacyService.receiveStock(formData);
            onSuccess();
        } catch (error) {
            console.error(error);
            alert("Failed to receive stock");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
             <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Receive New Stock</h2>
                    <button onClick={onClose}><X className="w-6 h-6 text-gray-400 hover:text-gray-600" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Medication</label>
                        <select 
                            required
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={formData.medicationId}
                            onChange={e => setFormData({...formData, medicationId: e.target.value})}
                        >
                            <option value="">Select Medication</option>
                            {availableMeds.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                            <input 
                                type="text"
                                required
                                className="w-full p-2 border rounded-lg"
                                value={formData.batchNumber}
                                onChange={e => setFormData({...formData, batchNumber: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                            <input 
                                type="date"
                                required
                                className="w-full p-2 border rounded-lg"
                                value={formData.expiryDate}
                                onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input 
                                type="number"
                                required
                                min="1"
                                className="w-full p-2 border rounded-lg"
                                value={formData.quantity}
                                onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (Unit)</label>
                            <input 
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                className="w-full p-2 border rounded-lg"
                                value={formData.costPrice}
                                onChange={e => setFormData({...formData, costPrice: parseFloat(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                        <input 
                            type="text"
                            required
                            className="w-full p-2 border rounded-lg"
                            value={formData.supplier}
                            onChange={e => setFormData({...formData, supplier: e.target.value})}
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Confirm Receipt'}
                    </button>
                </form>
             </div>
        </div>
    );
};

export default PurchaseOrderForm;
