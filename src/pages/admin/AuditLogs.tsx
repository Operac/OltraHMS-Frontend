import { useState, useEffect, useMemo } from 'react';
import { Search, History, Filter, X } from 'lucide-react';
import { AdminService } from '../../services/admin.service';
import { Loading } from '../../components/ui/Loading';

const ACTION_COLORS: Record<string, string> = {
    USER_LOGIN: 'bg-sky-100 text-sky-700',
    USER_REGISTER: 'bg-green-100 text-green-700',
    CREATE: 'bg-teal-100 text-teal-700',
    UPDATE: 'bg-yellow-100 text-yellow-700',
    DELETE: 'bg-red-100 text-red-700',
    CHECK_IN: 'bg-purple-100 text-purple-700',
    CHECK_OUT: 'bg-orange-100 text-orange-700',
    QUEUE_MOVE: 'bg-indigo-100 text-indigo-700',
    VITALS_CAPTURE: 'bg-pink-100 text-pink-700',
    INSURANCE_VERIFY: 'bg-cyan-100 text-cyan-700',
};

const AuditLogs = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAction, setFilterAction] = useState('ALL');
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await AdminService.getAuditLogs();
            setLogs(data);
        } catch (error) {
            console.error('Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    const uniqueActions = useMemo(() => {
        const actions = [...new Set(logs.map(l => l.action))].sort();
        return actions;
    }, [logs]);

    const filtered = useMemo(() => {
        return logs.filter(log => {
            const search = searchQuery.toLowerCase();
            const matchesSearch = !search || [
                log.user?.firstName,
                log.user?.lastName,
                log.action,
                log.details,
                log.entityType,
                log.entityId,
            ].some(v => v?.toLowerCase().includes(search));

            const matchesAction = filterAction === 'ALL' || log.action === filterAction;

            const matchesDate = !filterDate || new Date(log.createdAt).toISOString().startsWith(filterDate);

            return matchesSearch && matchesAction && matchesDate;
        });
    }, [logs, searchQuery, filterAction, filterDate]);

    const clearFilters = () => {
        setSearchQuery('');
        setFilterAction('ALL');
        setFilterDate('');
    };

    const hasFilters = searchQuery || filterAction !== 'ALL' || filterDate;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <History className="w-6 h-6 text-gray-500" /> System Audit Logs
                </h1>
                <div className="text-sm text-gray-500">{filtered.length} of {logs.length} entries</div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by user, action, entity..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                </div>
                <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-2">
                    <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                    <select
                        value={filterAction}
                        onChange={e => setFilterAction(e.target.value)}
                        className="text-sm outline-none bg-transparent text-gray-700"
                        title="Filter by action"
                    >
                        <option value="ALL">All Actions</option>
                        {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
                <input
                    type="date"
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 text-gray-700"
                    title="Filter by date"
                />
                {hasFilters && (
                    <button onClick={clearFilters}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <X className="w-4 h-4" /> Clear
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-3 text-left whitespace-nowrap">Date & Time</th>
                                <th className="px-6 py-3 text-left">User</th>
                                <th className="px-6 py-3 text-left">Action</th>
                                <th className="px-6 py-3 text-left">Details</th>
                                <th className="px-6 py-3 text-left whitespace-nowrap">Entity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="p-6 text-center"><Loading text="Loading logs..." /></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-400">
                                        <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                        {hasFilters ? 'No logs match your filters' : 'No audit logs found'}
                                    </td>
                                </tr>
                            ) : filtered.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">
                                            {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'SYSTEM'}
                                        </div>
                                        <div className="text-xs text-gray-500">{log.user?.role || 'System'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={log.details}>
                                        {log.details || '—'}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-gray-500 whitespace-nowrap">
                                        {log.entityType && <span className="text-gray-700 font-medium">{log.entityType}</span>}
                                        {log.entityId && <span className="text-gray-400"> #{log.entityId.substring(0, 8)}</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
