import { Role } from '../constants/roles';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Save, AlertCircle, CheckCircle, Calendar, DollarSign, Lock, Eye, EyeOff } from 'lucide-react';
import PatientSettings from './patient/Settings';
import MyLeaves from '../components/MyLeaves';
import MyPayslips from '../components/MyPayslips';

const Settings = () => {
    const { user, token, login } = useAuth();
    
    if (user?.role === Role.PATIENT) {
        return <PatientSettings />;
    }

    const [activeTab, setActiveTab] = useState('PROFILE');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });
    // Password change state
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    // ... rest of existing code for Staff ...
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const res = await axios.patch(`${API_URL}/auth/profile`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update Auth Context
            if (res.data.user && token) {
                // Preserve other fields like role/id that might not be in response or just spread
                const updatedUser = { ...user, ...res.data.user };
                login(token, updatedUser);
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err: any) {
            console.error(err);
            setMessage({ 
                type: 'error', 
                text: err.response?.data?.message || 'Failed to update profile.' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            setLoading(false);
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
            setLoading(false);
            return;
        }

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            await axios.post(`${API_URL}/auth/change-password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            console.error(err);
            setMessage({ 
                type: 'error', 
                text: err.response?.data?.message || 'Failed to change password.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h2>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center text-sky-500 font-bold text-3xl">
                        {formData.firstName?.[0]}{formData.lastName?.[0]}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{formData.firstName} {formData.lastName}</h3>
                        <p className="text-gray-500">{user?.role}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button 
                        onClick={() => setActiveTab('PROFILE')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'PROFILE' ? 'border-sky-500 text-sky-500' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <User className="w-4 h-4" /> Profile
                    </button>
                    <button 
                        onClick={() => setActiveTab('SECURITY')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'SECURITY' ? 'border-sky-500 text-sky-500' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Lock className="w-4 h-4" /> Security
                    </button>
                    {(user?.role !== Role.PATIENT && user?.role !== Role.ADMIN) && (
                        <>
                            <button 
                                onClick={() => setActiveTab('LEAVES')}
                                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'LEAVES' ? 'border-sky-500 text-sky-500' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                <Calendar className="w-4 h-4" /> My Leaves
                            </button>
                            <button 
                                onClick={() => setActiveTab('PAYROLL')}
                                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'PAYROLL' ? 'border-sky-500 text-sky-500' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                <DollarSign className="w-4 h-4" /> My Payslips
                            </button>
                        </>
                    )}
                </div>

                {activeTab === 'LEAVES' && <MyLeaves />}
                {activeTab === 'PAYROLL' && <MyPayslips />}

                {activeTab === 'SECURITY' && (
                <>
                {message && (
                    <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${
                        message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/ >}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Current Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                className="w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type={showNewPassword ? "text" : "password"}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                className="w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">Minimum 8 characters</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type={showNewPassword ? "text" : "password"}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <Lock className="w-5 h-5" />
                            {loading ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </form>
                </>
                )}

                {activeTab === 'PROFILE' && (
                <>
                {message && (
                    <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${
                        message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">First Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Last Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                    </form>
                </>
                )}
            </div>
        </div>
    );
};
export default Settings;
