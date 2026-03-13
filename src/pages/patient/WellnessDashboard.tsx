
import { useState, useEffect } from 'react';
import type { 
    WellnessGoal, 
    WellnessVitals, 
    WellnessMedication, 
    WellnessMood, 
    WellnessSleep, 
    WellnessSymptom,
    WellnessSummary 
} from '../../services/wellness.service';
import { wellnessService } from '../../services/wellness.service';
import { 
    Heart, Activity, Pill, Brain, Thermometer, Droplets, 
    Plus, Check, X, TrendingUp, AlertCircle,
    Moon as MoonIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WellnessSummaryCharts } from '../../components/WellnessCharts';

// Tab types
type TabType = 'overview' | 'habits' | 'vitals' | 'medications' | 'mood' | 'sleep' | 'symptoms';

const WellnessDashboard = () => {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [summary, setSummary] = useState<WellnessSummary | null>(null);
    const [loading, setLoading] = useState(true);

    // Data states
    const [goals, setGoals] = useState<WellnessGoal[]>([]);
    const [vitals, setVitals] = useState<WellnessVitals[]>([]);
    const [medications, setMedications] = useState<WellnessMedication[]>([]);
    const [moods, setMoods] = useState<WellnessMood[]>([]);
    const [sleep, setSleep] = useState<WellnessSleep[]>([]);
    const [symptoms, setSymptoms] = useState<WellnessSymptom[]>([]);

    // Modal states
    const [showVitalsModal, setShowVitalsModal] = useState(false);
    const [showMedicationModal, setShowMedicationModal] = useState(false);
    const [showMoodModal, setShowMoodModal] = useState(false);
    const [showSleepModal, setShowSleepModal] = useState(false);
    const [showSymptomModal, setShowSymptomModal] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [summaryData, goalsData, vitalsData, medsData, moodsData, sleepData, symptomsData] = await Promise.all([
                wellnessService.getSummary(),
                wellnessService.getGoals(),
                wellnessService.getVitals(),
                wellnessService.getMedications(),
                wellnessService.getMoods(),
                wellnessService.getSleep(),
                wellnessService.getSymptoms()
            ]);
            
            setSummary(summaryData);
            setGoals(goalsData);
            setVitals(vitalsData);
            setMedications(medsData);
            setMoods(moodsData);
            setSleep(sleepData);
            setSymptoms(symptomsData);
        } catch (err) {
            console.error('Error fetching wellness data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handlers
    const handleCheckIn = async (goal: WellnessGoal) => {
        try {
            const res = await wellnessService.checkIn(goal.id, 1);
            setGoals(prev => prev.map(g => g.id === goal.id ? res : g));
            if (res.currentValue >= res.targetValue && goal.currentValue < goal.targetValue) {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateGoal = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        try {
            await wellnessService.createGoal({
                description: formData.get('description') as string,
                category: formData.get('category') as string,
                targetValue: Number(formData.get('targetValue')),
                unit: formData.get('unit') as string,
                frequency: formData.get('frequency') as string
            });
            setShowGoalModal(false);
            fetchAllData();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
    );

    const tabs = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'habits', label: 'Habits', icon: Check },
        { id: 'vitals', label: 'Vitals', icon: Heart },
        { id: 'medications', label: 'Medications', icon: Pill },
        { id: 'mood', label: 'Mood', icon: Brain },
        { id: 'sleep', label: 'Sleep', icon: MoonIcon },
        { id: 'symptoms', label: 'Symptoms', icon: AlertCircle },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Health & Wellness</h1>
                <p className="text-gray-500">Track your health metrics, medications, and wellbeing</p>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
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

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <OverviewTab 
                    summary={summary} 
                    vitals={vitals}
                    medications={medications}
                    moods={moods}
                    sleep={sleep}
                    onNavigate={setActiveTab}
                />
            )}

            {/* Habits Tab */}
            {activeTab === 'habits' && (
                <HabitsTab 
                    goals={goals}
                    onCheckIn={handleCheckIn}
                    onCreate={handleCreateGoal}
                    showModal={showGoalModal}
                    setShowModal={setShowGoalModal}
                />
            )}

            {/* Vitals Tab */}
            {activeTab === 'vitals' && (
                <VitalsTab 
                    vitals={vitals}
                    onAdd={() => setShowVitalsModal(true)}
                    onRefresh={fetchAllData}
                />
            )}

            {/* Medications Tab */}
            {activeTab === 'medications' && (
                <MedicationsTab 
                    medications={medications}
                    onAdd={() => setShowMedicationModal(true)}
                    onRefresh={fetchAllData}
                />
            )}

            {/* Mood Tab */}
            {activeTab === 'mood' && (
                <MoodTab 
                    moods={moods}
                    onAdd={() => setShowMoodModal(true)}
                    onRefresh={fetchAllData}
                />
            )}

            {/* Sleep Tab */}
            {activeTab === 'sleep' && (
                <SleepTab 
                    sleep={sleep}
                    onAdd={() => setShowSleepModal(true)}
                    onRefresh={fetchAllData}
                />
            )}

            {/* Symptoms Tab */}
            {activeTab === 'symptoms' && (
                <SymptomsTab 
                    symptoms={symptoms}
                    onAdd={() => setShowSymptomModal(true)}
                    onRefresh={fetchAllData}
                />
            )}

            {/* Modals */}
            {showVitalsModal && <VitalsModal onClose={() => setShowVitalsModal(false)} onSave={fetchAllData} />}
            {showMedicationModal && <MedicationModal onClose={() => setShowMedicationModal(false)} onSave={fetchAllData} />}
            {showMoodModal && <MoodModal onClose={() => setShowMoodModal(false)} onSave={fetchAllData} />}
            {showSleepModal && <SleepModal onClose={() => setShowSleepModal(false)} onSave={fetchAllData} />}
            {showSymptomModal && <SymptomModal onClose={() => setShowSymptomModal(false)} onSave={fetchAllData} />}
            {showGoalModal && <GoalModal onClose={() => setShowGoalModal(false)} onSave={fetchAllData} />}
        </div>
    );
};

