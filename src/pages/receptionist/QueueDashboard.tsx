import { useState, useEffect } from 'react';
import { queueService } from '../../services/queue.service';
import { queueSocket } from '../../services/socketService';
import { Users, UserPlus, Phone, Clock, AlertCircle, CheckCircle, RefreshCw, Building } from 'lucide-react';
import toast from 'react-hot-toast';

interface QueueStats {
    totalPatients: number;
    totalWaiting: number;
    totalInProgress: number;
    totalDoctors: number;
}

interface Doctor {
    id: string;
    name: string;
    department?: string;
    isAvailable: boolean;
    queueCount?: number;
}

const QueueDashboard = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'walkin'>('overview');
    const [queues, setQueues] = useState<any[]>([]);
    const [stats, setStats] = useState<QueueStats>({ totalPatients: 0, totalWaiting: 0, totalInProgress: 0, totalDoctors: 0 });
    const [loading, setLoading] = useState(true);
    const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
    
    // Walk-in form state
    const [walkInPatientId, setWalkInPatientId] = useState('');
    const [walkInDoctorId, setWalkInDoctorId] = useState('');
    const [walkInReason, setWalkInReason] = useState('');
    const [walkInPriority, setWalkInPriority] = useState<'normal' | 'emergency'>('normal');

    useEffect(() => {
        loadQueues();
        loadDoctors();
        
        // Connect to socket for real-time updates
        queueSocket.connect();
        queueSocket.joinReception();
        
        // Listen for queue events
        const handleQueueEvent = (data: any) => {
            console.log('Queue event received:', data);
            // Refresh queue on any event
            loadQueues();
            loadDoctors();
            
            // Show toast notifications
            if (data.type === 'PATIENT_CHECKED_IN') {
                toast.success(`${data.patientName} checked in (Token #${data.tokenNumber})`);
            } else if (data.type === 'PATIENT_CALLED') {
                toast(`${data.patientName} called by Dr. ${data.doctorName}`, { icon: '📢' });
            } else if (data.type === 'PATIENT_COMPLETED') {
                toast.success(`${data.patientName} consultation completed`);
            }
        };
        
        queueSocket.on('queue-event', handleQueueEvent);
        
        // Cleanup on unmount
        return () => {
            queueSocket.off('queue-event', handleQueueEvent);
            queueSocket.disconnect();
        };
    }, []);

    const loadQueues = async () => {
        try {
            setLoading(true);
            const data = await queueService.getAllQueues();
            setQueues(data.queues || []);
            setStats(data.stats || { totalPatients: 0, totalWaiting: 0, totalInProgress: 0, totalDoctors: 0 });
        } catch (error) {
            console.error('Failed to load queues:', error);
            toast.error('Failed to load queue data');
        } finally {
            setLoading(false);
        }
    };

    const loadDoctors = async () => {
        try {
            const doctors = await queueService.getAvailableDoctors();
            setAvailableDoctors(doctors || []);
        } catch (error) {
            console.error('Failed to load doctors:', error);
        }
    };

    const handleCheckIn = async (appointmentId: string) => {
        try {
            await queueService.checkInPatient(appointmentId);
            toast.success('Patient checked in');
            loadQueues();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to check in');
        }
    };

    const handleCallNext = async (doctorId: string) => {
        try {
            const result = await queueService.callNextPatient(doctorId);
            if (result.currentPatient) {
                toast.success(`Calling: ${result.currentPatient.patient.firstName} ${result.currentPatient.patient.lastName}`);
            } else {
                toast.error('No patients in queue');
            }
            loadQueues();
        } catch (error) {
            toast.error('Failed to call next patient');
        }
    };

    const handleAddWalkIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!walkInPatientId || !walkInDoctorId) {
            toast.error('Please select a patient and doctor');
            return;
        }
        try {
            await queueService.addWalkIn({
                patientId: walkInPatientId,
                doctorId: walkInDoctorId,
                reason: walkInReason,
                priority: walkInPriority
            });
            toast.success('Walk-in patient added to queue');
            setWalkInPatientId('');
            setWalkInDoctorId('');
            setWalkInReason('');
            setActiveTab('overview');
            loadQueues();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add walk-in');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Queue Management</h1>
                    <p className="text-gray-500">Manage patient queues and walk-ins</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            activeTab === 'overview' 
                            ? 'bg-sky-500 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <Users className="w-4 h-4 inline mr-2" />
                        Queue Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('walkin')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            activeTab === 'walkin' 
                            ? 'bg-sky-500 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <UserPlus className="w-4 h-4 inline mr-2" />
                        Add Walk-in
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-100 rounded-lg">
                            <Users className="w-5 h-5 text-sky-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Patients</p>
                            <p className="text-2xl font-bold">{stats.totalPatients}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Waiting</p>
                            <p className="text-2xl font-bold">{stats.totalWaiting}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">In Progress</p>
                            <p className="text-2xl font-bold">{stats.totalInProgress}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Building className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Active Doctors</p>
                            <p className="text-2xl font-bold">{stats.totalDoctors}</p>
                        </div>
                    </div>
                </div>
            </div>

            {activeTab === 'overview' ? (
                <div className="space-y-4">
                    {/* Doctor Queues */}
                    {queues.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No patients in queue</p>
                            <p className="text-sm text-gray-400">Patients will appear here when they check in</p>
                        </div>
                    ) : (
                        queues.map((queue) => (
                            <div key={queue.doctor?.id || 'unknown'} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                                            <span className="text-sky-600 font-bold">
                                                {queue.doctor?.user?.firstName?.[0] || 'D'}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                Dr. {queue.doctor?.user?.firstName} {queue.doctor?.user?.lastName}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {queue.doctor?.department?.name || 'General'} • 
                                                {queue.waiting} waiting
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleCallNext(queue.doctor?.id)}
                                            className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 flex items-center gap-1"
                                        >
                                            <Phone className="w-4 h-4" />
                                            Call Next
                                        </button>
                                        <button
                                            onClick={loadQueues}
                                            className="p-2 text-gray-400 hover:text-gray-600"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {queue.appointments?.length === 0 ? (
                                        <div className="p-4 text-center text-gray-400 text-sm">
                                            No patients in queue
                                        </div>
                                    ) : (
                                        queue.appointments?.map((apt: any, index: number) => (
                                            <div key={apt.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                        apt.status === 'IN_PROGRESS' 
                                                        ? 'bg-green-100 text-green-600' 
                                                        : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {apt.queuePosition || index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {apt.patient?.firstName} {apt.patient?.lastName}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {apt.patient?.patientNumber} • {apt.reason || 'Consultation'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {apt.status === 'CONFIRMED' && (
                                                        <button
                                                            onClick={() => handleCheckIn(apt.id)}
                                                            className="px-3 py-1.5 bg-sky-500 text-white text-sm rounded-lg hover:bg-sky-600"
                                                        >
                                                            Check In
                                                        </button>
                                                    )}
                                                    {apt.status === 'CHECKED_IN' && (
                                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                                            Waiting • ~{apt.estimatedWaitTime}min
                                                        </span>
                                                    )}
                                                    {apt.status === 'IN_PROGRESS' && (
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                                            In Progress
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4">Add Walk-in Patient</h2>
                    <form onSubmit={handleAddWalkIn} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
                                <input
                                    type="text"
                                    value={walkInPatientId}
                                    onChange={(e) => setWalkInPatientId(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                                    placeholder="Enter patient ID"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
                                <select
                                    value={walkInDoctorId}
                                    onChange={(e) => setWalkInDoctorId(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                                    required
                                >
                                    <option value="">Select a doctor</option>
                                    {availableDoctors.map((doc) => (
                                        <option key={doc.id} value={doc.id}>
                                            {doc.name} - {doc.department} ({doc.queueCount || 0} in queue)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
                            <input
                                type="text"
                                value={walkInReason}
                                onChange={(e) => setWalkInReason(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-sky-400 focus:ring-sky-400 py-2 px-3 border"
                                placeholder="e.g., General checkup, Headache, Follow-up"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="priority"
                                        checked={walkInPriority === 'normal'}
                                        onChange={() => setWalkInPriority('normal')}
                                        className="text-sky-500"
                                    />
                                    <span>Normal</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="priority"
                                        checked={walkInPriority === 'emergency'}
                                        onChange={() => setWalkInPriority('emergency')}
                                        className="text-red-500"
                                    />
                                    <span className="text-red-600">Emergency</span>
                                </label>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-sky-500 text-white py-2 px-4 rounded-lg hover:bg-sky-600 font-medium"
                        >
                            Add to Queue
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default QueueDashboard;
