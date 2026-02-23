import React, { useState, useEffect } from 'react';
import { AdminService } from '../../services/admin.service';
const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">{children}</div>
);

const Button = ({ children, variant = 'primary', className = '', ...props }: any) => {
    const baseClass = "px-4 py-2 rounded-lg font-medium transition-colors";
    const variantClass = variant === 'outline' 
        ? "border border-gray-300 text-gray-700 hover:bg-gray-50" 
        : "bg-blue-600 text-white hover:bg-blue-700";
    return <button className={`${baseClass} ${variantClass} ${className}`} {...props}>{children}</button>;
};

const Input = ({ className = '', ...props }: any) => (
    <input className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${className}`} {...props} />
);

const LeaveSettings = () => {
    const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
    const [newType, setNewType] = useState({ name: '', defaultDays: 14, isPaid: true });

    const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
    const [staffBalances, setStaffBalances] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [typesData, staffData] = await Promise.all([
                AdminService.getLeaveTypes(),
                AdminService.getAllStaff()
            ]);
            setLeaveTypes(typesData);
            setStaffList(staffData);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load settings data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateType = async () => {
        if (!newType.name) return;
        try {
            await AdminService.createLeaveType(newType);
            setIsAddTypeModalOpen(false);
            setNewType({ name: '', defaultDays: 14, isPaid: true });
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create leave type');
        }
    };

    const handleDeleteType = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this leave type?')) return;
        try {
            await AdminService.deleteLeaveType(id);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Cannot delete leave type. It may be in use.');
        }
    };

    const handleSelectStaff = async (staff: any) => {
        setSelectedStaff(staff);
        try {
            const balances = await AdminService.getStaffBalances(staff.id);
            setStaffBalances(balances);
        } catch (err: any) {
             setError(err.response?.data?.message || 'Failed to load staff balances');
        }
    };

    const handleUpdateBalance = async (leaveTypeId: string, currentDays: number) => {
        const newDays = prompt("Enter new allocated days:", String(currentDays));
        if (newDays && !isNaN(Number(newDays))) {
            try {
                await AdminService.updateStaffBalance(selectedStaff.id, leaveTypeId, Number(newDays));
                // Refresh balances
                const balances = await AdminService.getStaffBalances(selectedStaff.id);
                setStaffBalances(balances);
            } catch (err: any) {
                 setError(err.response?.data?.message || 'Failed to update balance');
            }
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold font-heading text-neutral-800">Leave Settings</h1>
            
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center justify-between">
                    {error}
                    <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">×</button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Global Leave Types */}
                <Card>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold font-heading text-neutral-800">Global Leave Types</h2>
                            <Button onClick={() => setIsAddTypeModalOpen(true)}>Add Type</Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default Days</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {leaveTypes.map((type) => (
                                        <tr key={type.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{type.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{type.defaultDays}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${type.isPaid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {type.isPaid ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleDeleteType(type.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card>

                {/* Staff Balances Configuration */}
                <Card>
                    <div className="p-6">
                        <h2 className="text-xl font-bold font-heading text-neutral-800 mb-4">Staff Balances</h2>
                        {!selectedStaff ? (
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Select Staff Member</h3>
                                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                                    <ul className="divide-y divide-gray-200">
                                        {staffList.map(staff => (
                                            <li 
                                                key={staff.id} 
                                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                                                onClick={() => handleSelectStaff(staff)}
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{staff.user.firstName} {staff.user.lastName}</p>
                                                    <p className="text-xs text-gray-500">{staff.department?.name || 'No Dept'} - {staff.role}</p>
                                                </div>
                                                <span className="text-accent-blue text-sm">Select &rarr;</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">{selectedStaff.user.firstName} {selectedStaff.user.lastName}</h3>
                                        <p className="text-sm text-gray-500">{selectedStaff.role} - {selectedStaff.staffNumber}</p>
                                    </div>
                                    <Button variant="outline" onClick={() => setSelectedStaff(null)}>Change Staff</Button>
                                </div>
                                <div className="space-y-4">
                                    {staffBalances.map(balance => (
                                        <div key={balance.leaveTypeId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div>
                                                <p className="font-medium text-gray-800">{balance.leaveTypeName} <span className="text-xs text-gray-500 ml-2">({balance.isPaid ? 'Paid' : 'Unpaid'})</span></p>
                                                <p className="text-sm text-gray-600">Used: {balance.usedDays} / {balance.allocatedDays} days</p>
                                            </div>
                                            <Button variant="outline" onClick={() => handleUpdateBalance(balance.leaveTypeId, balance.allocatedDays)}>Edit Total</Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Add Leave Type Modal */}
            {isAddTypeModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold font-heading mb-4 text-neutral-800">Add Leave Type</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name (e.g., Annual, Sick)</label>
                                <Input 
                                    value={newType.name} 
                                    onChange={(e: any) => setNewType({...newType, name: e.target.value})}
                                    placeholder="Leave Type Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Default Days Per Year</label>
                                <Input 
                                    type="number"
                                    value={newType.defaultDays} 
                                    onChange={(e: any) => setNewType({...newType, defaultDays: Number(e.target.value)})}
                                />
                            </div>
                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    id="isPaid"
                                    checked={newType.isPaid}
                                    onChange={(e: any) => setNewType({...newType, isPaid: e.target.checked})}
                                    className="h-4 w-4 text-accent-blue focus:ring-accent-blue border-gray-300 rounded"
                                />
                                <label htmlFor="isPaid" className="ml-2 block text-sm text-gray-900">
                                    Is Paid Leave?
                                </label>
                            </div>
                            <div className="flex gap-4 pt-4 mt-6 border-t border-gray-200">
                                <Button className="flex-1" onClick={handleCreateType}>Save Type</Button>
                                <Button className="flex-1" variant="outline" onClick={() => setIsAddTypeModalOpen(false)}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveSettings;