// =============================================================================
// OVERVIEW TAB
// =============================================================================
function OverviewTab({ summary, vitals, moods, sleep, onNavigate }: any) {
    if (!summary) return <div>Loading...</div>;

    const getVitalDisplay = (type: string) => {
        const v = vitals.find((v: any) => v.type === type);
        if (!v) return null;
        if (type === 'BLOOD_PRESSURE') return `${v.value}/${v.value2}`;
        return `${v.value} ${v.unit}`;
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                    onClick={() => onNavigate('vitals')}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Heart className="text-red-600" size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Blood Pressure</p>
                            <p className="text-lg font-bold">{getVitalDisplay('BLOOD_PRESSURE') || '--'}</p>
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => onNavigate('vitals')}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-100 rounded-lg">
                            <Activity className="text-sky-500" size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Heart Rate</p>
                            <p className="text-lg font-bold">{getVitalDisplay('HEART_RATE') || '--'}</p>
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => onNavigate('medications')}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Pill className="text-purple-600" size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Med Adherence</p>
                            <p className="text-lg font-bold">{summary.medications.adherence ?? '--'}%</p>
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => onNavigate('mood')}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Brain className="text-yellow-600" size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Avg Mood</p>
                            <p className="text-lg font-bold">{summary.mood.average ?? '--'}/10</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trend Charts */}
            <WellnessSummaryCharts vitals={vitals} moods={moods} sleep={sleep} />

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-4">30-Day Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-sky-500">{summary.goals.completed}</p>
                        <p className="text-sm text-gray-500">Goals Completed</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">{summary.medications.activeCount}</p>
                        <p className="text-sm text-gray-500">Active Meds</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-indigo-600">
                            {summary.sleep.averageDurationMinutes ? Math.round(summary.sleep.averageDurationMinutes / 60) : 0}h
                        </p>
                        <p className="text-sm text-gray-500">Avg Sleep</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-orange-600">{summary.symptoms.severe}</p>
                        <p className="text-sm text-gray-500">Severe Symptoms</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// HABITS TAB
