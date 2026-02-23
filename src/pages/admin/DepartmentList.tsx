import { useState, useEffect } from 'react';
import { Plus, Building2, Pencil, Trash2 } from 'lucide-react';
import { DepartmentService } from '../../services/department.service';
import type { Department } from '../../services/department.service';

const DepartmentList = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });

    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        try {
            const data = await DepartmentService.getAll();
            setDepartments(data);
        } catch (error) {
            console.error("Failed to load departments");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await DepartmentService.update(editingId, formData);
            } else {
                await DepartmentService.create(formData);
            }
            setShowModal(false);
            setFormData({ name: '', description: '' });
            setEditingId(null);
            loadDepartments();
        } catch (error) {
            console.error("Failed to save department");
        }
    };

    const handleEdit = (dept: Department) => {
        setFormData({ name: dept.name, description: dept.description || '' });
        setEditingId(dept.id);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;
        try {
            await DepartmentService.delete(id);
            loadDepartments();
        } catch (error) {
            console.error("Failed to delete department");
        }
    };

    const openCreateModal = () => {
        setFormData({ name: '', description: '' });
        setEditingId(null);
        setShowModal(true);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-blue-600" /> Departments
                </h1>
                <button
                    onClick={openCreateModal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4" /> Add Department
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p>Loading...</p>
                ) : departments.map((dept) => (
                    <div key={dept.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleEdit(dept)}
                                    className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(dept.id)}
                                    className="p-2 hover:bg-red-50 rounded-full text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{dept.name}</h3>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{dept.description || "No description provided."}</p>
                        
                        <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
                            <div className="text-gray-500">
                                Head: <span className="font-medium text-gray-900">
                                    {dept.headOfDept ? `${dept.headOfDept.user.firstName} ${dept.headOfDept.user.lastName}` : 'Unassigned'}
                                </span>
                            </div>
                            <div className="text-gray-500">
                                Staff: <span className="font-medium text-gray-900">{dept._count?.staff || 0}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Department' : 'Add Department'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingId ? 'Save Changes' : 'Create Department'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentList;
