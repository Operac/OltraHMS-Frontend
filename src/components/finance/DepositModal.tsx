
import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { inpatientService as InpatientService } from '../../services/inpatient.service';
import { FinanceService } from '../../services/finance.service';

interface DepositModalProps {
    admissionId: string;
    patientName: string;
    onClose: () => void;
    onSuccess: () => void;
}

const DepositModal = ({ admissionId, patientName, onClose, onSuccess }: DepositModalProps) => {
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('CASH');
    const [loading, setLoading] = useState(false);
    const [reference, setReference] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setLoading(true);
        try {
            // 1. Create Deposit Invoice
            const invoice = await InpatientService.createDepositInvoice({
                admissionId,
                amount: Number(amount)
            });

            // 2. Process Payment immediately
            await FinanceService.processPayment({
                invoiceId: invoice.id,
                amount: Number(amount),
                method,
                reference: reference || `DEP-${Date.now()}`
            });

            toast.success("Deposit collected successfully");
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Failed to collect deposit");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Collect Deposit</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm mb-4">
                        Collecting deposit for patient: <strong>{patientName}</strong>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                            <input
                                type="number"
                                className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                        <select
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                        >
                            <option value="CASH">Cash</option>
                            <option value="CARD">Credit/Debit Card</option>
                            <option value="TRANSFER">Bank Transfer</option>
                            <option value="INSURANCE">Insurance</option>
                        </select>
                    </div>

                    {method !== 'CASH' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Reference</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Ref / Trx ID"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Collect Deposit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DepositModal;
