import { useState, useEffect } from 'react';
import { Plus, Edit2, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { surgeryService, OperatingTheater } from '../../services/surgery.service';

const Theaters = () => {
    const [theaters, setTheaters] = useState<OperatingTheater[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTheater, setEditingTheater] = useState<OperatingTheater | null>(null);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '', 
        type: 'GENERAL', 
        status: 'AVAILABLE'
    });

    useEffect(() => {
        loadTheaters();
    }, []);

    const loadTheaters = async () => {
        try {
            const data = await surgeryService.getTheaters();
            setTheaters(data);
        } catch (error) {
            console.error("Failed to load theaters", error);
            toast.error("Failed to load theaters");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (theater?: OperatingTheater) => {
        if (theater) {
            setEditingTheater(theater);
            setFormData({
                name: theater.name,
                type: theater.type,
                status: theater.status
            });
        } else {
            setEditingTheater(null);
            setFormData({ name: '', type: 'GENERAL', status: 'AVAILABLE' });
        }
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTheater) {
                await toast.promise(
                    surgeryService.updateTheater(editingTheater.id, formData),
                    {
                        loading: 'Updating theater...',
                        success: 'Theater updated successfully!',
                        error: 'Failed to update theater'
                    }
                );
            } else {
                await toast.promise(
                    surgeryService.createTheater(formData),
                    {
                        loading: 'Creating theater...',
                        success: 'Theater created successfully!',
                        error: 'Failed to create theater'
                    }
                );
            }
            setShowModal(false);
            loadTheaters();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Operating Theaters</h1>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-rose-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-rose-700"
                >
                    <Plus className="w-5 h-5" /> Add Theater
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-3 text-left">Name</th>
                            <th className="px-6 py-3 text-left">Type</th>
                            <th className="px-6 py-3 text-left">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                             <tr><td colSpan={4} className="p-6 text-center text-gray-500">Loading...</td></tr>
                        ) : theaters.length === 0 ? (
                             <tr><td colSpan={4} className="p-6 text-center text-gray-500">No Operating Theaters found</td></tr>
                        ) : theaters.map((t) => (
                            <tr key={t.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                                            <Activity className="w-5 h-5" />
                                        </div>
                                        {t.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {t.type}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        t.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 
                                        t.status === 'IN_USE' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {t.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleOpenModal(t)}
                                        className="text-gray-400 hover:text-rose-600 transition-colors"
                                        title="Edit Theater"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingTheater ? 'Edit Theater' : 'Add New Theater'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                &times;
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Theater Name</label>
                                <input 
                                    required 
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500" 
                                    placeholder="e.g. OT 1, Emergency OT"
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Theater Type</label>
                                <select 
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                    value={formData.type} 
                                    onChange={e => setFormData({...formData, type: e.target.value})}
                                >
                                    <option value="GENERAL">General</option>
                                    <option value="CARDIAC">Cardiac</option>
                                    <option value="ORTHOPEDIC">Orthopedic</option>
                                    <option value="NEUROLOGICAL">Neurological</option>
                                    <option value="EMERGENCY">Emergency</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select 
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                    value={formData.status} 
                                    onChange={e => setFormData({...formData, status: e.target.value})}
                                >
                                    <option value="AVAILABLE">Available</option>
                                    <option value="IN_USE">In Use</option>
                                    <option value="MAINTENANCE">Maintenance</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
                                >
                                    {editingTheater ? 'Save Changes' : 'Create Theater'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Theaters;
