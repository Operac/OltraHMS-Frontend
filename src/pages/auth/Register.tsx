import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, ArrowRight, Activity, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const response = await axios.post(`${API_URL}/auth/register`, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                role: 'PATIENT'
            });

            // FIX 1: backend may return accessToken or token — handle both
            const { token, accessToken, user, refreshToken } = response.data;
            const authToken = token || accessToken;

            if (!authToken || !user) {
                throw new Error('Invalid response from server. Please try logging in.');
            }

            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }

            // Login via AuthContext
            login(authToken, user);

            toast.success("Account created successfully! Welcome to OltraHMS.");

            setLoading(false);

            // FIX 2: navigate immediately, no setTimeout delay causing "stuck" perception
            switch (user.role) {
                case 'ADMIN':
                    navigate('/admin');
                    break;
                case 'DOCTOR':
                    navigate('/doctor');
                    break;
                case 'PATIENT':
                    navigate('/app');
                    break;
                case 'RECEPTIONIST':
                    navigate('/receptionist');
                    break;
                case 'PHARMACIST':
                    navigate('/pharmacy');
                    break;
                case 'LAB_TECH':
                    navigate('/lab-tech');
                    break;
                case 'NURSE':
                    navigate('/inpatient');
                    break;
                case 'RADIOLOGIST':
                    navigate('/radiology');
                    break;
                default:
                    navigate('/app');
            }

        } catch (err: unknown) {
            setLoading(false);
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Registration failed.');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Registration failed.');
            }
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-[#F8FAFC]">
            {/* Left Side - Hero/Brand */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-sky-500 to-indigo-700 relative overflow-hidden items-center justify-center p-12 text-white">
                <div className="relative z-10 max-w-lg">
                    <div className="mb-8 p-4 bg-white/10 backdrop-blur-md rounded-2xl w-16 h-16 flex items-center justify-center border border-white/20">
                        <Activity className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold mb-6 tracking-tight">Join OltraHMS</h1>
                    <p className="text-xl text-sky-100 leading-relaxed mb-8">
                        Create your patient account to manage appointments, view medical records, and access telemedicine services.
                    </p>
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white lg:bg-[#F8FAFC]">
                <div className="w-full max-w-md bg-white p-8 lg:p-10 rounded-2xl shadow-xl lg:shadow-none lg:bg-transparent">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                        <p className="text-gray-500">Sign up for a new patient account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm border border-red-100">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        name="firstName"
                                        required
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-100 focus:border-sky-500 outline-none transition-all"
                                        placeholder="John"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        name="lastName"
                                        required
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-100 focus:border-sky-500 outline-none transition-all"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-100 focus:border-sky-500 outline-none transition-all"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-100 focus:border-sky-500 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-100 focus:border-sky-500 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Creating Account...
                                </span>
                            ) : (
                                <>
                                    Create Account <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <div className="text-center text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-sky-500 hover:text-sky-600">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;