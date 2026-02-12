import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { PatientService } from '../../services/patient.service';
import type { Invoice } from '../../services/patient.service';

const Billing = () => {
    const { token } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentProcessing, setPaymentProcessing] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchInvoices = async () => {
        try {
            setError(null);
            const data = await PatientService.getInvoices();
            setInvoices(data);
        } catch (err: any) {
            console.error("Failed to fetch invoices", err);
            setError("Failed to load invoices. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchInvoices();
    }, [token]);

    const handlePay = async (invoiceId: string, amount: number) => {
        if (!confirm(`Are you sure you want to pay ₦${amount.toLocaleString()}?`)) return;

        setPaymentProcessing(invoiceId);
        try {
            await PatientService.processPayment({ invoiceId, amount, method: 'CARD' });
            
            // Refetch invoices to update status
            await fetchInvoices();
            alert('Payment Successful!');
        } catch (error: any) {
            console.error('Payment Error', error);
            alert('Payment Failed: ' + (error.response?.data?.message || 'Unknown error'));
        } finally {
            setPaymentProcessing(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-700 border-green-200';
            case 'PARTIAL': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'ISSUED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'OVERDUE': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
    );

    const outstandingTotal = invoices
        .filter(i => i.status !== 'PAID' && i.status !== 'VOID' && i.status !== 'REFUNDED')
        .reduce((acc, curr) => acc + (curr.balance || curr.total), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-purple-50 p-6 rounded-2xl border border-purple-100 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-purple-900">Billing & Payments</h1>
                    <p className="text-purple-700 mt-1">Manage your health payments and view invoice history.</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm md:text-right w-full md:w-auto border border-purple-100">
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Total Outstanding</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                        ₦ {outstandingTotal.toLocaleString()}
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2 border border-red-200">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Invoices ({invoices.length})</h3>
                    <button onClick={() => { setLoading(true); fetchInvoices(); }} className="text-gray-400 hover:text-purple-600 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice #</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Service</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Balance</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoices.length > 0 ? (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="py-4 px-6 text-sm font-medium text-gray-900 font-mono">
                                            {invoice.invoiceNumber}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500">
                                            {new Date(invoice.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600">
                                            {invoice.medicalRecord 
                                                ? `Visit - Dr. ${invoice.medicalRecord.doctor?.lastName || 'General'}` 
                                                : 'General Service'}
                                        </td>
                                        <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                            ₦ {invoice.total.toLocaleString()}
                                        </td>
                                         <td className="py-4 px-6 text-sm font-medium text-gray-500">
                                            ₦ {(invoice.balance ?? invoice.total).toLocaleString()}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(invoice.status)}`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right space-x-2">
                                            {invoice.status !== 'PAID' && invoice.status !== 'VOID' && invoice.status !== 'REFUNDED' && (
                                                <button
                                                    onClick={() => handlePay(invoice.id, invoice.balance ?? invoice.total)}
                                                    disabled={paymentProcessing === invoice.id}
                                                    className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-all shadow-sm active:scale-95"
                                                >
                                                    {paymentProcessing === invoice.id ? (
                                                        <Clock className="w-3 h-3 mr-1.5 animate-spin" />
                                                    ) : (
                                                        <CreditCard className="w-3 h-3 mr-1.5" />
                                                    )}
                                                    Pay
                                                </button>
                                            )}
                                            {invoice.status === 'PAID' && (
                                                <span className="inline-flex items-center text-green-600 text-xs font-medium px-3 py-1.5">
                                                    <CheckCircle className="w-4 h-4 mr-1" /> Paid
                                                </span>
                                            )}
                                            {/* Could add a 'View' details button here later */}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-500">
                                        <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-2">
                                            <CreditCard className="w-6 h-6" />
                                        </div>
                                        No invoices found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Billing;
