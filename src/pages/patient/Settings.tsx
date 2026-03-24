import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Save, AlertCircle, CheckCircle, Heart, Users, Plus, Trash2, Shield } from 'lucide-react';
import { PatientService } from '../../services/patient.service';

const PatientSettings = () => {
    const { token, login, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'emergency' | 'family' | 'insurance'>('profile');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form States
    const [profile, setProfile] = useState<any>({});
    const [emergency, setEmergency] = useState<any>({});
    const [dependents, setDependents] = useState<any[]>([]);
    
    // Insurance State
    const [insurances, setInsurances] = useState<any[]>([]);
    const [showAddInsurance, setShowAddInsurance] = useState(false);
    const [newInsurance, setNewInsurance] = useState({ provider: '', planName: '', policyNumber: '', groupNumber: '', coveragePercentage: 100, validFrom: '', validUntil: '' });
    const [showAddDependent, setShowAddDependent] = useState(false);
    const [newDependent, setNewDependent] = useState({ firstName: '', lastName: '', relationship: '', gender: 'MALE', dob: '' });

    useEffect(() => {
        if (!token) return;
        fetchAllData();
    }, [token]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [profileData, dependentsList, insuranceList] = await Promise.all([
                 PatientService.getProfile(), // Should return user info + emergency profile
                 PatientService.getDependents().catch(() => []),
                 PatientService.getInsurancePolicies().catch(() => [])
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
            setInsurances(insuranceList);
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
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to update profile. Please try again.';
            setMessage({ type: 'error', text: errorMsg });
        }
    };

    const handleEmergencyUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        try {
            await PatientService.updateEmergencyProfile(emergency);
            setMessage({ type: 'success', text: 'Emergency contact updated successfully!' });
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to update emergency contact. Please try again.';
            setMessage({ type: 'error', text: errorMsg });
        }
    };

    const handleAddDependent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Validate DOB
            if (!newDependent.dob) {
                setMessage({ type: 'error', text: 'Please select a date of birth.' });
                return;
            }
            
            const dobDate = new Date(newDependent.dob);
            const today = new Date();
            if (dobDate >= today) {
                setMessage({ type: 'error', text: 'Date of birth must be in the past.' });
                return;
            }
            
            await PatientService.addDependent(newDependent);
            setNewDependent({ firstName: '', lastName: '', relationship: '', gender: 'MALE', dob: '' });
            setShowAddDependent(false);
            const refresh = await PatientService.getDependents();
            setDependents(refresh);
            setMessage({ type: 'success', text: 'Family member added successfully!' });
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to add family member. Please check the form and try again.';
            setMessage({ type: 'error', text: errorMsg });
        }
    };

    const handleRemoveDependent = async (id: string) => {
        if(!confirm('Are you sure you want to remove this family member?')) return;
        try {
            await PatientService.removeDependent(id);
             const refresh = await PatientService.getDependents();
            setDependents(refresh);
             setMessage({ type: 'success', text: 'Family member removed successfully.' });
        } catch (error: any) {
             const errorMsg = error.response?.data?.message || 'Failed to remove family member. Please try again.';
             setMessage({ type: 'error', text: errorMsg });
        }
    };

    const handleAddInsurance = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await PatientService.addInsurancePolicy(newInsurance);
            setNewInsurance({ provider: '', planName: '', policyNumber: '', groupNumber: '', coveragePercentage: 100, validFrom: '', validUntil: '' });
            setShowAddInsurance(false);
            const refresh = await PatientService.getInsurancePolicies();
            setInsurances(refresh);
            setMessage({ type: 'success', text: 'Insurance policy added successfully!' });
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to add insurance. Please try again.';
            setMessage({ type: 'error', text: errorMsg });
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
                    className={`pb-4 px-6 font-medium text-sm transition-colors relative ${activeTab === 'profile' ? 'text-sky-500' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <span className="flex items-center gap-2"><User className="w-4 h-4" /> Personal Info</span>
                    {activeTab === 'profile' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-500 rounded-t-full"></div>}
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
                <button 
                    onClick={() => setActiveTab('insurance')}
                    className={`pb-4 px-6 font-medium text-sm transition-colors relative ${activeTab === 'insurance' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Insurance</span>
                    {activeTab === 'insurance' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
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
                                <input type="text" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Last Name</label>
                                <input type="text" value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <input type="email" value={profile.email} disabled className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Phone</label>
                                <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none" />
                            </div>
                             <div className="span-full md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-gray-700">Address</label>
                                <input type="text" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none" />
                            </div>
                        </div>
                        <div className="pt-4">
                            <button type="submit" className="bg-sky-500 text-white px-6 py-2.5 rounded-lg hover:bg-sky-600 font-medium flex items-center gap-2 transition-colors">
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

            {/* Insurance Tab */}
            {activeTab === 'insurance' && (
                <InsuranceTab 
                    insurances={insurances} 
                    showAddInsurance={showAddInsurance} 
                    setShowAddInsurance={setShowAddInsurance}
                    newInsurance={newInsurance}
                    setNewInsurance={setNewInsurance}
                    handleAddInsurance={handleAddInsurance}
                />
            )}
        </div>
    );
};

export default PatientSettings;

// Insurance Tab Component
const InsuranceTab = ({ insurances, showAddInsurance, setShowAddInsurance, newInsurance, setNewInsurance, handleAddInsurance }: any) => {
    const statusColors: any = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        ACTIVE: 'bg-green-100 text-green-800',
        VERIFIED: 'bg-blue-100 text-blue-800',
        REJECTED: 'bg-red-100 text-red-800',
        EXPIRED: 'bg-gray-100 text-gray-800',
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-gray-900">My Insurance Policies</h3>
                    <p className="text-gray-500 text-sm">Manage your health insurance coverage.</p>
                </div>
                <button onClick={() => setShowAddInsurance(!showAddInsurance)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium text-sm flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /> Add Insurance
                </button>
            </div>

            {showAddInsurance && (
                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 animate-slideDown">
                    <h4 className="font-bold text-indigo-900 mb-4">Add New Insurance Policy</h4>
                    <form onSubmit={handleAddInsurance} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input required type="text" placeholder="Insurance Provider (e.g., NHIS, Hygeia)" value={newInsurance.provider} onChange={e => setNewInsurance({...newInsurance, provider: e.target.value})} className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input type="text" placeholder="Plan Name (e.g., Gold, Silver)" value={newInsurance.planName} onChange={e => setNewInsurance({...newInsurance, planName: e.target.value})} className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input required type="text" placeholder="Policy Number" value={newInsurance.policyNumber} onChange={e => setNewInsurance({...newInsurance, policyNumber: e.target.value})} className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input type="text" placeholder="Group Number" value={newInsurance.groupNumber} onChange={e => setNewInsurance({...newInsurance, groupNumber: e.target.value})} className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input required type="number" placeholder="Coverage %" value={newInsurance.coveragePercentage} onChange={e => setNewInsurance({...newInsurance, coveragePercentage: parseInt(e.target.value)})} className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500" min="0" max="100" />
                        <input required type="date" placeholder="Valid From" value={newInsurance.validFrom} onChange={e => setNewInsurance({...newInsurance, validFrom: e.target.value})} className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input required type="date" placeholder="Valid Until" value={newInsurance.validUntil} onChange={e => setNewInsurance({...newInsurance, validUntil: e.target.value})} className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        
                        <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setShowAddInsurance(false)} className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium">Cancel</button>
                            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">Add Policy</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insurances.length > 0 ? (
                    insurances.map((ins: any) => (
                        <div key={ins.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{ins.provider}</h4>
                                        <p className="text-sm text-gray-500">{ins.planName || 'Standard Plan'}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ins.status] || 'bg-gray-100 text-gray-800'}`}>
                                    {ins.status}
                                </span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Policy Number</span>
                                    <span className="font-medium text-gray-900">{ins.policyNumber}</span>
                                </div>
                                {ins.groupNumber && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Group Number</span>
                                        <span className="font-medium text-gray-900">{ins.groupNumber}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Coverage</span>
                                    <span className="font-medium text-gray-900">{ins.coveragePercentage || 100}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Valid Until</span>
                                    <span className="font-medium text-gray-900">{ins.validUntil ? new Date(ins.validUntil).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full p-8 text-center bg-white border border-dashed border-gray-200 rounded-xl text-gray-500">
                        <Shield className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                        No insurance policies added yet.
                    </div>
                )}
            </div>
        </div>
    );
};
