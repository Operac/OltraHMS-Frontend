import { useState, useEffect } from 'react';
import { FinanceService } from '../../services/finance.service';
import toast from 'react-hot-toast';
import { Plus, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

const ExpenseTracking = () => {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: 'SUPPLIES',
        incurredAt: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            const data = await FinanceService.getExpenses();
            setExpenses(data);
        } catch (error) {
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await FinanceService.addExpense(formData);
            toast.success('Expense recorded');
            setIsModalOpen(false);
            setFormData({
                description: '',
                amount: '',
                category: 'SUPPLIES',
                incurredAt: new Date().toISOString().split('T')[0]
            });
            loadExpenses();
        } catch (error) {
            toast.error('Failed to record expense');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Expense Tracking</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
                >
                    <Plus size={20} /> Record Expense
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Recorded By</th>
                            <th className="p-4 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading expenses...</td></tr>
                        ) : expenses.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">No expenses recorded</td></tr>
                        ) : (
                            expenses.map(expense => (
                                <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-600">
                                        {format(new Date(expense.incurredAt), 'MMM dd, yyyy')}
                                    </td>
                                    <td className="p-4 font-medium text-gray-900">{expense.description}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500 text-sm">
                                        {expense.recordedBy?.name || 'Unknown'}
                                    </td>
                                    <td className="p-4 text-right font-mono font-medium text-red-600">
                                        -₦{expense.amount.toLocaleString()}
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
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Record New Expense</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input 
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    placeholder="e.g., Office Supplies"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                        <input 
                                            type="number"
                                            required
                                            className="w-full pl-9 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.amount}
                                            onChange={e => setFormData({...formData, amount: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input 
                                        type="date"
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.incurredAt}
                                        onChange={e => setFormData({...formData, incurredAt: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select 
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.category}
                                    onChange={e => setFormData({...formData, category: e.target.value})}
                                >
                                    <option value="SUPPLIES">Supplies</option>
                                    <option value="MAINTENANCE">Maintenance</option>
                                    <option value="SALARY">Salary</option>
                                    <option value="UTILITIES">Utilities</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 shadow-sm">
                                    Save Expense
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseTracking;
