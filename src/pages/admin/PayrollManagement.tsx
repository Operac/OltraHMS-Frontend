import { useState, useEffect } from 'react';
import { CheckCircle, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminService } from '../../services/admin.service';

const PayrollManagement = () => {
    const [payrolls, setPayrolls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
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
    }, [selectedMonth, selectedYear]);

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
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
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
                                    ${p.baseSalary?.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right text-xs text-gray-500">
                                    <div className="text-green-600">+${p.bonuses}</div>
                                    <div className="text-red-500">-${p.deductions} (Ded)</div>
                                    <div className="text-red-500">-${p.tax} (Tax)</div>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-gray-900 font-mono">
                                    ${p.netSalary?.toLocaleString()}
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
                                        <button 
                                            onClick={() => handleMarkPaid(p.id)}
                                            className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs flex items-center gap-1 ml-auto"
                                        >
                                            <CheckCircle className="w-3 h-3" /> Mark Paid
                                        </button>
                                    )}
                                    {p.status === 'PAID' && <span className="text-xs text-gray-400">Paid on {new Date(p.paymentDate).toLocaleDateString()}</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PayrollManagement;
