import { useState, useEffect } from 'react';
import { Search, History } from 'lucide-react';
import { AdminService } from '../../services/admin.service';

const AuditLogs = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            const data = await AdminService.getAuditLogs();
            setLogs(data);
        } catch (error) {
            console.error("Failed to load logs");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <History className="w-6 h-6 text-gray-500" /> System Audit Logs
                </h1>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <input 
                            placeholder="Search logs..." 
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-3 text-left">Date</th>
                            <th className="px-6 py-3 text-left">User</th>
                            <th className="px-6 py-3 text-left">Action</th>
                            <th className="px-6 py-3 text-left">Details</th>
                            <th className="px-6 py-3 text-left">Entity</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                             <tr><td colSpan={5} className="p-6 text-center">Loading...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={5} className="p-6 text-center text-gray-500">No logs found</td></tr>
                        ) : logs.map((log) => (
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
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 max-w-sm truncate" title={log.details}>
                                    {log.details}
                                </td>
                                <td className="px-6 py-4 text-xs text-mono text-gray-500">
                                    {log.entityType} #{log.entityId?.substring(0, 8)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogs;
