import { useState, useEffect } from 'react';
import { FinanceService } from '../../services/finance.service';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Search, DollarSign, Building2 } from 'lucide-react';

const ServiceManagement = () => {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('ALL'); // ALL, LAB, CONSULTATION

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'LAB',
        price: '',
        code: '',
        isExternal: false
    });

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const data = await FinanceService.getServices();
            setServices(data);
        } catch (error) {
            toast.error('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingService) {
                await FinanceService.updateService(editingService.id, formData);
                toast.success('Service updated');
            } else {
                await FinanceService.createService(formData);
                toast.success('Service created');
            }
            setIsModalOpen(false);
            setEditingService(null);
            setFormData({ name: '', type: 'LAB', price: '', code: '', isExternal: false }); // Reset
            loadServices();
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const handleDelete = async (id: string) => {
        if(!window.confirm('Are you sure?')) return;
        try {
            await FinanceService.deleteService(id);
            toast.success('Service deleted');
            loadServices();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const openEdit = (service: any) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            type: service.type,
            price: service.price,
            code: service.code || '',
            isExternal: service.isExternal
        });
        setIsModalOpen(true);
    };

    const filteredServices = services.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filter === 'ALL' || s.type === filter;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Service & Price List</h1>
                <button 
                    onClick={() => { setEditingService(null); setFormData({ name: '', type: 'LAB', price: '', code: '', isExternal: false }); setIsModalOpen(true); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus size={20} /> Add Service
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        className="w-full pl-10 p-2 border rounded-lg bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-blue-100" 
                        placeholder="Search services..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    className="p-2 border rounded-lg bg-gray-50 outline-none" 
                    value={filter} 
                    onChange={e => setFilter(e.target.value)}
                >
                    <option value="ALL">All Types</option>
                    <option value="LAB">Laboratory</option>
                    <option value="CONSULTATION">Consultation</option>
                    <option value="PROCEDURE">Procedure</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="p-4">Service Name</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading services...</td></tr>
                        ) : filteredServices.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">No services found</td></tr>
                        ) : (
                            filteredServices.map(service => (
                                <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">{service.name}</div>
                                        <div className="text-xs text-gray-500">{service.code}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold 
                                            ${service.type === 'LAB' ? 'bg-teal-100 text-teal-700' : 
                                              service.type === 'CONSULTATION' ? 'bg-blue-100 text-blue-700' : 
                                              'bg-gray-100 text-gray-700'}`}>
                                            {service.type}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono font-medium text-gray-700">
                                        {service.isExternal ? '--' : `₦${service.price.toLocaleString()}`}
                                    </td>
                                    <td className="p-4">
                                        {service.isExternal ? (
                                            <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded w-fit">
                                                <Building2 size={12} /> External / Referral
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded w-fit">
                                                <Building2 size={12} /> In-House
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEdit(service)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(service.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                                <input 
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select 
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.type}
                                        onChange={e => setFormData({...formData, type: e.target.value})}
                                    >
                                        <option value="LAB">Lab Test</option>
                                        <option value="CONSULTATION">Consultation</option>
                                        <option value="PROCEDURE">Procedure</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Code (Optional)</label>
                                    <input 
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.code}
                                        onChange={e => setFormData({...formData, code: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <input 
                                    type="checkbox"
                                    id="isExternal"
                                    checked={formData.isExternal}
                                    onChange={e => setFormData({...formData, isExternal: e.target.checked})}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="isExternal" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                                    External Service (Referral Only)
                                    <span className="block text-xs text-gray-500 font-normal">If checked, no invoice will be generated.</span>
                                </label>
                            </div>

                            {!formData.isExternal && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                        <input 
                                            type="number"
                                            required
                                            className="w-full pl-9 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.price}
                                            onChange={e => setFormData({...formData, price: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm">
                                    {editingService ? 'Save Changes' : 'Create Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceManagement;
