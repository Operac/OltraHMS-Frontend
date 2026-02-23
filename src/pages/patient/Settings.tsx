import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Save, AlertCircle, CheckCircle, Heart, Users, Plus, Trash2 } from 'lucide-react';
import { PatientService } from '../../services/patient.service';

const PatientSettings = () => {
    const { token, login, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'emergency' | 'family'>('profile');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form States
    const [profile, setProfile] = useState<any>({});
    const [emergency, setEmergency] = useState<any>({});
    const [dependents, setDependents] = useState<any[]>([]);
    
    // Dependent Form State
    const [newDependent, setNewDependent] = useState({ firstName: '', lastName: '', relationship: '', gender: 'MALE', dob: '' });
    const [showAddDependent, setShowAddDependent] = useState(false);

    useEffect(() => {
        if (!token) return;
        fetchAllData();
    }, [token]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [profileData, dependentsList] = await Promise.all([
                 PatientService.getProfile(), // Should return user info + emergency profile
                 PatientService.getDependents().catch(() => []) 
            ]);

            setProfile({
                firstName: profileData.firstName || '',
                lastName: profileData.lastName || '',
                email: profileData.email || '',
                phone: profileData.phone || '',
                address: profileData.address || '',
                bloodGroup: profileData.bloodGroup || '', // Often on patient profile
                genotype: profileData.genotype || '',
            });

            // If emergency data is nested or separate, adjust here. 
            // Assuming getEmergencyProfile returns specific fields or they are on main profile
            setEmergency({
                emergencyContactName: profileData.emergencyContact?.name || '',
                emergencyContactPhone: profileData.emergencyContact?.phone || '',
                allergies: profileData.allergies || '',
                medications: profileData.medications || '' // Medical notes sometimes here
            });
            
            setDependents(dependentsList);
        } catch (error) {
            console.error("Failed to load settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        try {
            const updated = await PatientService.updateProfile(profile);
            
            // Update Auth Context if basic info changed
            if (user) {
                login(token!, { ...user, ...updated.user }); // careful with matching user shape
            }
            setMessage({ type: 'success', text: 'Profile updated successfully.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        }
    };

    const handleEmergencyUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        try {
            await PatientService.updateEmergencyProfile(emergency);
            setMessage({ type: 'success', text: 'Emergency profile updated.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update emergency info.' });
        }
    };

    const handleAddDependent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await PatientService.addDependent(newDependent);
            setNewDependent({ firstName: '', lastName: '', relationship: '', gender: 'MALE', dob: '' });
            setShowAddDependent(false);
            const refresh = await PatientService.getDependents();
            setDependents(refresh);
            setMessage({ type: 'success', text: 'Family member added.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to add dependent.' });
        }
    };

    const handleRemoveDependent = async (id: string) => {
        if(!confirm('Remove this family member?')) return;
        try {
            await PatientService.removeDependent(id);
             const refresh = await PatientService.getDependents();
            setDependents(refresh);
             setMessage({ type: 'success', text: 'Family member removed.' });
        } catch (error) {
             setMessage({ type: 'error', text: 'Failed to remove dependent.' });
        }
    };

    if (loading) return <div className="p-10 text-center">Loading settings...</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h1>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-8">
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`pb-4 px-6 font-medium text-sm transition-colors relative ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <span className="flex items-center gap-2"><User className="w-4 h-4" /> Personal Info</span>
                    {activeTab === 'profile' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('emergency')}
                    className={`pb-4 px-6 font-medium text-sm transition-colors relative ${activeTab === 'emergency' ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <span className="flex items-center gap-2"><Heart className="w-4 h-4" /> Emergency Profile</span>
                    {activeTab === 'emergency' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('family')}
                    className={`pb-4 px-6 font-medium text-sm transition-colors relative ${activeTab === 'family' ? 'text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Family & Dependents</span>
                    {activeTab === 'family' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 rounded-t-full"></div>}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
                    {message.text}
                </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 animate-fadeIn">
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">First Name</label>
                                <input type="text" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Last Name</label>
                                <input type="text" value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <input type="email" value={profile.email} disabled className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Phone</label>
                                <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                             <div className="span-full md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-gray-700">Address</label>
                                <input type="text" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>
                        <div className="pt-4">
                            <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 transition-colors">
                                <Save className="w-4 h-4" /> Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Emergency Tab */}
             {activeTab === 'emergency' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 animate-fadeIn">
                     <form onSubmit={handleEmergencyUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Blood Group</label>
                                <select value={profile.bloodGroup} onChange={e => setProfile({...profile, bloodGroup: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white">
                                    <option value="">Select Group</option>
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Genotype</label>
                                <select value={profile.genotype} onChange={e => setProfile({...profile, genotype: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white">
                                    <option value="">Select Genotype</option>
                                    {['AA', 'AS', 'SS', 'AC', 'SC'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-gray-700">Allergies / Medical Notes</label>
                                <textarea 
                                    value={emergency.allergies} 
                                    onChange={e => setEmergency({...emergency, allergies: e.target.value})} 
                                    placeholder="List any known allergies or critical medical conditions..."
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none h-24 resize-none"
                                ></textarea>
                            </div>
                             <div className="md:col-span-2 border-t pt-6">
                                <h4 className="font-semibold text-gray-900 mb-4">Emergency Contact</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Contact Name</label>
                                        <input type="text" value={emergency.emergencyContactName} onChange={e => setEmergency({...emergency, emergencyContactName: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Contact Phone</label>
                                        <input type="tel" value={emergency.emergencyContactPhone} onChange={e => setEmergency({...emergency, emergencyContactPhone: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pt-4">
                            <button type="submit" className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 font-medium flex items-center gap-2 transition-colors">
                                <Save className="w-4 h-4" /> Save Emergency Profile
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Family Tab */}
            {activeTab === 'family' && (
                <div className="space-y-6 animate-fadeIn">
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-gray-900">Registered Dependents</h3>
                            <p className="text-gray-500 text-sm">Family members linked to your insurance/account.</p>
                        </div>
                        <button onClick={() => setShowAddDependent(!showAddDependent)} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-medium text-sm flex items-center gap-2 transition-colors">
                            <Plus className="w-4 h-4" /> Add Member
                        </button>
                    </div>

                    {showAddDependent && (
                        <div className="bg-teal-50 p-6 rounded-xl border border-teal-100 animate-slideDown">
                            <h4 className="font-bold text-teal-900 mb-4">Add New Dependent</h4>
                            <form onSubmit={handleAddDependent} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input required type="text" placeholder="First Name" value={newDependent.firstName} onChange={e => setNewDependent({...newDependent, firstName: e.target.value})} className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                <input required type="text" placeholder="Last Name" value={newDependent.lastName} onChange={e => setNewDependent({...newDependent, lastName: e.target.value})} className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                <select required value={newDependent.relationship} onChange={e => setNewDependent({...newDependent, relationship: e.target.value})} className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                                    <option value="">Relationship</option>
                                    <option value="SPOUSE">Spouse</option>
                                    <option value="CHILD">Child</option>
                                    <option value="PARENT">Parent</option>
                                    <option value="SIBLING">Sibling</option>
                                    <option value="OTHER">Other</option>
                                </select>
                                <select value={newDependent.gender} onChange={e => setNewDependent({...newDependent, gender: e.target.value})} className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                </select>
                                <input required type="date" value={newDependent.dob} onChange={e => setNewDependent({...newDependent, dob: e.target.value})} className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                
                                <div className="md:col-span-3 flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => setShowAddDependent(false)} className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium">Cancel</button>
                                    <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 text-sm font-medium">Add Dependent</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dependents.length > 0 ? (
                            dependents.map((dep) => (
                                <div key={dep.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 font-bold text-lg">
                                            {dep.firstName[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{dep.firstName} {dep.lastName}</h4>
                                            <p className="text-sm text-gray-500 capitalize">{dep.relationship?.toLowerCase()} • {dep.gender === 'MALE' ? 'Male' : 'Female'}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveDependent(dep.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        ) : (
                             <div className="col-span-full p-8 text-center bg-white border border-dashed border-gray-200 rounded-xl text-gray-500">
                                <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                No family members added yet.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientSettings;