// =============================================================================
function HabitsTab({ goals, onCheckIn, setShowModal }: any) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Daily Habits</h2>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                    <Plus size={20} /> New Habit
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goals.map((goal: WellnessGoal) => {
                    const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
                    const isCompleted = goal.currentValue >= goal.targetValue;

                    return (
                        <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-800">{goal.description}</h3>
                                    <p className="text-xs text-gray-500">{goal.category} • {goal.frequency}</p>
                                </div>
                                {goal.streak > 0 && (
                                    <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                                        🔥 {goal.streak}
                                    </span>
                                )}
                            </div>
                            <div className="mb-3">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-500">Progress</span>
                                    <span className="font-medium">{goal.currentValue}/{goal.targetValue} {goal.unit}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full">
                                    <div 
                                        className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-sky-400'}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => onCheckIn(goal)}
                                disabled={isCompleted}
                                className={`w-full py-2 rounded-lg font-medium ${
                                    isCompleted 
                                        ? 'bg-green-100 text-green-700 cursor-default' 
                                        : 'bg-gray-900 text-white hover:bg-gray-800'
                                }`}
                            >
                                {isCompleted ? '✓ Done for today' : '+ Check In'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {goals.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">No habits yet. Create your first habit!</p>
                </div>
            )}
        </div>
    );
}

// =============================================================================
// VITALS TAB
// =============================================================================
function VitalsTab({ vitals, onAdd }: { vitals: WellnessVitals[], onAdd: () => void, onRefresh?: () => void }) {
    const getVitalIcon = (type: string) => {
        switch(type) {
            case 'BLOOD_PRESSURE': return <Heart className="text-red-500" />;
            case 'HEART_RATE': return <Activity className="text-pink-500" />;
            case 'WEIGHT': return <TrendingUp className="text-sky-400" />;
            case 'GLUCOSE': return <Droplets className="text-purple-500" />;
            case 'TEMPERATURE': return <Thermometer className="text-orange-500" />;
            default: return <Heart className="text-gray-500" />;
        }
    };

    const getVitalLabel = (type: string) => {
        switch(type) {
            case 'BLOOD_PRESSURE': return 'Blood Pressure';
            case 'HEART_RATE': return 'Heart Rate';
            case 'WEIGHT': return 'Weight';
            case 'GLUCOSE': return 'Blood Glucose';
            case 'TEMPERATURE': return 'Temperature';
            case 'SPO2': return 'Oxygen Saturation';
            default: return type;
        }
    };

    const getVitalValue = (v: WellnessVitals) => {
        if (v.type === 'BLOOD_PRESSURE') return `${v.value}/${v.value2}`;
        return `${v.value} ${v.unit}`;
    };

    // Group vitals by type
    const groupedVitals = vitals.reduce((acc, v) => {
        if (!acc[v.type]) acc[v.type] = [];
        acc[v.type].push(v);
        return acc;
    }, {} as Record<string, WellnessVitals[]>);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Health Metrics</h2>
                <button 
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                    <Plus size={20} /> Add Reading
                </button>
            </div>

            {Object.entries(groupedVitals).map(([type, readings]) => (
                <div key={type} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-4">
                        {getVitalIcon(type)}
                        <h3 className="font-bold text-gray-800">{getVitalLabel(type)}</h3>
                    </div>
                    <div className="space-y-2">
                        {readings.slice(0, 5).map((v) => (
                            <div key={v.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                <span className="text-gray-600">{new Date(v.recordedAt).toLocaleDateString()}</span>
                                <span className="font-bold">{getVitalValue(v)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {vitals.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Heart className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500">No vitals recorded yet</p>
                    <button onClick={onAdd} className="mt-2 text-sky-500 hover:underline">Record your first reading</button>
                </div>
            )}
        </div>
    );
}

// =============================================================================
// MEDICATIONS TAB
// =============================================================================
function MedicationsTab({ medications, onAdd, onRefresh }: { medications: WellnessMedication[], onAdd: () => void, onRefresh: () => void }) {
    const handleLog = async (medId: string, status: string) => {
        try {
            await wellnessService.logMedication(medId, { status });
            onRefresh();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Medications</h2>
                <button 
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                    <Plus size={20} /> Add Medication
                </button>
            </div>

            <div className="space-y-4">
                {medications.map((med) => (
                    <div key={med.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-gray-800">{med.name}</h3>
                                <p className="text-sm text-gray-500">{med.dosage} • {med.frequency.replace('_', ' ')}</p>
                                <p className="text-xs text-gray-400">Times: {JSON.parse(med.times).join(', ')}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                                med.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {med.status}
                            </span>
                        </div>
                        
                        {med.status === 'ACTIVE' && (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleLog(med.id, 'TAKEN')}
                                    className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg hover:bg-green-200 flex items-center justify-center gap-2"
                                >
                                    <Check size={18} /> Took It
                                </button>
                                <button 
                                    onClick={() => handleLog(med.id, 'MISSED')}
                                    className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 flex items-center justify-center gap-2"
                                >
                                    <X size={18} /> Missed
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {medications.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Pill className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500">No medications tracked</p>
                </div>
            )}
        </div>
    );
}

// =============================================================================
// MOOD TAB
// =============================================================================
function MoodTab({ moods, onAdd }: { moods: WellnessMood[], onAdd: () => void, onRefresh?: () => void }) {
    const getMoodEmoji = (score: number) => {
        if (score >= 9) return '😊';
        if (score >= 7) return '🙂';
        if (score >= 5) return '😐';
        if (score >= 3) return '😔';
        return '😢';
    };

    const avgMood = moods.length > 0 
        ? Math.round(moods.reduce((sum, m) => sum + m.moodScore, 0) / moods.length * 10) / 10 
        : null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Mood & Energy</h2>
                    {avgMood && <p className="text-sm text-gray-500">Average: {avgMood}/10</p>}
                </div>
                <button 
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                >
                    <Plus size={20} /> Log Mood
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {moods.slice(0, 14).map((mood) => (
                    <div key={mood.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{getMoodEmoji(mood.moodScore)}</span>
                            <div>
                                <p className="font-bold">{mood.moodScore}/10</p>
                                <p className="text-xs text-gray-500">{new Date(mood.recordedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        {mood.stressLevel !== null && (
                            <p className="text-xs text-gray-500">Stress: {mood.stressLevel}/10</p>
                        )}
                        {mood.notes && <p className="text-sm text-gray-600 mt-2">{mood.notes}</p>}
                    </div>
                ))}
            </div>

            {moods.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Brain className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500">No mood entries yet</p>
                </div>
            )}
        </div>
    );
}

// =============================================================================
// SLEEP TAB
// =============================================================================
function SleepTab({ sleep, onAdd }: { sleep: WellnessSleep[], onAdd: () => void, onRefresh?: () => void }) {
    const formatDuration = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    const avgSleep = sleep.length > 0 
        ? Math.round(sleep.filter(s => s.duration).reduce((sum, s) => sum + (s.duration || 0), 0) / sleep.filter(s => s.duration).length)
        : null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Sleep Tracker</h2>
                    {avgSleep && <p className="text-sm text-gray-500">Average: {formatDuration(avgSleep)}</p>}
                </div>
                <button 
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                    <Plus size={20} /> Log Sleep
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sleep.slice(0, 14).map((s) => (
                    <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <MoonIcon className="text-indigo-500" size={24} />
                            <div>
                                <p className="font-bold">{s.duration ? formatDuration(s.duration) : '--'}</p>
                                <p className="text-xs text-gray-500">{new Date(s.recordedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        {s.quality && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Quality:</span>
                                <span className="text-sm font-medium">{s.quality}/10</span>
                            </div>
                        )}
                        {s.notes && <p className="text-sm text-gray-600 mt-2">{s.notes}</p>}
                    </div>
                ))}
            </div>

            {sleep.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <MoonIcon className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500">No sleep entries yet</p>
                </div>
            )}
        </div>
    );
}

// =============================================================================
// SYMPTOMS TAB
// =============================================================================
function SymptomsTab({ symptoms, onAdd }: { symptoms: WellnessSymptom[], onAdd: () => void, onRefresh?: () => void }) {
    const getSeverityColor = (severity: number) => {
        if (severity >= 7) return 'bg-red-100 text-red-700';
        if (severity >= 4) return 'bg-yellow-100 text-yellow-700';
        return 'bg-green-100 text-green-700';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Symptom Tracker</h2>
                    {symptoms.length > 0 && (
                        <p className="text-sm text-gray-500">
                            {symptoms.filter(s => s.severity >= 7).length} severe in last 30 days
                        </p>
                    )}
                </div>
                <button 
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                >
                    <Plus size={20} /> Log Symptom
                </button>
            </div>

            <div className="space-y-3">
                {symptoms.slice(0, 20).map((symptom) => (
                    <div key={symptom.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-gray-800">{symptom.symptom}</h3>
                                <p className="text-sm text-gray-500">
                                    {new Date(symptom.recordedAt).toLocaleDateString()}
                                    {symptom.location && ` • ${symptom.location}`}
                                </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-sm ${getSeverityColor(symptom.severity)}`}>
                                {symptom.severity}/10
                            </span>
                        </div>
                        {symptom.notes && <p className="text-sm text-gray-600 mt-2">{symptom.notes}</p>}
                    </div>
                ))}
            </div>

            {symptoms.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <AlertCircle className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500">No symptoms logged</p>
                </div>
            )}
        </div>
    );
}

// =============================================================================
// MODALS
// =============================================================================
function GoalModal({ onClose, onSave }: { onClose: () => void, onSave: () => void }) {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        try {
            await wellnessService.createGoal({
                description: formData.get('description') as string,
                category: formData.get('category') as string,
                targetValue: Number(formData.get('targetValue')),
                unit: formData.get('unit') as string,
                frequency: formData.get('frequency') as string
            });
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">New Habit</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <input name="description" required className="w-full border rounded-lg p-2" placeholder="e.g. Drink water" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select name="category" className="w-full border rounded-lg p-2">
                                <option>General</option>
                                <option>Nutrition</option>
                                <option>Fitness</option>
                                <option>Mental</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Frequency</label>
                            <select name="frequency" className="w-full border rounded-lg p-2">
                                <option value="DAILY">Daily</option>
                                <option value="WEEKLY">Weekly</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Target</label>
                            <input name="targetValue" type="number" min="1" defaultValue="1" className="w-full border rounded-lg p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Unit</label>
                            <input name="unit" defaultValue="times" className="w-full border rounded-lg p-2" />
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg">Cancel</button>
                        <button type="submit" className="flex-1 py-2 bg-sky-500 text-white rounded-lg">Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function VitalsModal({ onClose, onSave }: { onClose: () => void, onSave: () => void }) {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const type = formData.get('type') as string;
        
        const data: any = {
            type,
            value: Number(formData.get('value')),
            unit: formData.get('unit') as string
        };

        if (type === 'BLOOD_PRESSURE') {
            data.value2 = Number(formData.get('value2'));
        }

        try {
            await wellnessService.recordVitals(data);
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">Record Vitals</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select name="type" className="w-full border rounded-lg p-2">
                            <option value="BLOOD_PRESSURE">Blood Pressure</option>
                            <option value="HEART_RATE">Heart Rate</option>
                            <option value="WEIGHT">Weight</option>
                            <option value="GLUCOSE">Blood Glucose</option>
                            <option value="TEMPERATURE">Temperature</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Value</label>
                            <input name="value" type="number" step="0.1" required className="w-full border rounded-lg p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Diastolic (BP)</label>
                            <input name="value2" type="number" className="w-full border rounded-lg p-2" placeholder="Optional" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Unit</label>
                        <select name="unit" className="w-full border rounded-lg p-2">
                            <option value="mmHg">mmHg (BP)</option>
                            <option value="bpm">bpm (HR)</option>
                            <option value="kg">kg</option>
                            <option value="lbs">lbs</option>
                            <option value="mg/dL">mg/dL (Glucose)</option>
                            <option value="°F">°F</option>
                        </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg">Cancel</button>
                        <button type="submit" className="flex-1 py-2 bg-red-600 text-white rounded-lg">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function MedicationModal({ onClose, onSave }: { onClose: () => void, onSave: () => void }) {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const times = (formData.get('times') as string).split(',').map(t => t.trim());
        
        try {
            await wellnessService.addMedication({
                name: formData.get('name') as string,
                dosage: formData.get('dosage') as string,
                frequency: formData.get('frequency') as string,
                times,
                instructions: formData.get('instructions') as string,
                startDate: new Date().toISOString()
            });
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">Add Medication</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Medication Name</label>
                        <input name="name" required className="w-full border rounded-lg p-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Dosage</label>
                            <input name="dosage" required className="w-full border rounded-lg p-2" placeholder="e.g. 500mg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Frequency</label>
                            <select name="frequency" className="w-full border rounded-lg p-2">
                                <option value="ONCE_DAILY">Once Daily</option>
                                <option value="TWICE_DAILY">Twice Daily</option>
                                <option value="THREE_TIMES_DAILY">3x Daily</option>
                                <option value="WEEKLY">Weekly</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Times (comma separated)</label>
                        <input name="times" required className="w-full border rounded-lg p-2" placeholder="08:00, 20:00" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Instructions (optional)</label>
                        <input name="instructions" className="w-full border rounded-lg p-2" placeholder="e.g. Take with food" />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg">Cancel</button>
                        <button type="submit" className="flex-1 py-2 bg-purple-600 text-white rounded-lg">Add</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function MoodModal({ onClose, onSave }: { onClose: () => void, onSave: () => void }) {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        try {
            await wellnessService.recordMood({
                moodScore: Number(formData.get('moodScore')),
                stressLevel: formData.get('stressLevel') ? Number(formData.get('stressLevel')) : undefined,
                energyLevel: formData.get('energyLevel') ? Number(formData.get('energyLevel')) : undefined,
                notes: formData.get('notes') as string
            });
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">How are you feeling?</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Mood (1-10)</label>
                        <input name="moodScore" type="range" min="1" max="10" defaultValue="5" className="w-full" />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>😢</span>
                            <span>😐</span>
                            <span>😊</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Stress Level (optional)</label>
                        <input name="stressLevel" type="range" min="1" max="10" defaultValue="5" className="w-full" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                        <textarea name="notes" className="w-full border rounded-lg p-2" rows={3} placeholder="How's your day going?" />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg">Cancel</button>
                        <button type="submit" className="flex-1 py-2 bg-yellow-500 text-white rounded-lg">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SleepModal({ onClose, onSave }: { onClose: () => void, onSave: () => void }) {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        try {
            await wellnessService.recordSleep({
                bedtime: formData.get('bedtime') as string,
                wakeTime: formData.get('wakeTime') as string,
                quality: formData.get('quality') ? Number(formData.get('quality')) : undefined,
                notes: formData.get('notes') as string
            });
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">Log Sleep</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Bedtime</label>
                            <input name="bedtime" type="datetime-local" required className="w-full border rounded-lg p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Wake Time</label>
                            <input name="wakeTime" type="datetime-local" required className="w-full border rounded-lg p-2" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Sleep Quality (1-10)</label>
                        <input name="quality" type="range" min="1" max="10" defaultValue="7" className="w-full" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                        <textarea name="notes" className="w-full border rounded-lg p-2" rows={2} />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg">Cancel</button>
                        <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SymptomModal({ onClose, onSave }: { onClose: () => void, onSave: () => void }) {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        try {
            await wellnessService.recordSymptom({
                symptom: formData.get('symptom') as string,
                severity: Number(formData.get('severity')),
                frequency: formData.get('frequency') as string,
                location: formData.get('location') as string,
                notes: formData.get('notes') as string
            });
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">Log Symptom</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Symptom</label>
                        <input name="symptom" required className="w-full border rounded-lg p-2" placeholder="e.g. Headache" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Severity (1-10)</label>
                            <input name="severity" type="range" min="1" max="10" defaultValue="5" className="w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Frequency</label>
                            <select name="frequency" className="w-full border rounded-lg p-2">
                                <option value="OCCASIONAL">Occasional</option>
                                <option value="FREQUENT">Frequent</option>
                                <option value="CONSTANT">Constant</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Location (optional)</label>
                        <input name="location" className="w-full border rounded-lg p-2" placeholder="e.g. Left side of head" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <textarea name="notes" className="w-full border rounded-lg p-2" rows={2} />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg">Cancel</button>
                        <button type="submit" className="flex-1 py-2 bg-orange-600 text-white rounded-lg">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default WellnessDashboard;
