import { useState, useEffect } from 'react';
import { CheckCircle, Calculator, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminService } from '../../services/admin.service';
import { SettingsService, getCurrencySymbol } from '../../services/settings.service';

const PayrollManagement = () => {
    const [payrolls, setPayrolls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState<any>(null);
    const [editForm, setEditForm] = useState({ bonuses: '', deductions: '', tax: '' });
    const [currencySymbol, setCurrencySymbol] = useState('₦');
    
    // Filter/Generate State
    const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const years = [2024, 2025, 2026];

    useEffect(() => {
        loadPayrolls();
        loadCurrencySettings();
    }, [selectedMonth, selectedYear]);

    const loadCurrencySettings = async () => {
        try {
            const settings = await SettingsService.getHospitalSettings();
            setCurrencySymbol(settings.currencySymbol || getCurrencySymbol(settings.currencyCode) || '₦');
        } catch (error) {
            console.error("Failed to load currency settings");
        }
    };

    const loadPayrolls = async () => {
        setLoading(true);
        try {
            const data = await AdminService.getPayrolls(selectedMonth, selectedYear);
            // Filter out any accidental duplicates from the database
            const uniquePayrolls = Object.values(
                data.reduce((acc: any, curr: any) => {
                    if (!acc[curr.staffId]) acc[curr.staffId] = curr;
                    return acc;
                }, {})
            );
            setPayrolls(uniquePayrolls);
        } catch (error) {
            console.error("Failed to load payrolls");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!confirm(`Generate payroll for ${selectedMonth} ${selectedYear}?`)) return;

        try {
            const result = await AdminService.generatePayroll(selectedMonth, selectedYear);
            toast.success(result.message);
            loadPayrolls();
        } catch (error) {
            toast.error("Failed to generate payroll");
            console.error(error);
        }
    };

    const handleMarkPaid = async (id: string) => {
        if (!confirm("Mark this payroll as PAID?")) return;

        try {
            await AdminService.markPayrollPaid(id);
            toast.success("Marked as paid");
            loadPayrolls();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const openEditModal = (p: any) => {
        setSelectedPayroll(p);
        setEditForm({
            bonuses: p.bonuses?.toString() || '0',
            deductions: p.deductions?.toString() || '0',
            tax: p.tax?.toString() || '0'
        });
        setShowEditModal(true);
    };

    const handleUpdatePayroll = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPayroll) return;

        try {
            await AdminService.updatePayroll(selectedPayroll.id, {
                bonuses: Number(editForm.bonuses),
                deductions: Number(editForm.deductions),
                tax: Number(editForm.tax)
            });
            toast.success("Payroll updated successfully");
            setShowEditModal(false);
            loadPayrolls();
        } catch (error) {
            toast.error("Failed to update payroll");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
                <div className="flex gap-4">
                    <select 
                        className="p-2 border rounded-lg bg-white shadow-sm"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select 
                        className="p-2 border rounded-lg bg-white shadow-sm"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button 
                        onClick={handleGenerate}
                        className="bg-sky-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-sky-600"
                    >
                        <Calculator className="w-5 h-5" /> Generate Payroll
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-3 text-left">Staff</th>
                            <th className="px-6 py-3 text-right">Base Salary</th>
                            <th className="px-6 py-3 text-right">Additions/Deductions</th>
                            <th className="px-6 py-3 text-right">Net Salary</th>
                            <th className="px-6 py-3 text-left">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                             <tr><td colSpan={6} className="p-6 text-center">Loading...</td></tr>
                        ) : payrolls.length === 0 ? (
                            <tr><td colSpan={6} className="p-6 text-center text-gray-500">No payroll records for this period</td></tr>
                        ) : payrolls.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{p.staff?.user?.firstName} {p.staff?.user?.lastName}</div>
                                    <div className="text-xs text-gray-500">
                                        ID: {p.staff?.staffNumber}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-sm">
                                    {currencySymbol}{p.baseSalary?.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right text-xs text-gray-500">
                                    <div className="text-green-600">+{currencySymbol}{p.bonuses}</div>
                                    <div className="text-red-500">-{currencySymbol}{p.deductions} (Ded)</div>
                                    <div className="text-red-500">-{currencySymbol}{p.tax} (Tax)</div>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-gray-900 font-mono">
                                    {currencySymbol}{p.netSalary?.toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        p.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {p.status === 'PENDING' && (
                                        <div className="flex gap-2 justify-end">
                                            <button 
                                                onClick={() => openEditModal(p)}
                                                className="text-gray-500 hover:text-sky-500 p-1"
                                                title="Edit additions/deductions"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleMarkPaid(p.id)}
                                                className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs flex items-center gap-1"
                                            >
                                                <CheckCircle className="w-3 h-3" /> Mark Paid
                                            </button>
                                        </div>
                                    )}
                                    {p.status === 'PAID' && <span className="text-xs text-gray-400">Paid on {new Date(p.paymentDate).toLocaleDateString()}</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Payroll Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-lg font-bold mb-4">Edit Payroll - {selectedPayroll?.staff?.user?.firstName} {selectedPayroll?.staff?.user?.lastName}</h2>
                        <form onSubmit={handleUpdatePayroll} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Base Salary</label>
                                <input type="text" disabled className="w-full p-2 border rounded bg-gray-100" value={`${currencySymbol}${selectedPayroll?.baseSalary?.toLocaleString()}`} />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bonuses</label>
                                    <input type="number" className="w-full p-2 border rounded" value={editForm.bonuses} onChange={e => setEditForm({...editForm, bonuses: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deductions</label>
                                    <input type="number" className="w-full p-2 border rounded" value={editForm.deductions} onChange={e => setEditForm({...editForm, deductions: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax</label>
                                    <input type="number" className="w-full p-2 border rounded" value={editForm.tax} onChange={e => setEditForm({...editForm, tax: e.target.value})} />
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 text-right">
                                Net Salary: <span className="font-bold text-gray-900">{currencySymbol}{(Number(selectedPayroll?.baseSalary) + Number(editForm.bonuses) - Number(editForm.deductions) - Number(editForm.tax)).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayrollManagement;
