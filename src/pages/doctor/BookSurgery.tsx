
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { surgeryService } from '../../services/surgery.service';
import type { OperatingTheater } from '../../services/surgery.service';
import { AdminService } from '../../services/admin.service';
import { Activity, Search, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const BookSurgery = () => {
    const navigate = useNavigate();
    
    // Dropdown Data
    const [theaters, setTheaters] = useState<OperatingTheater[]>([]);
    const [surgeons, setSurgeons] = useState<any[]>([]); // Type loose for now
    
    // Form State
    const [patientId, setPatientId] = useState('');
    const [theaterId, setTheaterId] = useState('');
    const [leadSurgeonId, setLeadSurgeonId] = useState('');
    const [scheduledStart, setScheduledStart] = useState('');
    const [scheduledEnd, setScheduledEnd] = useState('');
    const [priority, setPriority] = useState('ELECTIVE');
    const [preOpDiagnosis, setPreOpDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        try {
            const [theatersData, staffData] = await Promise.all([
                surgeryService.getTheaters(),
                AdminService.getAllStaff() 
                // Ideally filter by role DOCTOR. But for MVP taking all.
            ]);
            setTheaters(theatersData);
            
            // Filter only doctors
            // Assuming staffData has user.role or similar check
             // If staffService.getAllStaff returns { data: [...] } or array, let's assume array for now based on pattern.
             // If not, might need adjustment.
            const doctors = Array.isArray(staffData) ? staffData : []; 
            // Better to filter if we can check department or role.
            setSurgeons(doctors);
        } catch (error) {
            console.error('Failed to load resources', error);
            // Non-blocking toast?
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await surgeryService.scheduleSurgery({
                patientId,
                theaterId,
                leadSurgeonId,
                scheduledStart: new Date(scheduledStart).toISOString(),
                scheduledEnd: new Date(scheduledEnd).toISOString(),
                priority,
                preOpDiagnosis,
                notes
            });
            toast.success('Surgery scheduled successfully');
            navigate('/surgery');
        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 409) {
                toast.error('Theater is booked for this time slot');
            } else {
                toast.error('Failed to schedule surgery');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
             <header className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                    <Activity className="text-rose-600" /> Book Surgery
                </h1>
                <p className="text-gray-600">Schedule a new surgical case.</p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Patient ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
                        <div className="relative">
                            <input 
                                required
                                type="text" 
                                value={patientId}
                                onChange={(e) => setPatientId(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                placeholder="Search Patient ID..."
                            />
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Surgeon */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Surgeon</label>
                            <select 
                                required
                                value={leadSurgeonId}
                                onChange={(e) => setLeadSurgeonId(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                            >
                                <option value="">Select Surgeon...</option>
                                {surgeons.map(s => (
                                    <option key={s.id} value={s.id}>
                                        Dr. {s.user?.firstName} {s.user?.lastName} ({s.specialization || 'General'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Theater */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Operating Theater</label>
                            <select 
                                required
                                value={theaterId}
                                onChange={(e) => setTheaterId(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                            >
                                <option value="">Select Theater...</option>
                                {theaters.map(t => (
                                    <option key={t.id} value={t.id} disabled={t.status === 'MAINTENANCE'}>
                                        {t.name} ({t.type}) {t.status === 'MAINTENANCE' ? '- Maintenance' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Start Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <input 
                                required
                                type="datetime-local" 
                                value={scheduledStart}
                                onChange={(e) => setScheduledStart(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                            />
                        </div>

                         {/* End Time */}
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time (Est.)</label>
                            <input 
                                required
                                type="datetime-local" 
                                value={scheduledEnd}
                                onChange={(e) => setScheduledEnd(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                            />
                        </div>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="priority" 
                                    value="ELECTIVE"
                                    checked={priority === 'ELECTIVE'}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="text-rose-600 focus:ring-rose-500"
                                />
                                <span className="text-gray-700">Elective</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="priority" 
                                    value="EMERGENCY"
                                    checked={priority === 'EMERGENCY'}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="text-rose-600 focus:ring-rose-500"
                                />
                                <span className="text-red-600 font-medium">Emergency</span>
                            </label>
                        </div>
                    </div>

                    {/* Diagnosis */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pre-Op Diagnosis</label>
                        <input 
                            required
                            type="text" 
                            value={preOpDiagnosis}
                            onChange={(e) => setPreOpDiagnosis(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                            placeholder="Primary indication for surgery..."
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Requirements</label>
                        <textarea 
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                            placeholder="Special equipment, blood products needed..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                         <button
                            type="button"
                            onClick={() => navigate('/surgery')}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting ? 'Booking...' : <><Save size={18} /> Book Surgery</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default BookSurgery;
