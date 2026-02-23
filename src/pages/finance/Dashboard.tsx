import { useState, useEffect } from 'react';
import { FinanceService } from '../../services/finance.service';
import { DollarSign, CreditCard, Clock, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import ServiceManagement from './ServiceManagement';
import ExpenseTracking from './ExpenseTracking';


const FinanceDashboard = () => {
    const [activeTab, setActiveTab] = useState('INVOICES');
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingAmount: 0,
        totalExpenses: 0,
        netProfit: 0
    });
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState('CASH');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const pendingInvoices = await FinanceService.getPendingInvoices();
            setInvoices(pendingInvoices);

            // Fetch Profit/Loss for stats
            const profitLoss = await FinanceService.getProfitLoss();
            
            setStats({
                totalRevenue: profitLoss.revenue,
                totalExpenses: profitLoss.expenses,
                netProfit: profitLoss.netProfit,
                pendingAmount: pendingInvoices.reduce((acc: number, inv: any) => acc + inv.balance, 0)
            });

        } catch (error) {
            toast.error("Failed to load finance data");
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPayment = (invoice: any) => {
        setSelectedInvoice(invoice);
        setPaymentModalOpen(true);
    };

    const confirmPayment = async () => {
        if (!selectedInvoice) return;
        try {
            await FinanceService.processPayment({
                invoiceId: selectedInvoice.id,
                amount: selectedInvoice.balance,
                method: paymentMethod
            });
            toast.success("Payment successful");
            setPaymentModalOpen(false);
            loadDashboardData();
        } catch (error) {
            toast.error("Payment failed");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
                    <p className="text-gray-500">Manage invoices, payments, and expenses</p>
                </div>
            </div>

            {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg text-green-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                            <p className="text-2xl font-bold text-gray-900">${stats.totalExpenses.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg text-red-600">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Net Profit</p>
                            <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${stats.netProfit.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pending Invoices</p>
                            <p className="text-2xl font-bold text-orange-600">${stats.pendingAmount.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-4 pt-4">
                    <button
                        onClick={() => setActiveTab('INVOICES')}
                        className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                            activeTab === 'INVOICES' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Invoices
                        {activeTab === 'INVOICES' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('SERVICES')}
                        className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                            activeTab === 'SERVICES' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Services & Pricing
                        {activeTab === 'SERVICES' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('EXPENSES')}
                        className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                            activeTab === 'EXPENSES' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Expenses
                        {activeTab === 'EXPENSES' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                        )}
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-100 p-6">
                    {activeTab === 'INVOICES' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-gray-800">Pending Invoices</h2>
                                <button onClick={loadDashboardData} className="text-sm text-blue-600 hover:underline">
                                    Refresh
                                </button>
                            </div>

                            {loading ? (
                                <div className="text-center py-12 text-gray-500">Loading invoices...</div>
                            ) : invoices.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No pending invoices found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                                            <tr>
                                                <th className="px-6 py-3">Invoice #</th>
                                                <th className="px-6 py-3">Patient</th>
                                                <th className="px-6 py-3">Date</th>
                                                <th className="px-6 py-3">Amount</th>
                                                <th className="px-6 py-3">Balance</th>
                                                <th className="px-6 py-3">Status</th>
                                                <th className="px-6 py-3">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {invoices.map((inv) => (
                                                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium">{inv.invoiceNumber}</td>
                                                    <td className="px-6 py-4">
                                                        {inv.patient.firstName} {inv.patient.lastName}
                                                        <div className="text-xs text-gray-400">{inv.patient.patientNumber}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500">
                                                        {format(new Date(inv.createdAt), 'MMM dd, yyyy')}
                                                    </td>
                                                    <td className="px-6 py-4">${inv.total.toLocaleString()}</td>
                                                    <td className="px-6 py-4 font-bold text-orange-600">${inv.balance.toLocaleString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">
                                                            {inv.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => handleProcessPayment(inv)}
                                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                                                        >
                                                            <CreditCard className="w-4 h-4" /> Process
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'SERVICES' && <ServiceManagement />}
                    {activeTab === 'EXPENSES' && <ExpenseTracking />}
                </div>


            {/* Payment Modal */}
            {paymentModalOpen && selectedInvoice && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">Process Payment</h2>
                        
                        <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Invoice</span>
                                <span className="font-medium">{selectedInvoice.invoiceNumber}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Patient</span>
                                <span className="font-medium">{selectedInvoice.patient.firstName} {selectedInvoice.patient.lastName}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg">
                                <span>Total Due</span>
                                <span className="text-blue-600">${selectedInvoice.balance.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                <select 
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="CARD">Card</option>
                                    <option value="MOBILE_MONEY">Mobile Money</option>
                                    <option value="INSURANCE">Insurance</option>
                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                </select>
                            </div>
                            
                            <button 
                                onClick={confirmPayment}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex justify-center items-center gap-2"
                            >
                                <CreditCard className="w-5 h-5" />
                                Confirm Payment
                            </button>

                            <button 
                                onClick={() => setPaymentModalOpen(false)}
                                className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceDashboard;
