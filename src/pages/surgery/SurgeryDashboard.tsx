
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { surgeryService } from '../../services/surgery.service';
import type { SurgeryCase, OperatingTheater } from '../../services/surgery.service';
import { Activity, Calendar, Clock, MapPin, AlertTriangle, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEscapeKey } from '../../hooks/useEscapeKey';

interface PostOpModal { surgeryId: string; currentDiagnosis?: string; currentNotes?: string; }

const SurgeryDashboard = () => {
    const navigate = useNavigate();
    const [theaters, setTheaters] = useState<OperatingTheater[]>([]);
    const [surgeries, setSurgeries] = useState<SurgeryCase[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [postOpModal, setPostOpModal] = useState<PostOpModal | null>(null);
    const [postOpForm, setPostOpForm] = useState({ postOpDiagnosis: '', notes: '' });
    const [saving, setSaving] = useState(false);
    useEscapeKey(() => setPostOpModal(null), !saving);

    useEffect(() => {
        loadData();
    }, [filterDate]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [theatersData, scheduleData] = await Promise.all([
                surgeryService.getTheaters(),
                surgeryService.getSchedule({ date: filterDate })
            ]);
            setTheaters(theatersData);
            setSurgeries(scheduleData);
        } catch (error) {
            console.error('Failed to load surgery data', error);
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        if (newStatus === 'COMPLETED') {
            const surgery = surgeries.find(s => s.id === id);
            setPostOpModal({ surgeryId: id, currentDiagnosis: surgery?.postOpDiagnosis, currentNotes: surgery?.notes });
            setPostOpForm({ postOpDiagnosis: surgery?.postOpDiagnosis || '', notes: surgery?.notes || '' });
            return;
        }
        try {
            await surgeryService.updateStatus(id, { status: newStatus });
            toast.success('Status updated');
            loadData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handlePostOpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!postOpModal) return;
        setSaving(true);
        try {
            await surgeryService.updateStatus(postOpModal.surgeryId, {
                status: 'COMPLETED',
                postOpDiagnosis: postOpForm.postOpDiagnosis,
                notes: postOpForm.notes,
            });
            toast.success('Surgery completed and post-op notes saved');
            setPostOpModal(null);
            loadData();
        } catch (error) {
            toast.error('Failed to complete surgery');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                        <Activity className="text-rose-600" /> Surgery & OT Management
                    </h1>
                    <p className="text-gray-600">Operating Theater status and surgical schedule.</p>
                </div>
                <button 
                    onClick={() => navigate('/surgery/book')}
                    className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium flex items-center gap-2"
                >
                    <Calendar size={18} /> Schedule Surgery
                </button>
            </header>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Operating Theaters Status */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <MapPin size={20} className="text-gray-500" /> Theater Status
                        </h2>
                        <div className="grid gap-4">
                            {theaters.map(ot => (
                                <div key={ot.id} className={`p-4 rounded-xl border-l-4 shadow-sm bg-white border-gray-100 ${
                                    ot.status === 'AVAILABLE' ? 'border-l-green-500' :
                                    ot.status === 'IN_USE' ? 'border-l-red-500' :
                                    'border-l-yellow-500'
                                }`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{ot.name}</h3>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">{ot.type}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            ot.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                            ot.status === 'IN_USE' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {ot.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    {/* Ideally show current case if IN_USE */}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Clock size={20} className="text-gray-500" /> Schedule
                            </h2>
                            <input 
                                type="date" 
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-rose-500 focus:border-rose-500"
                            />
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {surgeries.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No surgeries scheduled for {new Date(filterDate).toLocaleDateString()}.
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {surgeries.map(surgery => {
                                        const startTime = new Date(surgery.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        const endTime = new Date(surgery.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        
                                        return (
                                            <div key={surgery.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex flex-col md:flex-row gap-4 justify-between">
                                                    
                                                    {/* Time & Location */}
                                                    <div className="md:w-32 flex-shrink-0">
                                                        <div className="font-mono text-lg font-bold text-gray-900">{startTime}</div>
                                                        <div className="text-xs text-gray-500 font-mono">to {endTime}</div>
                                                        <div className="mt-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded w-fit">
                                                            {surgery.theater.name}
                                                        </div>
                                                    </div>

                                                    {/* Details */}
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                            {surgery.patient.firstName} {surgery.patient.lastName}
                                                            {surgery.priority === 'EMERGENCY' && (
                                                                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                                                                    <AlertTriangle size={12} /> Emergency
                                                                </span>
                                                            )}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            <span className="font-medium text-gray-900">Surgeon:</span> Dr. {surgery.leadSurgeon.user.firstName} {surgery.leadSurgeon.user.lastName}
                                                        </p>
                                                        {surgery.preOpDiagnosis && (
                                                            <p className="text-sm text-gray-500 mt-1 italic">
                                                                Pre-op: {surgery.preOpDiagnosis}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Status & Actions */}
                                                    <div className="md:w-40 flex-shrink-0 flex flex-col items-end gap-2">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                                            surgery.status === 'COMPLETED' ? 'bg-gray-100 text-gray-600' :
                                                            surgery.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700 animate-pulse' :
                                                            'bg-sky-50 text-sky-600'
                                                        }`}>
                                                            {surgery.status.replace('_', ' ')}
                                                        </span>

                                                        <div className="flex gap-2">
                                                            {surgery.status === 'SCHEDULED' && (
                                                                <button 
                                                                    onClick={() => handleStatusUpdate(surgery.id, 'IN_PROGRESS')}
                                                                    className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                                                >
                                                                    Start
                                                                </button>
                                                            )}
                                                            {surgery.status === 'IN_PROGRESS' && (
                                                                <button 
                                                                    onClick={() => handleStatusUpdate(surgery.id, 'RECOVERY')}
                                                                    className="text-xs bg-sky-500 text-white px-3 py-1 rounded hover:bg-sky-600"
                                                                >
                                                                    To Recovery
                                                                </button>
                                                            )}
                                                            {surgery.status === 'RECOVERY' && (
                                                                <button 
                                                                    onClick={() => handleStatusUpdate(surgery.id, 'COMPLETED')}
                                                                    className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                                                                >
                                                                    Finish
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            )}

            {/* Post-Op Notes Modal */}
        {postOpModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                onClick={(e) => { if (e.target === e.currentTarget && !saving) setPostOpModal(null); }}>
                <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-rose-600" /> Complete Surgery — Post-Op Notes
                        </h2>
                        <button onClick={() => setPostOpModal(null)} disabled={saving} className="text-gray-400 hover:text-gray-600 disabled:opacity-40">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handlePostOpSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Post-Op Diagnosis</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 outline-none text-sm"
                                placeholder="Final diagnosis after surgery..."
                                value={postOpForm.postOpDiagnosis}
                                onChange={(e) => setPostOpForm(f => ({ ...f, postOpDiagnosis: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Operative Notes</label>
                            <textarea
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 outline-none text-sm resize-none"
                                placeholder="Procedure performed, findings, complications..."
                                value={postOpForm.notes}
                                onChange={(e) => setPostOpForm(f => ({ ...f, notes: e.target.value }))}
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setPostOpModal(null)} disabled={saving}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving}
                                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium disabled:opacity-50">
                                {saving ? 'Saving...' : 'Complete & Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </div>
    );
};

export default SurgeryDashboard;
