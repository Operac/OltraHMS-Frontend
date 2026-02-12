import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Save, AlertCircle, CheckCircle } from 'lucide-react';

import PatientSettings from './patient/Settings';

const Settings = () => {
    const { user, token, login } = useAuth();
    
    if (user?.role === 'PATIENT') {
        return <PatientSettings />;
    }

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: ''
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
            const res = await axios.patch('http://localhost:3000/api/auth/profile', formData, {
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

    return (
        <div className="p-6 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h2>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-3xl">
                        {formData.firstName?.[0]}{formData.lastName?.[0]}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{formData.firstName} {formData.lastName}</h3>
                        <p className="text-gray-500">{user?.role}</p>
                    </div>
                </div>

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
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default Settings;
