import { useState, useEffect } from 'react';
import { BarChart, DollarSign, Users, Package, TrendingUp } from 'lucide-react';
import { ReportService } from '../../services/report.service';

const ReportsDashboard = () => {
    const [finance, setFinance] = useState<any>(null);
    const [patients, setPatients] = useState<any>(null);
    const [inventory, setInventory] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            const [finData, patData, invData] = await Promise.all([
                ReportService.getFinancialStats(),
                ReportService.getPatientStats(),
                ReportService.getInventoryStats()
            ]);
            setFinance(finData);
            setPatients(patData);
            setInventory(invData);
        } catch (error) {
            console.error("Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-8">Loading reports...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart className="w-6 h-6 text-teal-600" /> System Reports
            </h1>

            {/* Financial Overview */}
            <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" /> Financial Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Total Revenue (Paid)</p>
                        <h3 className="text-3xl font-bold text-green-600">
                             ${finance?.totalRevenue.toLocaleString() || '0.00'}
                        </h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Pending Revenue (Issued)</p>
                        <h3 className="text-3xl font-bold text-orange-500">
                             ${finance?.pendingRevenue.toLocaleString() || '0.00'}
                        </h3>
                    </div>
                </div>
            </section>

             {/* Patient Stats */}
             <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5" /> Patient Demographics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Total Patients</p>
                        <h3 className="text-2xl font-bold text-blue-600">{patients?.totalPatients}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">New (Last 30 Days)</p>
                        <h3 className="text-2xl font-bold text-teal-600 flex items-center gap-2">
                            {patients?.newPatients}
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </h3>
                    </div>
                     <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Gender Dist.</p>
                        <div className="space-y-1 mt-2">
                            {patients?.genderDistribution.map((g: any) => (
                                <div key={g.gender} className="flex justify-between text-sm">
                                    <span className="text-gray-600 capitalize">{g.gender.toLowerCase()}</span>
                                    <span className="font-medium">{g._count.gender}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

             {/* Inventory Alerts */}
             <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Package className="w-5 h-5" /> Inventory Criticals
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                <Package className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-red-800">Low Stock Alerts</p>
                                <h3 className="text-2xl font-bold text-red-900">{inventory?.lowStock} Items</h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-700">
                                <Package className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-yellow-800">Expiring Soon (30 days)</p>
                                <h3 className="text-2xl font-bold text-yellow-900">{inventory?.expiringSoon} Batches</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ReportsDashboard;
