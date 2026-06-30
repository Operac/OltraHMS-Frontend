import { useState, useEffect } from 'react';
import { BarChart2, DollarSign, Users, Package, TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { ReportService } from '../../services/report.service';
import { SettingsService, getCurrencySymbol } from '../../services/settings.service';

const COLORS = ['#0ea5e9', '#ec4899', '#a855f7', '#f59e0b'];

const StatCard = ({ label, value, sub, color = 'text-gray-900', bg = 'bg-white', icon: Icon }: any) => (
    <div className={`${bg} p-5 rounded-xl border border-gray-200 shadow-sm`}>
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
                {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
            </div>
            {Icon && <div className={`p-2 rounded-lg ${bg === 'bg-white' ? 'bg-gray-50' : 'bg-white/40'}`}><Icon className={`w-5 h-5 ${color}`} /></div>}
        </div>
    </div>
);

const ReportsDashboard = () => {
    const [finance, setFinance] = useState<any>(null);
    const [patients, setPatients] = useState<any>(null);
    const [inventory, setInventory] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currencySymbol, setCurrencySymbol] = useState('₦');

    useEffect(() => { loadReports(); }, []);

    const loadReports = async () => {
        try {
            const [finData, patData, invData, settings] = await Promise.all([
                ReportService.getFinancialStats(),
                ReportService.getPatientStats(),
                ReportService.getInventoryStats(),
                SettingsService.getHospitalSettings().catch(() => null),
            ]);
            setFinance(finData);
            setPatients(patData);
            setInventory(invData);
            if (settings) setCurrencySymbol(getCurrencySymbol(settings.currencyCode));
        } catch (error) {
            console.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const fmt = (n: number) =>
        `${currencySymbol}${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    if (loading) return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
            </div>
            <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
    );

    const totalRevenue = finance?.totalRevenue || 0;
    const pendingRevenue = finance?.pendingRevenue || 0;
    const totalExpenses = finance?.totalExpenses || 0;
    const netProfit = totalRevenue - totalExpenses;
    const collectionRate = (totalRevenue + pendingRevenue) > 0
        ? Math.round((totalRevenue / (totalRevenue + pendingRevenue)) * 100)
        : 0;

    const revenueChartData = [
        { name: 'Collected', value: totalRevenue },
        { name: 'Pending', value: pendingRevenue },
        { name: 'Expenses', value: totalExpenses },
    ];

    const genderDist = (patients?.genderDistribution || []).map((g: any) => ({
        name: g.gender?.charAt(0) + g.gender?.slice(1).toLowerCase(),
        value: g._count?.gender || 0,
    }));

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <BarChart2 className="w-6 h-6 text-teal-600" /> System Reports
                </h1>
                <button onClick={loadReports} className="text-sm text-sky-500 hover:text-sky-700 flex items-center gap-1">
                    <Activity className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Financial KPIs */}
            <section className="space-y-4">
                <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" /> Financial Overview
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Revenue Collected" value={fmt(totalRevenue)} color="text-green-600" bg="bg-green-50" icon={TrendingUp} sub={`${collectionRate}% collection rate`} />
                    <StatCard label="Pending Revenue" value={fmt(pendingRevenue)} color="text-orange-500" bg="bg-orange-50" icon={DollarSign} sub="Awaiting payment" />
                    <StatCard label="Total Expenses" value={fmt(totalExpenses)} color="text-red-600" bg="bg-red-50" icon={TrendingDown} />
                    <StatCard
                        label="Net Profit"
                        value={fmt(netProfit)}
                        color={netProfit >= 0 ? 'text-teal-600' : 'text-red-600'}
                        bg={netProfit >= 0 ? 'bg-teal-50' : 'bg-red-50'}
                        icon={netProfit >= 0 ? TrendingUp : TrendingDown}
                        sub={netProfit >= 0 ? 'Profitable' : 'Net loss'}
                    />
                </div>

                {/* Revenue Bar Chart */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm font-semibold text-gray-700 mb-4">Financial Breakdown</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={revenueChartData} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${currencySymbol}${(v/1000).toFixed(0)}k`} />
                            <Tooltip formatter={(v: any) => [fmt(v), '']} />
                            <Bar dataKey="value" radius={[4,4,0,0]}>
                                {revenueChartData.map((_, i) => (
                                    <Cell key={i} fill={i === 0 ? '#10b981' : i === 1 ? '#f59e0b' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>

                    {/* Collection Rate */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Collection Rate</span>
                            <span className="font-bold text-gray-800">{collectionRate}%</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${collectionRate >= 75 ? 'bg-green-500' : collectionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${collectionRate}%` }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Patient Stats */}
            <section className="space-y-4">
                <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-500" /> Patient Demographics
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard label="Total Patients" value={(patients?.totalPatients || 0).toLocaleString()} color="text-sky-600" icon={Users} />
                    <StatCard
                        label="New (Last 30 Days)"
                        value={patients?.newPatients || 0}
                        color="text-teal-600"
                        icon={TrendingUp}
                        sub={patients?.totalPatients > 0 ? `${Math.round(((patients?.newPatients || 0) / patients.totalPatients) * 100)}% of total` : undefined}
                    />
                    {/* Gender Pie Chart */}
                    {genderDist.length > 0 && (
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-sm text-gray-500 mb-2">Gender Distribution</p>
                            <ResponsiveContainer width="100%" height={120}>
                                <PieChart>
                                    <Pie data={genderDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                                        {genderDist.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </section>

            {/* Activity */}
            {(finance?.appointmentCount !== undefined || finance?.labCount !== undefined) && (
                <section className="space-y-4">
                    <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-500" /> Clinical Activity
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StatCard label="Appointments" value={(finance?.appointmentCount || 0).toLocaleString()} color="text-purple-600" icon={Activity} />
                        <StatCard label="Lab Requests" value={(finance?.labCount || 0).toLocaleString()} color="text-indigo-600" icon={Activity} />
                        <StatCard label="Prescriptions" value={(finance?.prescriptionCount || 0).toLocaleString()} color="text-teal-600" icon={Activity} />
                    </div>
                </section>
            )}

            {/* Inventory Alerts */}
            <section className="space-y-4">
                <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <Package className="w-4 h-4 text-red-500" /> Inventory Alerts
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-red-50 p-5 rounded-xl border border-red-100 flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-xl text-red-600 shrink-0"><AlertTriangle className="w-5 h-5" /></div>
                        <div>
                            <p className="text-sm font-medium text-red-800">Low Stock Items</p>
                            <h3 className="text-2xl font-bold text-red-900">{inventory?.lowStock ?? 0}</h3>
                            <p className="text-xs text-red-600 mt-0.5">Require immediate reorder</p>
                        </div>
                    </div>
                    <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100 flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 rounded-xl text-yellow-700 shrink-0"><Package className="w-5 h-5" /></div>
                        <div>
                            <p className="text-sm font-medium text-yellow-800">Expiring Soon (30 days)</p>
                            <h3 className="text-2xl font-bold text-yellow-900">{inventory?.expiringSoon ?? 0}</h3>
                            <p className="text-xs text-yellow-700 mt-0.5">Batches need attention</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ReportsDashboard;
