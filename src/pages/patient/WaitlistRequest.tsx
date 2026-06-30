import { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const SPECIALIZATIONS = [
    'General Practice', 'Cardiology', 'Dermatology', 'ENT', 'Gastroenterology',
    'Gynecology', 'Neurology', 'Ophthalmology', 'Orthopedics', 'Pediatrics',
    'Psychiatry', 'Pulmonology', 'Urology', 'Radiology', 'Surgery',
];

const WaitlistRequest = () => {
    const { user } = useAuth();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        specialization: '',
        preferredDoctorId: '',
        urgency: 'ROUTINE' as 'ROUTINE' | 'SOON' | 'URGENT',
        notes: '',
        preferredDates: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.specialization) { toast.error('Please select a specialization'); return; }
        setLoading(true);
        try {
            await api.post('/appointments/waitlist', {
                ...form,
                patientName: `${user?.firstName} ${user?.lastName}`,
            });
            setSubmitted(true);
            toast.success('You have been added to the waitlist!');
        } catch {
            toast.error('Failed to submit waitlist request');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="max-w-lg mx-auto mt-12 text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">You're on the waitlist!</h2>
                <p className="text-gray-500 text-sm mb-6">
                    We'll notify you as soon as an appointment slot opens up with your preferred specialist.
                    You can also book directly if a slot is available.
                </p>
                <button onClick={() => setSubmitted(false)}
                    className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Submit another request
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-50 rounded-xl">
                    <Users className="w-6 h-6 text-sky-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Appointment Waitlist</h1>
                    <p className="text-sm text-gray-500">Request to be notified when a slot opens</p>
                </div>
            </div>

            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-sky-500 mt-0.5 shrink-0" />
                <p className="text-sm text-sky-700">
                    If your preferred doctor or time is not currently available, submit a waitlist request. You'll receive a notification when a matching slot opens.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Specialization needed <span className="text-red-500">*</span></label>
                    <select value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none text-sm bg-white">
                        <option value="">Select a specialization...</option>
                        {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Urgency</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['ROUTINE', 'SOON', 'URGENT'] as const).map(u => (
                            <button key={u} type="button" onClick={() => setForm(f => ({ ...f, urgency: u }))}
                                className={`py-2 rounded-lg text-sm font-medium border transition-colors ${form.urgency === u
                                    ? u === 'URGENT' ? 'bg-red-600 text-white border-red-600'
                                        : u === 'SOON' ? 'bg-orange-500 text-white border-orange-500'
                                        : 'bg-sky-500 text-white border-sky-500'
                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                                {u === 'ROUTINE' ? 'Routine' : u === 'SOON' ? 'Within weeks' : '⚠ Urgent'}
                            </button>
                        ))}
                    </div>
                    {form.urgency === 'URGENT' && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> For emergencies, please go to reception or call immediately.
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred dates / availability</label>
                    <input type="text" value={form.preferredDates} onChange={e => setForm(f => ({ ...f, preferredDates: e.target.value }))}
                        placeholder="e.g., Weekday mornings, After June 15..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none text-sm" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional notes</label>
                    <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                        placeholder="Describe your symptoms or any specific requirements..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none text-sm resize-none" />
                </div>

                <button type="submit" disabled={loading}
                    className="w-full py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 font-medium disabled:opacity-50 transition-colors">
                    {loading ? 'Submitting...' : 'Join Waitlist'}
                </button>
            </form>
        </div>
    );
};

export default WaitlistRequest;
