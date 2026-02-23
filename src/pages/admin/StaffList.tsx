import { useState, useEffect } from 'react';
import { Plus, UserX, UserCheck, Shield, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminService } from '../../services/admin.service';

const StaffList = () => {
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '', role: 'DOCTOR', departmentId: '', specialization: ''
    });

    // HR Form State
    const [showHRModal, setShowHRModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [hrFormData, setHrFormData] = useState({
        baseSalary: '',
        leaveBalance: '20',
        bankName: '',
        accountNumber: '',
        accountName: ''
    });

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            const data = await AdminService.getAllStaff();
            setStaff(data);
        } catch (error) {
            console.error("Failed to load staff");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await toast.promise(
                AdminService.createStaff(formData),
                {
                    loading: 'Creating staff member...',
                    success: 'Staff member created successfully!',
                    error: 'Failed to create staff'
                }
            );
            setShowModal(false);
            loadStaff();
            setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'DOCTOR', departmentId: '', specialization: '' });
        } catch (error) {
            console.error(error);
        }
    };

    const toggleStatus = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        if (!confirm(`Mark user as ${newStatus}?`)) return;
        
        try {
            await AdminService.updateStaffStatus(userId, newStatus);
            toast.success(`User status updated to ${newStatus}`);
            loadStaff();
        } catch (error) {
            console.error(error);
        }
    };

    const openHRModal = (s: any) => {
        setSelectedStaff(s);
        setHrFormData({
            baseSalary: s.staff?.baseSalary || '',
            leaveBalance: s.staff?.leaveBalance?.toString() || '20',
            bankName: s.staff?.bankDetails?.bankName || '',
            accountNumber: s.staff?.bankDetails?.accountNumber || '',
            accountName: s.staff?.bankDetails?.accountName || ''
        });
        setShowHRModal(true);
    };

    const handleSaveHR = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStaff?.staff?.id) {
            toast.error("Staff profile not found");
            return;
        }

        try {
            await toast.promise(
                AdminService.updateStaffHRDetails(selectedStaff.staff.id, {
                    baseSalary: hrFormData.baseSalary,
                    leaveBalance: hrFormData.leaveBalance,
                    bankDetails: {
                        bankName: hrFormData.bankName,
                        accountNumber: hrFormData.accountNumber,
                        accountName: hrFormData.accountName
                    }
                }),
                {
                    loading: 'Updating HR details...',
                    success: 'HR details updated!',
                    error: 'Failed to update'
                }
            );
            setShowHRModal(false);
            loadStaff();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus className="w-5 h-5" /> Add Staff
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-3 text-left">Name</th>
                            <th className="px-6 py-3 text-left">Role</th>
                            <th className="px-6 py-3 text-left">Department</th>
                            <th className="px-6 py-3 text-left">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                             <tr><td colSpan={5} className="p-6 text-center">Loading...</td></tr>
                        ) : staff.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{s.firstName} {s.lastName}</div>
                                    <div className="text-xs text-gray-500">{s.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        <Shield className="w-3 h-3 mr-1" /> {s.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {s.staff?.department?.name || 'N/A'}
                                    {s.staff?.specialization && <div className="text-xs text-gray-400">{s.staff.specialization}</div>}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        s.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {s.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => toggleStatus(s.id, s.status)}
                                        className="text-gray-400 hover:text-gray-600" title="Toggle Status"
                                    >
                                        {s.status === 'ACTIVE' ? <UserX className="w-5 h-5 text-red-400" /> : <UserCheck className="w-5 h-5 text-green-400" />}
                                    </button>
                                    <button
                                        onClick={() => openHRModal(s)}
                                        className="text-gray-400 hover:text-blue-600 ml-2" title="Edit HR Details"
                                    >
                                        <Banknote className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                        <h2 className="text-lg font-bold mb-4">Add New Staff Member</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="First Name" required className="p-2 border rounded" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                                <input placeholder="Last Name" required className="p-2 border rounded" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                            </div>
                            <input placeholder="Email" type="email" required className="w-full p-2 border rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            <input placeholder="Password" type="password" required className="w-full p-2 border rounded" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <select className="p-2 border rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                    <option value="DOCTOR">Doctor</option>
                                    <option value="NURSE">Nurse</option>
                                    <option value="RECEPTIONIST">Receptionist</option>
                                    <option value="PHARMACIST">Pharmacist</option>
                                    <option value="LAB_TECH">Lab Tech</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                                <input placeholder="Specialization (Optional)" className="p-2 border rounded" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} />
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create Staff</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* HR Modal */}
            {showHRModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                        <h2 className="text-lg font-bold mb-4">Edit HR Details - {selectedStaff?.firstName} {selectedStaff?.lastName}</h2>
                        <form onSubmit={handleSaveHR} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Base Salary</label>
                                    <input type="number" className="w-full p-2 border rounded" value={hrFormData.baseSalary} onChange={e => setHrFormData({...hrFormData, baseSalary: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Annual Leave Balance</label>
                                    <input type="number" className="w-full p-2 border rounded" value={hrFormData.leaveBalance} onChange={e => setHrFormData({...hrFormData, leaveBalance: e.target.value})} />
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="text-sm font-semibold mb-2">Bank Details</h3>
                                <div className="space-y-2">
                                    <input placeholder="Bank Name" className="w-full p-2 border rounded" value={hrFormData.bankName} onChange={e => setHrFormData({...hrFormData, bankName: e.target.value})} />
                                    <input placeholder="Account Number" className="w-full p-2 border rounded" value={hrFormData.accountNumber} onChange={e => setHrFormData({...hrFormData, accountNumber: e.target.value})} />
                                    <input placeholder="Account Name" className="w-full p-2 border rounded" value={hrFormData.accountName} onChange={e => setHrFormData({...hrFormData, accountName: e.target.value})} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setShowHRModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffList;
