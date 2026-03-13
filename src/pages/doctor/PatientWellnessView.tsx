
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { 
    Heart, Activity, Pill, Moon, Brain, TrendingUp, AlertCircle,
    Thermometer, Droplets
} from 'lucide-react';

interface PatientWellness {
    patientId: string;
    patientName: string;
    goals: any[];
    vitals: any[];
    medications: any[];
    moods: any[];
    sleep: any[];
    symptoms: any[];
    reminders: any[];
    summary: {
        medicationAdherence: number;
        activeGoals: number;
        completedGoals: number;
        averageMood: number | null;
        averageSleepDuration: number | null;
    };
}

const PatientWellnessView = () => {
    const { patientId } = useParams<{ patientId: string }>();
    const [wellness, setWellness] = useState<PatientWellness | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'summary' | 'vitals' | 'medications' | 'mood' | 'sleep' | 'symptoms'>('summary');

    useEffect(() => {
        if (patientId) {
            fetchPatientWellness();
        }
    }, [patientId]);

    const fetchPatientWellness = async () => {
        try {
            const response = await api.get(`/wellness/patient/${patientId}`);
            setWellness(response.data);
        } catch (err) {
            console.error('Error fetching patient wellness:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    if (!wellness) {
        return <div className="p-6">Patient wellness data not found</div>;
    }

    const formatDate = (date: string) => new Date(date).toLocaleDateString();
    const formatDateTime = (date: string) => new Date(date).toLocaleString();

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Patient Wellness Dashboard</h1>
                <p className="text-gray-500">{wellness.patientName}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {[
                    { id: 'summary', label: 'Summary', icon: TrendingUp },
                    { id: 'vitals', label: 'Vitals', icon: Heart },
                    { id: 'medications', label: 'Medications', icon: Pill },
                    { id: 'mood', label: 'Mood', icon: Brain },
                    { id: 'sleep', label: 'Sleep', icon: Moon },
                    { id: 'symptoms', label: 'Symptoms', icon: AlertCircle },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                            activeTab === tab.id 
                                ? 'bg-sky-500 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Summary Tab */}
            {activeTab === 'summary' && (
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Pill className="text-green-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Med Adherence</p>
                                    <p className="text-xl font-bold">{wellness.summary.medicationAdherence}%</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-sky-100 rounded-lg">
                                    <TrendingUp className="text-sky-500" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Active Goals</p>
                                    <p className="text-xl font-bold">{wellness.summary.activeGoals}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Brain className="text-yellow-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Avg Mood</p>
                                    <p className="text-xl font-bold">{wellness.summary.averageMood ?? '--'}/10</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Moon className="text-purple-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Avg Sleep</p>
                                    <p className="text-xl font-bold">
                                        {wellness.summary.averageSleepDuration 
                                            ? `${Math.round(wellness.summary.averageSleepDuration / 60)}h` 
                                            : '--'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Alerts */}
                    {(wellness.symptoms.filter((s: any) => s.severity >= 7).length > 0 || 
                      wellness.summary.medicationAdherence < 70) && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <h3 className="font-bold text-red-800 mb-2">⚠️ Alerts</h3>
                            <ul className="space-y-1">
                                {wellness.symptoms.filter((s: any) => s.severity >= 7).length > 0 && (
                                    <li className="text-red-700 text-sm">
                                        {wellness.symptoms.filter((s: any) => s.severity >= 7).length} severe symptoms recorded
                                    </li>
                                )}
                                {wellness.summary.medicationAdherence < 70 && (
                                    <li className="text-red-700 text-sm">
                                        Low medication adherence: {wellness.summary.medicationAdherence}%
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Vitals Tab */}
            {activeTab === 'vitals' && (
                <div className="space-y-4">
                    {wellness.vitals.length === 0 ? (
                        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                            No vitals recorded
                        </div>
                    ) : (
                        wellness.vitals.map((vital: any) => (
                            <div key={vital.id} className="bg-white rounded-xl shadow-sm border p-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        {vital.type === 'BLOOD_PRESSURE' && <Heart className="text-red-500" />}
                                        {vital.type === 'HEART_RATE' && <Activity className="text-pink-500" />}
                                        {vital.type === 'WEIGHT' && <TrendingUp className="text-sky-400" />}
                                        {vital.type === 'GLUCOSE' && <Droplets className="text-purple-500" />}
                                        {vital.type === 'TEMPERATURE' && <Thermometer className="text-orange-500" />}
                                        <div>
                                            <p className="font-bold">{vital.type.replace('_', ' ')}</p>
                                            <p className="text-sm text-gray-500">{formatDateTime(vital.recordedAt)}</p>
                                        </div>
                                    </div>
                                    <p className="text-xl font-bold">
                                        {vital.type === 'BLOOD_PRESSURE' 
                                            ? `${vital.value}/${vital.value2}` 
                                            : `${vital.value} ${vital.unit}`}
                                    </p>
                                </div>
                                {vital.notes && <p className="mt-2 text-sm text-gray-600">{vital.notes}</p>}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Medications Tab */}
            {activeTab === 'medications' && (
                <div className="space-y-4">
                    {wellness.medications.length === 0 ? (
                        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                            No medications tracked
                        </div>
                    ) : (
                        wellness.medications.map((med: any) => (
                            <div key={med.id} className="bg-white rounded-xl shadow-sm border p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-bold">{med.name}</p>
                                        <p className="text-sm text-gray-500">{med.dosage} • {med.frequency.replace('_', ' ')}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        med.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100'
                                    }`}>
                                        {med.status}
                                    </span>
                                </div>
                                {med.logs && med.logs.length > 0 && (
                                    <div className="mt-3 pt-3 border-t">
                                        <p className="text-xs text-gray-500 mb-2">Recent Logs:</p>
                                        <div className="space-y-1">
                                            {med.logs.slice(0, 5).map((log: any) => (
                                                <div key={log.id} className="flex justify-between text-sm">
                                                    <span>{formatDateTime(log.scheduledTime)}</span>
                                                    <span className={log.status === 'TAKEN' ? 'text-green-600' : 'text-red-600'}>
                                                        {log.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Mood Tab */}
            {activeTab === 'mood' && (
                <div className="space-y-4">
                    {wellness.moods.length === 0 ? (
                        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                            No mood entries
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {wellness.moods.map((mood: any) => (
                                <div key={mood.id} className="bg-white rounded-xl shadow-sm border p-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">
                                            {mood.moodScore >= 9 ? '😊' : mood.moodScore >= 7 ? '🙂' : mood.moodScore >= 5 ? '😐' : '😔'}
                                        </span>
                                        <div>
                                            <p className="font-bold">{mood.moodScore}/10</p>
                                            <p className="text-xs text-gray-500">{formatDate(mood.recordedAt)}</p>
                                        </div>
                                    </div>
                                    {mood.stressLevel && (
                                        <p className="mt-2 text-sm text-gray-600">Stress: {mood.stressLevel}/10</p>
                                    )}
                                    {mood.notes && <p className="mt-2 text-sm text-gray-600">{mood.notes}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Sleep Tab */}
            {activeTab === 'sleep' && (
                <div className="space-y-4">
                    {wellness.sleep.length === 0 ? (
                        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                            No sleep entries
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {wellness.sleep.map((s: any) => (
                                <div key={s.id} className="bg-white rounded-xl shadow-sm border p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Moon className="text-indigo-500" />
                                        <div>
                                            <p className="font-bold">
                                                {s.duration ? `${Math.floor(s.duration / 60)}h ${s.duration % 60}m` : '--'}
                                            </p>
                                            <p className="text-xs text-gray-500">{formatDate(s.recordedAt)}</p>
                                        </div>
                                    </div>
                                    {s.quality && <p className="text-sm text-gray-600">Quality: {s.quality}/10</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Symptoms Tab */}
            {activeTab === 'symptoms' && (
                <div className="space-y-4">
                    {wellness.symptoms.length === 0 ? (
                        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                            No symptoms recorded
                        </div>
                    ) : (
                        wellness.symptoms.map((symptom: any) => (
                            <div key={symptom.id} className="bg-white rounded-xl shadow-sm border p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold">{symptom.symptom}</p>
                                        <p className="text-sm text-gray-500">{formatDate(symptom.recordedAt)}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-sm ${
                                        symptom.severity >= 7 ? 'bg-red-100 text-red-700' : 
                                        symptom.severity >= 4 ? 'bg-yellow-100 text-yellow-700' : 
                                        'bg-green-100 text-green-700'
                                    }`}>
                                        {symptom.severity}/10
                                    </span>
                                </div>
                                {symptom.notes && <p className="mt-2 text-sm text-gray-600">{symptom.notes}</p>}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default PatientWellnessView;
