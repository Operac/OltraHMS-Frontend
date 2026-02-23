import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Activity, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const minLoadTime = new Promise(resolve => setTimeout(resolve, 800));

        try {
            const [response] = await Promise.all([
                axios.post('http://localhost:3000/api/auth/login', { email, password }),
                minLoadTime
            ]);
            
            const userData = response.data.user;
            
            // Await login to ensure state is set (though standard React state update is async, 
            // the context function itself is synchronous in execution but state update effect is next render)
            login(response.data.token, userData);
            toast.success(`Welcome back, ${userData.firstName}!`);
            
            
            // Force a small delay to allow Context to update if needed (though navigating immediately is usually fine if not protected by "wait for auth")
            // But if the target route is Protected, it checks "isAuthenticated"
            // If "isAuthenticated" relies on "token" state which might lag by one render cycle...
            
            setTimeout(() => {
                // Role-based redirect
                switch(userData.role) {
                    case 'ADMIN':
                        // Force hard reload to ensure context is fresh and avoid race conditions
                        window.location.href = '/admin';
                        break;
                    case 'DOCTOR':
                        window.location.href = '/doctor';
                        break;
                    case 'PATIENT':
                        navigate('/app'); 
                        break;
                    case 'RECEPTIONIST':
                        window.location.href = '/receptionist';
                        break;
                    case 'PHARMACIST':
                        window.location.href = '/pharmacy';
                        break;
                    case 'LAB_TECH':
                        window.location.href = '/lab-tech';
                        break;
                    case 'NURSE':
                        window.location.href = '/inpatient';
                        break;
                    default:
                        navigate('/app');
                }
            }, 100);

        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-[#F8FAFC]">
            {/* Left Side - Hero/Brand */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden items-center justify-center p-12 text-white">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full border-[60px] border-white/5"
                    />
                    <motion.div 
                         animate={{ rotate: -360 }}
                         transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] rounded-full border-[40px] border-white/5"
                    />
                </div>

                <div className="relative z-10 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8 p-4 bg-white/10 backdrop-blur-md rounded-2xl w-16 h-16 flex items-center justify-center border border-white/20"
                    >
                        <Activity className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-5xl font-bold mb-6 tracking-tight"
                    >
                        OltraHMS
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl text-blue-100 leading-relaxed mb-8"
                    >
                        The next-generation Hospital Management System designed for efficiency, security, and patient care excellence.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex gap-4"
                    >
                        {['Secure Records', 'Smart Scheduling', 'Telemedicine'].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-white/10">
                                <CheckCircle className="w-4 h-4 text-blue-300" />
                                {item}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white lg:bg-[#F8FAFC]">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md bg-white p-8 lg:p-10 rounded-2xl shadow-xl lg:shadow-none lg:bg-transparent"
                >
                    <div className="mb-10 text-left">
                        <motion.h2 
                             initial={{ opacity: 0, x: -20 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: 0.2 }}
                            className="text-3xl font-bold text-gray-900 mb-2"
                        >
                            Welcome back
                        </motion.h2>
                        <motion.p 
                             initial={{ opacity: 0, x: -20 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: 0.3 }}
                            className="text-gray-500"
                        >
                            Please enter your details to sign in
                        </motion.p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm border border-red-100 overflow-hidden"
                                >
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-5">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="flex justify-between items-center mb-1.5 ml-1">
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Forgot password?</a>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all outline-none font-medium text-gray-900 placeholder:text-gray-400"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        <motion.button 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                        

                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Don't have an account?{' '}
                        <button 
                            onClick={() => navigate('/register')}
                            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                        >
                            Create free account
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
