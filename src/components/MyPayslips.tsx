import { useState, useEffect } from 'react';
import { Download, Calendar } from 'lucide-react';
import { HRService } from '../services/hr.service';

const MyPayslips = () => {
    const [payrolls, setPayrolls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await HRService.getMyPayrolls();
            setPayrolls(data);
        } catch (error) {
            console.error("Failed to load payslips");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800">My Payslips</h3>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-3 text-left">Period</th>
                            <th className="px-6 py-3 text-right">Net Salary</th>
                            <th className="px-6 py-3 text-left">Status</th>
                            <th className="px-6 py-3 text-right">Date Paid</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                             <tr><td colSpan={5} className="p-6 text-center">Loading...</td></tr>
                        ) : payrolls.length === 0 ? (
                            <tr><td colSpan={5} className="p-6 text-center text-gray-500">No payslips found</td></tr>
                        ) : payrolls.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    {p.month} {p.year}
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
                                <td className="px-6 py-4 text-right text-sm text-gray-600">
                                    {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 ml-auto">
                                        <Download className="w-4 h-4" /> PDF
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyPayslips;
