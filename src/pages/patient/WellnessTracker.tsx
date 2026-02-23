
import { useState, useEffect } from 'react';
import { wellnessService } from '../../services/wellness.service';
import type { WellnessGoal } from '../../services/wellness.service';
import { Plus, Flame, Trophy, CheckCircle, Activity, Droplets, Moon, Brain, Apple } from 'lucide-react';
import confetti from 'canvas-confetti';

const WellnessTracker = () => {
    const [goals, setGoals] = useState<WellnessGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Form State
    const [newGoal, setNewGoal] = useState({
        description: '',
        category: 'General',
        targetValue: 1,
        unit: 'times',
        frequency: 'DAILY'
    });

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const data = await wellnessService.getGoals();
            setGoals(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (goal: WellnessGoal) => {
        try {
            // Optimistic update
            const updatedGoals = goals.map(g => {
                if (g.id === goal.id) {
                    const newVal = g.currentValue + 1;
                    return { ...g, currentValue: newVal };
                }
                return g;
            });
            setGoals(updatedGoals);

            // API Call
            const res = await wellnessService.checkIn(goal.id, 1);
            
            // Sync with server response (which has updated streak logic)
            setGoals(prev => prev.map(g => g.id === goal.id ? res : g));

            // Celebration if target hit
            if (res.currentValue >= res.targetValue && goal.currentValue < goal.targetValue) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        } catch (err) {
            console.error(err);
            fetchGoals(); // Revert on error
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await wellnessService.createGoal(newGoal);
            setShowModal(false);
            fetchGoals();
            setNewGoal({ description: '', category: 'General', targetValue: 1, unit: 'times', frequency: 'DAILY' });
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (category: string) => {
        switch (category) {
            case 'Nutrition': return <Apple className="text-green-500" />;
            case 'Fitness': return <Activity className="text-blue-500" />;
            case 'Mental': return <Brain className="text-teal-500" />;
            case 'Sleep': return <Moon className="text-indigo-500" />;
            case 'Hydration': return <Droplets className="text-cyan-500" />;
            default: return <CheckCircle className="text-gray-500" />;
        }
    };

    if (loading) return <div className="p-6">Loading wellness tracker...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Wellness & Habits</h1>
                    <p className="text-gray-500">Track your daily progress and build healthy streaks.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                    <Plus size={20} /> New Habit
                </button>
            </div>

            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                        <Flame size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Active Streaks</p>
                        <p className="text-xl font-bold">{goals.filter(g => g.streak > 0).length}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                        <Trophy size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Completed Today</p>
                        <p className="text-xl font-bold">
                            {goals.filter(g => g.currentValue >= g.targetValue).length} / {goals.length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map(goal => {
                    const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
                    const isCompleted = goal.currentValue >= goal.targetValue;

                    return (
                        <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
                            
                            {/* Streak Badge */}
                            <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                                <Flame size={12} className="fill-current" />
                                {goal.streak} Day Streak
                            </div>

                            <div className="flex items-start gap-4 mb-4">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    {getIcon(goal.category)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{goal.description}</h3>
                                    <p className="text-xs text-gray-500">{goal.category} • {goal.frequency}</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Progress</span>
                                    <span className="font-bold">{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => handleCheckIn(goal)}
                                    disabled={isCompleted}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                                        ${isCompleted 
                                            ? 'bg-green-100 text-green-700 cursor-default' 
                                            : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-95'}
                                    `}
                                >
                                    {isCompleted ? (
                                        <>Done <CheckCircle size={16} /></>
                                    ) : (
                                        <>+ Check In</>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}

                {/* Empty State */}
                {goals.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                        <p>No habits tracked yet. Start your journey!</p>
                        <button onClick={() => setShowModal(true)} className="mt-4 text-blue-600 font-medium hover:underline">
                            + Create your first habit
                        </button>
                    </div>
                )}
            </div>

            {/* Create Logic Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">New Habit</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Habit Description</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full border rounded-lg p-2"
                                    placeholder="e.g. Drink Water, Read Book"
                                    value={newGoal.description}
                                    onChange={e => setNewGoal({...newGoal, description: e.target.value})}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select 
                                        className="w-full border rounded-lg p-2"
                                        value={newGoal.category}
                                        onChange={e => setNewGoal({...newGoal, category: e.target.value})}
                                    >
                                        <option>General</option>
                                        <option>Nutrition</option>
                                        <option>Fitness</option>
                                        <option>Mental</option>
                                        <option>Sleep</option>
                                        <option>Hydration</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Daily Target</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="number" 
                                            min="1"
                                            className="w-20 border rounded-lg p-2"
                                            value={newGoal.targetValue}
                                            onChange={e => setNewGoal({...newGoal, targetValue: Number(e.target.value)})}
                                        />
                                        <input 
                                            type="text" 
                                            className="flex-1 border rounded-lg p-2"
                                            placeholder="Unit (times)"
                                            value={newGoal.unit}
                                            onChange={e => setNewGoal({...newGoal, unit: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 mt-2">
                                Start Habit
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WellnessTracker;
