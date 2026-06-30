import { useState, useEffect } from 'react';
import { Star, MessageSquare, CheckCircle, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Overall Experience', 'Doctor Consultation', 'Nursing Care', 'Reception & Admin', 'Facility & Cleanliness', 'Wait Time', 'Pharmacy', 'Lab Services'];

const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" onClick={() => onChange(n)}
                className={`text-2xl transition-transform hover:scale-110 ${n <= value ? 'text-yellow-400' : 'text-gray-300'}`}>
                <Star className="w-7 h-7" fill={n <= value ? 'currentColor' : 'none'} />
            </button>
        ))}
    </div>
);

const RATING_LABELS: Record<number, string> = { 1: 'Very Poor', 2: 'Poor', 3: 'Average', 4: 'Good', 5: 'Excellent' };

const Feedback = () => {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [form, setForm] = useState({
        rating: 0,
        comment: '',
        doctorId: '',
        category: 'Overall Experience',
    });

    useEffect(() => {
        api.get('/appointments?status=COMPLETED&limit=10').then(res => {
            const seen = new Set();
            const uniqueDoctors = (res.data?.appointments || res.data || [])
                .filter((a: any) => a.doctor && !seen.has(a.doctor.id) && seen.add(a.doctor.id))
                .map((a: any) => ({ id: a.doctor.id, name: `Dr. ${a.doctor.user?.firstName} ${a.doctor.user?.lastName}` }));
            setDoctors(uniqueDoctors);
        }).catch(() => {});
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.rating === 0) { toast.error('Please select a rating'); return; }
        setLoading(true);
        try {
            await api.post('/patient-experience/feedback', form);
            setSubmitted(true);
            toast.success('Thank you for your feedback!');
        } catch {
            toast.error('Failed to submit feedback');
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
                <h2 className="text-xl font-bold text-gray-900 mb-2">Thank you!</h2>
                <p className="text-gray-500 text-sm mb-6">Your feedback helps us improve care for every patient.</p>
                <button onClick={() => { setSubmitted(false); setForm({ rating: 0, comment: '', doctorId: '', category: 'Overall Experience' }); }}
                    className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Submit another
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-50 rounded-xl">
                    <MessageSquare className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Share Your Feedback</h1>
                    <p className="text-sm text-gray-500">Help us improve your healthcare experience</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                {/* Rating */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Overall Rating <span className="text-red-500">*</span></label>
                    <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                    {form.rating > 0 && (
                        <p className={`text-sm font-medium mt-2 ${form.rating >= 4 ? 'text-green-600' : form.rating === 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {RATING_LABELS[form.rating]}
                        </p>
                    )}
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                    <div className="relative">
                        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none text-sm bg-white appearance-none pr-8">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Doctor (optional) */}
                {doctors.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Doctor (optional)</label>
                        <div className="relative">
                            <select value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none text-sm bg-white appearance-none pr-8">
                                <option value="">Select a doctor...</option>
                                {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                )}

                {/* Comment */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Comments</label>
                    <textarea rows={4} value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                        placeholder="Tell us about your experience — what went well and what could be better..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 outline-none text-sm resize-none" />
                </div>

                <button type="submit" disabled={loading || form.rating === 0}
                    className="w-full py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                    <Star className="w-4 h-4" />
                    {loading ? 'Submitting...' : 'Submit Feedback'}
                </button>
            </form>
        </div>
    );
};

export default Feedback;
