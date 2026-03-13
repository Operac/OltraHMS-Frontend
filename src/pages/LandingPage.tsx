import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, CheckCircle2, Video, Activity, Pill, FlaskConical, Stethoscope, BarChart3, User, ShieldCheck } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        organization: '',
        role: 'Administrator'
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [videoOpen, setVideoOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/public/waitlist`, formData);
            setStatus('success');
            setFormData({ name: '', email: '', organization: '', role: 'Administrator' });
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    const scrollToWaitlist = () => {
        document.getElementById('onboarding')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="bg-[#0f172a] font-display text-slate-900 antialiased min-h-screen selection:bg-blue-500 selection:text-white overflow-x-hidden">
            
            {/* Header - Glassmorphism */}
            <header className="fixed top-0 w-full z-50 bg-white/5 backdrop-blur-xl border-b border-white/10">
                <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.location.reload()}>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                            <span className="material-icons text-white">local_hospital</span>
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight text-white">
                            Oltra<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">HMS</span>
                        </span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-10">
                        <a href="#features" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Features</a>
                        <a href="#onboarding" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Trust</a>
                        {isAuthenticated ? (
                            <div className="flex items-center gap-6">
                            <button 
                                onClick={() => {
                                    if (user?.role === 'ADMIN') navigate('/admin');
                                    else if (user?.role === 'DOCTOR') navigate('/doctor');
                                    else if (user?.role === 'RECEPTIONIST') navigate('/receptionist');
                                    else if (user?.role === 'PHARMACIST') navigate('/pharmacy');
                                    else if (user?.role === 'LAB_TECH') navigate('/lab-tech');
                                    else if (user?.role === 'NURSE') navigate('/inpatient');
                                    else navigate('/app');
                                }} 
                                className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                            >
                                Dashboard
                            </button>
                            <button 
                                onClick={logout} 
                                className="text-sm font-semibold text-red-400 hover:text-red-300 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                        ) : (
                            <button onClick={() => navigate('/login')} className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Login</button>
                        )}
                    </div>
                    
                    <div>
                        <button 
                            onClick={scrollToWaitlist}
                            className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all border border-white/20 hover:border-white/40"
                        >
                            Join Waitlist
                        </button>
                    </div>
                </nav>
            </header>

            <main className="pt-20">
                
                {/* Hero Section - Gradient Background with Glass Cards */}
                <section className="relative min-h-[90vh] flex items-center overflow-hidden">
                    {/* Animated Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] via-[#3730a3] to-[#7c3aed]">
                        <div className="absolute top-0 left-0 w-full h-full">
                            <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/30 rounded-full blur-[120px]"></div>
                            <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[150px]"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[150px]"></div>
                        </div>
                    </div>

                    <div className="container mx-auto px-6 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-white/90 text-xs font-semibold tracking-wider uppercase">Now Live & Available</span>
                                </div>
                                
                                <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
                                    AI-POWERED<br />
                                    <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">MEDICINE</span><br />
                                    <span className="text-4xl lg:text-6xl font-bold">REDEFINING HEALTHCARE</span>
                                </h1>
                                
                                <p className="text-lg text-white/70 leading-relaxed max-w-xl font-medium">
                                    Oltra HMS is now fully available and ready to power your healthcare facility. Join our waitlist today—it's the first step toward a personalized onboarding experience.
                                </p>
                                
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button 
                                        onClick={scrollToWaitlist}
                                        className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-md transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                                    >
                                        Join Waitlist
                                    </button>
                                    {isAuthenticated ? (
                                        <button 
                                            onClick={() => {
                                                if (user?.role === 'ADMIN') navigate('/admin');
                                                else if (user?.role === 'DOCTOR') navigate('/doctor');
                                                else if (user?.role === 'RECEPTIONIST') navigate('/receptionist');
                                                else if (user?.role === 'PHARMACIST') navigate('/pharmacy');
                                                else if (user?.role === 'LAB_TECH') navigate('/lab-tech');
                                                else if (user?.role === 'NURSE') navigate('/inpatient');
                                                else navigate('/app');
                                            }}
                                            className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                                        >
                                            Go to Dashboard
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => navigate('/login')}
                                            className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                                        >
                                            Login
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-white/50 italic flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-green-400 inline" /> 
                                    <span className="font-semibold text-white/70">White-glove onboarding included.</span>
                                </p>
                            </div>

                            {/* Video Card with Glassmorphism */}
                            <div className="relative">
                                <div 
                                    className="relative rounded-3xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl cursor-pointer group"
                                    onClick={() => !videoOpen && setVideoOpen(true)}
                                >
                                    {videoOpen ? (
                                        <video 
                                            className="w-full h-full object-cover rounded-3xl"
                                            controls
                                            autoPlay
                                            src="/oltra-promo.mp4"
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10"></div>
                                            <img 
                                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZ47HYvNvBIFPgz8DJVLYWvVm-J86X-EaxqJmPSFCp2CtxX5zjPhSWkakxC4daSdtKNLgG9PYgfom8F0gJmzI1L9MGiNy7su0MKzsZPDvxFz-9unAUinQHVBXdob602MsU9Omr725oNtqVqHy5M55TLEPFAIxppoiZHbirGRponTp0YLmqpDxIhLFLdtArdCZYUwZztuVkY60hQd0SJUZiuM-vcI4_cMUnBrfHQ2X5F3bJDDd83x0rcH6l-frrZYskFgcqjNkMXQ" 
                                                alt="Modern hospital dashboard" 
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                                <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300 border border-white/30">
                                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner">
                                                        <Play className="w-6 h-6 text-blue-600 ml-1 fill-current" />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Floating Status Badge */}
                                <div className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-xl hidden lg:flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                                        <span className="material-icons text-white">verified</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Status</p>
                                        <p className="text-lg font-bold text-white">Active & Live</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid - Glass Cards on Dark */}
                <section id="features" className="py-24 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#0f172a]"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-blue-300 text-xs font-bold uppercase tracking-wider mb-6">
                                Core Capabilities
                            </span>
                            <h3 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">High-performance tools for modern healthcare</h3>
                        </div>
                        
                        <div className="max-w-7xl mx-auto">
                            {/* Bento Grid with Glass Cards */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                                {/* Virtual Care - Large Feature */}
                                <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg shadow-blue-500/30">
                                            <Video className="text-white w-8 h-8" />
                                        </div>
                                        <div className="space-y-4 flex-1">
                                            <h4 className="text-2xl font-bold text-white">Virtual Care Suite</h4>
                                            <p className="text-white/60 leading-relaxed">
                                                Expand your reach beyond facility walls. Offer HD video consultations, secure messaging, and digital prescriptions directly within the platform.
                                            </p>
                                            <ul className="space-y-2 mt-4">
                                                {[
                                                    'Integrated WebRTC Video Calls',
                                                    'Real-time Chat with File Sharing',
                                                    'Digital Prescriptions & Notes'
                                                ].map((item, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm font-semibold text-white/80">
                                                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Inpatient Management */}
                                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all group">
                                    <div className="bg-blue-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Activity className="text-blue-400 w-7 h-7" />
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-3">Inpatient Care</h4>
                                    <p className="text-white/60 text-sm mb-4">
                                        Visual bed management and real-time vitals monitoring keep your wards efficient and safe.
                                    </p>
                                    <div className="flex items-center gap-2 text-xs font-bold text-blue-300 bg-blue-500/20 px-3 py-1.5 rounded-full w-fit backdrop-blur-sm">
                                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                                        Live Bed Tracking
                                    </div>
                                </div>

                                {/* Pharmacy */}
                                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all group">
                                    <div className="bg-purple-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Pill className="text-purple-400 w-7 h-7" />
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-3">Smart Pharmacy</h4>
                                    <p className="text-white/60 text-sm mb-4">
                                        Prevent stockouts with automated inventory tracking and low-stock alerts.
                                    </p>
                                    <div className="flex -space-x-2">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-[10px] font-bold text-white/70 backdrop-blur-sm">
                                                Rx
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Lab - Spans 2 columns */}
                                <div className="md:col-span-2 lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all group">
                                    <div className="flex flex-col md:flex-row gap-6 items-center">
                                        <div className="flex-1 space-y-4">
                                            <div className="bg-emerald-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                <FlaskConical className="text-emerald-400 w-7 h-7" />
                                            </div>
                                            <h4 className="text-xl font-bold text-white">Advanced Diagnostics</h4>
                                            <p className="text-white/60 text-sm">
                                                Streamline lab workflows from digital test requests to automated result delivery. Minimize errors and speed up diagnoses.
                                            </p>
                                        </div>
                                        <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10 w-full backdrop-blur-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs font-bold text-white/50 uppercase">Recent Results</span>
                                                <BarChart3 className="w-4 h-4 text-white/40" />
                                            </div>
                                            <div className="space-y-2">
                                                {[1, 2].map(i => (
                                                    <div key={i} className="flex items-center justify-between text-sm bg-white/5 p-3 rounded-xl border border-white/5">
                                                        <span className="font-semibold text-white/80">Hemoglobin A1c</span>
                                                        <span className="text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded text-xs">Normal</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Empowering Every Role */}
                            <div className="text-center max-w-2xl mx-auto mb-12">
                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4">
                                    Empowering Your Team
                                </span>
                                <h3 className="text-3xl font-extrabold text-white">Built for every stakeholder</h3>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                {[
                                    { icon: Stethoscope, title: 'Clinicians', desc: 'Focus on care, not paperwork. Access patient history, vitals, and notes in one click.', color: 'blue' },
                                    { icon: ShieldCheck, title: 'Administrators', desc: 'Gain total visibility. Track financials, staff performance, and facility utilization in real-time.', color: 'purple' },
                                    { icon: User, title: 'Patients', desc: 'A seamless experience. Easy online booking, access to records, and transparent billing.', color: 'emerald' }
                                ].map((role, i) => (
                                    <div key={i} className="group text-center space-y-4 p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:bg-white/10 transition-all">
                                        <div className={`w-16 h-16 bg-${role.color}-500/20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform`}>
                                            <role.icon className={`w-8 h-8 text-${role.color}-400`} />
                                        </div>
                                        <h4 className="text-xl font-bold text-white">{role.title}</h4>
                                        <p className="text-white/60 text-sm leading-relaxed">{role.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Analytics Section */}
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a8a]/20 via-[#0f172a] to-[#7c3aed]/20"></div>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
                    
                    <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 relative z-10">
                        <div className="lg:w-1/2">
                             <div className="relative rounded-3xl p-1 bg-gradient-to-br from-blue-500/30 to-purple-500/30">
                                <div className="bg-white/5 backdrop-blur-xl rounded-[22px] p-4 border border-white/10">
                                    <img 
                                        className="rounded-2xl w-full shadow-2xl"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDz-nIhFVcoQ98NN_QS2wOGMHDai_spXU2jNq5AL3s7lwKh4BC5rqIEl9anqLXwJaeEZt5O7cAaCGMP7B2ooa0BUYJ7FCUYe9b_7qEPgbJNiU8YRhxuLyVsfR3vk7bkZNNBWh_cg_4q2YJcXVbhZU4ZbhQPYBnXMi2eIL99v-zOxq7CqZLRcTftqx27XMwFcsq61mfzQDxOvgSw5p5LWHu_oZ2BoZxlVA9p8KaTHqKZwzQD7u1vix-u4AHRELYjuZDqsz6djtL6PQ" 
                                        alt="Analytics Dashboard" 
                                    />
                                </div>
                             </div>
                        </div>
                        <div className="lg:w-1/2 space-y-8">
                            <div>
                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">
                                    Data Intelligence
                                </span>
                                <h3 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">Real-time Insights for Informed Decisions</h3>
                            </div>
                            <p className="text-lg text-white/60 font-medium">Our analytics dashboard provides a bird's eye view of your facility's performance, from patient intake to administrative efficiency, with data-driven precision.</p>
                            <ul className="space-y-4">
                                {['Live Bed Occupancy Tracking', 'Active Revenue Leakage Detection', 'Real-time Staff Performance Metrics'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                                            <span className="material-icons text-sm">check</span>
                                        </div>
                                        <span className="font-semibold text-white">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <button className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 group transition-all">
                                Explore Advanced Analytics
                                <span className="material-icons group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Onboarding / Waitlist Section */}
                <section id="onboarding" className="py-24 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] to-[#1e1b4b]"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 lg:p-20 text-center relative overflow-hidden border border-white/20 shadow-2xl">
                            {/* Background Glows */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
                            
                            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                                <h2 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">Join the Network of Modern Facilities</h2>
                                <p className="text-xl text-white/70 font-medium">Get started with OltraHMS. We use a dedicated waitlist to ensure every partner receives white-glove onboarding.</p>
                                
                                {/* Waitlist Form */}
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl text-left max-w-xl mx-auto transform transition-all hover:scale-[1.01]">
                                    {status === 'success' ? (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                                                <CheckCircle2 className="w-8 h-8 text-white" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white mb-2">You're on the list!</h3>
                                            <p className="text-white/60 font-medium">We'll be in touch shortly with your access details.</p>
                                            <button onClick={() => setStatus('idle')} className="mt-6 text-blue-400 font-bold hover:text-blue-300 transition-colors">Register another</button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-white/80 mb-2">Full Name</label>
                                                <input 
                                                    required
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-white/40 font-medium"
                                                    placeholder="Dr. John Doe"
                                                    value={formData.name}
                                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-white/80 mb-2">Email Address</label>
                                                <input 
                                                    required
                                                    type="email"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-white/40 font-medium"
                                                    placeholder="john@hospital.com"
                                                    value={formData.email}
                                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-white/80 mb-2">Organization</label>
                                                    <input 
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-white/40 font-medium"
                                                        placeholder="General Hospital"
                                                        value={formData.organization}
                                                        onChange={e => setFormData({...formData, organization: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-white/80 mb-2">Role</label>
                                                    <select 
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white font-medium appearance-none"
                                                        value={formData.role}
                                                        onChange={e => setFormData({...formData, role: e.target.value})}
                                                    >
                                                        <option className="bg-slate-900 text-white">Administrator</option>
                                                        <option className="bg-slate-900 text-white">Doctor</option>
                                                        <option className="bg-slate-900 text-white">Receptionist</option>
                                                        <option className="bg-slate-900 text-white">Owner</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <button 
                                                disabled={status === 'loading'}
                                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                                            >
                                                {status === 'loading' ? 'Processing...' : 'Join Private Waitlist'}
                                            </button>

                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-[#0a0f1c] text-white/70 pt-20 pb-10 border-t border-white/5">
                <div className="container mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <span className="material-icons text-white text-sm">local_hospital</span>
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-white">
                                Oltra<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">HMS</span>
                            </span>
                        </div>
                        <p className="text-white/50 text-sm leading-relaxed font-medium">
                            The digital infrastructure for modern healthcare providers. Secure, efficient, and patient-centric management live today.
                        </p>
                        <div className="flex gap-4">
                            {['facebook', 'alternate_email', 'forum'].map((icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-white/60 hover:text-white">
                                    <span className="material-icons text-base">{icon}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                    {[
                        { title: 'Product', links: ['Patient Records', 'Smart Billing', 'Inventory Management', 'Telemedicine', 'Live Status'] },
                        { title: 'Company', links: ['About Us', 'Careers', 'Onboarding Policy', 'Trust Center', 'Contact'] },
                        { title: 'Connect', links: ['Join Waitlist', 'Documentation', 'Events', 'Security', 'Privacy Policy'] }
                    ].map((col, i) => (
                        <div key={i}>
                            <h4 className="font-bold mb-6 text-white">{col.title}</h4>
                            <ul className="space-y-4 text-white/50 text-sm font-medium">
                                {col.links.map((link, j) => (
                                    <li key={j}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="container mx-auto px-6 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-xs font-bold uppercase tracking-wider">
                    <p> 2026 Oltra Health Systems Inc. All rights reserved.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Cookies</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;