import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { PharmacyService } from '../../services/pharmacy.service';

interface AddMedicationModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const AddMedicationModal = ({ onClose, onSuccess }: AddMedicationModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        genericName: '',
        category: '',
        dosageForm: 'TABLET',
        strength: '',
        manufacturer: '',
        price: '',
        reorderLevel: 10,
        isControlledSubstance: false
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await PharmacyService.createMedication(formData);
            onSuccess();
        } catch (error) {
            console.error(error);
            alert("Failed to create medication");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-800">Add New Medication</h2>
                    <button onClick={onClose}><X className="w-6 h-6 text-gray-400 hover:text-gray-600" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input 
                                type="text"
                                required
                                className="w-full p-2 border rounded-lg"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name</label>
                            <input 
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                value={formData.genericName}
                                onChange={e => setFormData({...formData, genericName: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <input 
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                placeholder="Antibiotic, Analgesic..."
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dosage Form</label>
                            <select 
                                className="w-full p-2 border rounded-lg"
                                value={formData.dosageForm}
                                onChange={e => setFormData({...formData, dosageForm: e.target.value})}
                            >
                                <option value="TABLET">Tablet</option>
                                <option value="CAPSULE">Capsule</option>
                                <option value="SYRUP">Syrup</option>
                                <option value="INJECTION">Injection</option>
                                <option value="TOPICAL">Topical</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Strength</label>
                            <input 
                                type="text"
                                placeholder="500mg, 10ml..."
                                className="w-full p-2 border rounded-lg"
                                value={formData.strength}
                                onChange={e => setFormData({...formData, strength: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                            <input 
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                value={formData.manufacturer}
                                onChange={e => setFormData({...formData, manufacturer: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                            <input 
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                className="w-full p-2 border rounded-lg"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                            <input 
                                type="number"
                                required
                                min="0"
                                className="w-full p-2 border rounded-lg"
                                value={formData.reorderLevel}
                                onChange={e => setFormData({...formData, reorderLevel: parseInt(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox"
                            id="controlled"
                            className="w-4 h-4 text-blue-600 rounded"
                            checked={formData.isControlledSubstance}
                            onChange={e => setFormData({...formData, isControlledSubstance: e.target.checked})}
                        />
                        <label htmlFor="controlled" className="text-sm text-gray-700 font-medium">Is Controlled Substance?</label>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        {loading ? 'Creating...' : 'Create Medication'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddMedicationModal;
