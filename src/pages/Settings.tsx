import { useState, useEffect } from 'react';
import { Role } from '../constants/roles';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Save, AlertCircle, CheckCircle, Calendar, DollarSign, Lock, Eye, EyeOff, Shield, Smartphone, Copy, RefreshCw } from 'lucide-react';
import PatientSettings from './patient/Settings';
import MyLeaves from '../components/MyLeaves';
import MyPayslips from '../components/MyPayslips';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const StaffSettings = () => {
    const { user, token, login } = useAuth();
    const [activeTab, setActiveTab] = useState('PROFILE');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // 2FA state
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [twoFASetup, setTwoFASetup] = useState<{ secret: string; qrUrl: string } | null>(null);
    const [twoFACode, setTwoFACode] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [twoFALoading, setTwoFALoading] = useState(false);
    const [disableCode, setDisableCode] = useState('');
    const [showDisableForm, setShowDisableForm] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || ''
            });
            // Fetch 2FA status
            axios.get(`${API_URL}/auth/2fa/status`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                setTwoFAEnabled(res.data.twoFactorEnabled || false);
            }).catch(() => {});
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
            const res = await axios.patch(`${API_URL}/auth/profile`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.user && token) {
                login(token, { ...user, ...res.data.user });
            }
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        if (passwordData.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
            return;
        }
        setLoading(true);
        setMessage(null);
        try {
            await axios.post(`${API_URL}/auth/change-password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, { headers: { Authorization: `Bearer ${token}` } });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSetup2FA = async () => {
        setTwoFALoading(true);
        try {
            const res = await axios.post(`${API_URL}/auth/2fa/setup`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTwoFASetup({ secret: res.data.secret, qrUrl: res.data.qrUrl });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to setup 2FA');
        } finally {
            setTwoFALoading(false);
        }
    };

    const handleEnable2FA = async () => {
        if (!twoFACode || twoFACode.length !== 6) {
            toast.error('Enter the 6-digit code from your authenticator app');
            return;
        }
        setTwoFALoading(true);
        try {
            const res = await axios.post(`${API_URL}/auth/2fa/enable`, { code: twoFACode }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTwoFAEnabled(true);
            setTwoFASetup(null);
            setTwoFACode('');
            setBackupCodes(res.data.backupCodes || []);
            toast.success('Two-factor authentication enabled!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Invalid code. Please try again.');
        } finally {
            setTwoFALoading(false);
        }
    };

    const handleDisable2FA = async () => {
        setTwoFALoading(true);
        try {
            await axios.post(`${API_URL}/auth/2fa/disable`, { code: disableCode }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTwoFAEnabled(false);
            setShowDisableForm(false);
            setDisableCode('');
            toast.success('Two-factor authentication disabled');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to disable 2FA');
        } finally {
            setTwoFALoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const tabs = [
        { id: 'PROFILE', label: 'Profile', icon: User },
        { id: 'SECURITY', label: 'Security', icon: Lock },
        { id: '2FA', label: '2FA', icon: Shield },
        ...(user?.role !== Role.ADMIN ? [
            { id: 'LEAVES', label: 'My Leaves', icon: Calendar },
            { id: 'PAYROLL', label: 'My Payslips', icon: DollarSign },
        ] : []),
    ];

    return (
        <div className="p-4 sm:p-6 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h2>

            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-100 rounded-full flex items-center justify-center text-sky-500 font-bold text-2xl sm:text-3xl shrink-0">
                        {formData.firstName?.[0]}{formData.lastName?.[0]}
                    </div>
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{formData.firstName} {formData.lastName}</h3>
                        <p className="text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
                        {twoFAEnabled && (
                            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1">
                                <Shield className="w-3 h-3" /> 2FA Active
                            </span>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setMessage(null); }}
                                className={`px-3 sm:px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${activeTab === tab.id ? 'border-sky-500 text-sky-500' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                <Icon className="w-4 h-4" /> {tab.label}
                            </button>
                        );
                    })}
                </div>

                {message && activeTab !== 'LEAVES' && activeTab !== 'PAYROLL' && activeTab !== '2FA' && (
                    <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                        {message.text}
                    </div>
                )}

                {activeTab === 'LEAVES' && <MyLeaves />}
                {activeTab === 'PAYROLL' && <MyPayslips />}

                {activeTab === 'PROFILE' && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input type="text" name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Last Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input type="text" name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email address"
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none" />
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                            className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                            <Save className="w-5 h-5" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                )}

                {activeTab === 'SECURITY' && (
                    <form onSubmit={handlePasswordChange} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Current Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input type={showPassword ? 'text' : 'password'} value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                                    placeholder="Current password" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input type={showNewPassword ? 'text' : 'password'} value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                                    placeholder="New password (min 8 chars)" required />
                                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input type={showNewPassword ? 'text' : 'password'} value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                                    placeholder="Confirm new password" required />
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                            className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 font-medium flex items-center gap-2 disabled:opacity-50">
                            <Lock className="w-5 h-5" />
                            {loading ? 'Changing...' : 'Change Password'}
                        </button>
                    </form>
                )}

                {activeTab === '2FA' && (
                    <div className="space-y-6">
                        <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-start gap-3">
                                <Shield className={`w-6 h-6 mt-0.5 ${twoFAEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                                <div>
                                    <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {twoFAEnabled
                                            ? 'Your account is protected with 2FA. You will need your authenticator app to log in.'
                                            : 'Add an extra layer of security to your account using an authenticator app like Google Authenticator or Authy.'}
                                    </p>
                                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-2 ${twoFAEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {twoFAEnabled ? '● Enabled' : '○ Disabled'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Backup codes shown after enabling */}
                        {backupCodes.length > 0 && (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> Save your backup codes
                                </h4>
                                <p className="text-xs text-yellow-700 mb-3">Store these codes somewhere safe. Each can only be used once to access your account if you lose your device.</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {backupCodes.map((code, i) => (
                                        <div key={i} className="font-mono text-sm bg-white border border-yellow-200 rounded px-3 py-1.5 text-center text-yellow-900">{code}</div>
                                    ))}
                                </div>
                                <button onClick={() => copyToClipboard(backupCodes.join('\n'))}
                                    className="mt-3 text-xs text-yellow-700 hover:text-yellow-900 flex items-center gap-1">
                                    <Copy className="w-3 h-3" /> Copy all codes
                                </button>
                            </div>
                        )}

                        {!twoFAEnabled && !twoFASetup && (
                            <button onClick={handleSetup2FA} disabled={twoFALoading}
                                className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 font-medium disabled:opacity-50">
                                <Smartphone className="w-4 h-4" />
                                {twoFALoading ? 'Setting up...' : 'Set Up 2FA'}
                            </button>
                        )}

                        {!twoFAEnabled && twoFASetup && (
                            <div className="space-y-4">
                                <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl">
                                    <h4 className="font-semibold text-sky-800 mb-2">Step 1: Scan QR Code</h4>
                                    <p className="text-sm text-sky-700 mb-3">Open your authenticator app and scan this QR code, or enter the secret manually.</p>
                                    <div className="bg-white p-4 rounded-lg border border-sky-200 flex justify-center">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(twoFASetup.qrUrl)}`}
                                            alt="QR Code" className="w-44 h-44" />
                                    </div>
                                    <div className="mt-3">
                                        <p className="text-xs text-sky-700 mb-1">Or enter this secret manually:</p>
                                        <div className="flex items-center gap-2">
                                            <code className="text-sm bg-white border border-sky-200 rounded px-3 py-1.5 font-mono text-sky-900 flex-1 break-all">{twoFASetup.secret}</code>
                                            <button onClick={() => copyToClipboard(twoFASetup.secret)}
                                                className="p-2 text-sky-600 hover:text-sky-800 shrink-0">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                    <h4 className="font-semibold text-gray-800 mb-2">Step 2: Enter Verification Code</h4>
                                    <p className="text-sm text-gray-600 mb-3">Enter the 6-digit code shown in your authenticator app.</p>
                                    <div className="flex gap-3">
                                        <input type="text" inputMode="numeric" maxLength={6} value={twoFACode}
                                            onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                                            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none font-mono text-lg tracking-widest text-center"
                                            placeholder="000000" />
                                        <button onClick={handleEnable2FA} disabled={twoFALoading || twoFACode.length !== 6}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            {twoFALoading ? 'Verifying...' : 'Enable 2FA'}
                                        </button>
                                    </div>
                                </div>

                                <button onClick={() => { setTwoFASetup(null); setTwoFACode(''); }}
                                    className="text-sm text-gray-500 hover:text-gray-700">
                                    Cancel setup
                                </button>
                            </div>
                        )}

                        {twoFAEnabled && (
                            <div className="space-y-4">
                                <button onClick={() => setShowDisableForm(!showDisableForm)}
                                    className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors">
                                    <RefreshCw className="w-4 h-4" />
                                    Disable 2FA
                                </button>

                                {showDisableForm && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                                        <p className="text-sm text-red-700">Enter your current authenticator code or a backup code to disable 2FA.</p>
                                        <div className="flex gap-3">
                                            <input type="text" value={disableCode} onChange={(e) => setDisableCode(e.target.value)}
                                                className="flex-1 px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-400 outline-none font-mono tracking-widest"
                                                placeholder="Code or backup code" />
                                            <button onClick={handleDisable2FA} disabled={twoFALoading || !disableCode}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50">
                                                {twoFALoading ? 'Disabling...' : 'Confirm'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const Settings = () => {
    const { user } = useAuth();
    if (user?.role === Role.PATIENT) return <PatientSettings />;
    return <StaffSettings />;
};

export default Settings;
