import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, CheckCircle2, Video, Activity, Pill, FlaskConical, Stethoscope, BarChart3, User, ShieldCheck, ArrowRight } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { Role } from '../constants/roles';

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
        <div className="bg-gradient-to-b from-sky-50 via-sky-50 to-white font-sans text-slate-800 antialiased min-h-screen selection:bg-sky-400 selection:text-white overflow-x-hidden">
            
            {/* Header - Clean Light */}
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
                <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.location.reload()}>
                        <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-400/30 group-hover:scale-105 transition-transform">
                            <span className="material-icons text-white">local_hospital</span>
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight text-slate-800">
                            Oltra<span className="text-sky-500">HMS</span>
                        </span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-10">
                        <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors">Features</a>
                        <a href="#demo" className="text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors">Demo</a>
                        <a href="#onboarding" className="text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors">Contact</a>
                        {isAuthenticated ? (
                            <div className="flex items-center gap-6">
                            <button 
                                onClick={() => {
                                    if (user?.role === Role.ADMIN) navigate('/admin');
                                    else if (user?.role === Role.DOCTOR) navigate('/doctor');
                                    else if (user?.role === Role.RECEPTIONIST) navigate('/receptionist');
                                    else if (user?.role === Role.PHARMACIST) navigate('/pharmacy');
                                    else if (user?.role === Role.LAB_TECH) navigate('/lab-tech');
                                    else if (user?.role === Role.NURSE) navigate('/inpatient');
                                    else navigate('/app');
                                }} 
                                className="text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors"
                            >
                                Dashboard
                            </button>
                            <button 
                                onClick={logout} 
                                className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                        ) : (
                            <button onClick={() => navigate('/login')} className="text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors">Login</button>
                        )}
                    </div>
                    
                    <div>
                        <button 
                            onClick={scrollToWaitlist}
                            className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-sky-400/30 hover:shadow-sky-400/50"
                        >
                            Join Waitlist
                        </button>
                    </div>
                </nav>
            </header>

            <main className="pt-20">
                
                {/* Hero Section - Baby Blue Theme */}
                <section className="relative min-h-[90vh] flex items-center overflow-hidden">
                    {/* Baby Blue Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-sky-50 to-white">
                        <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-[120px]"></div>
                        <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-sky-200/30 rounded-full blur-[100px]"></div>
                    </div>

                    <div className="container mx-auto px-6 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            {/* Left Content */}
                            <div className="space-y-8">
                                <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-800 leading-[1.1] tracking-tight">
                                    Revolutionizing<br />
                                    <span className="text-sky-500">Hospital</span><br />
                                    <span className="text-slate-800">Operations</span>
                                </h1>
                                
                                <p className="text-lg text-slate-600 leading-relaxed max-w-xl font-medium">
                                    Oltra HMS is now fully available and ready to power your healthcare facility. Join our waitlist today—it's the first step toward a personalized onboarding experience.
                                </p>
                                
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button 
                                        onClick={scrollToWaitlist}
                                        className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 rounded-xl font-bold text-md transition-all shadow-xl shadow-sky-400/30 hover:shadow-sky-400/50 hover:-translate-y-1 flex items-center justify-center gap-2"
                                    >
                                        Join Waitlist
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                    {isAuthenticated ? (
                                        <button 
                                            onClick={() => {
                                                if (user?.role === Role.ADMIN) navigate('/admin');
                                                else if (user?.role === Role.DOCTOR) navigate('/doctor');
                                                else if (user?.role === Role.RECEPTIONIST) navigate('/receptionist');
                                                else if (user?.role === Role.PHARMACIST) navigate('/pharmacy');
                                                else if (user?.role === Role.LAB_TECH) navigate('/lab-tech');
                                                else if (user?.role === Role.NURSE) navigate('/inpatient');
                                                else navigate('/app');
                                            }}
                                            className="bg-white border-2 border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-700 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                                        >
                                            Go to Dashboard
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => navigate('/login')}
                                            className="bg-white border-2 border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-700 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                                        >
                                            Login
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 italic flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-sky-500 inline" /> 
                                    <span className="font-semibold text-slate-600">White-glove onboarding included.</span>
                                </p>
                            </div>

                            {/* Right Image */}
                            <div className="relative flex justify-center items-center">
                                <img 
                                    src="/hmsimage-2.png" 
                                    alt="Modern Healthcare Technology" 
                                    className="w-full h-auto max-h-[90vh] object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid - Baby Blue Theme */}
                <section id="features" className="py-24 bg-gradient-to-b from-white via-sky-50 to-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider mb-6">
                                Core Capabilities
                            </span>
                            <h3 className="text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight">High-performance tools for modern healthcare</h3>
                        </div>
                        
                        <div className="max-w-7xl mx-auto">
                            {/* Bento Grid */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                                {/* Virtual Care - Large Feature */}
                                <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-sky-100 shadow-lg shadow-sky-100/50 hover:shadow-xl hover:shadow-sky-200/30 transition-all group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-sky-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
                                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                                        <div className="bg-gradient-to-br from-sky-400 to-sky-500 p-4 rounded-2xl shadow-lg shadow-sky-400/30">
                                            <Video className="text-white w-8 h-8" />
                                        </div>
                                        <div className="space-y-4 flex-1">
                                            <h4 className="text-2xl font-bold text-slate-800">Virtual Care Suite</h4>
                                            <p className="text-slate-600 leading-relaxed">
                                                Expand your reach beyond facility walls. Offer HD video consultations, secure messaging, and digital prescriptions directly within the platform.
                                            </p>
                                            <ul className="space-y-2 mt-4">
                                                {[
                                                    'integrated video calls',
                                                    'Real-time Chat with File Sharing',
                                                    'Digital Prescriptions & Notes'
                                                ].map((item, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                        <CheckCircle2 className="w-4 h-4 text-sky-500" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Inpatient Management */}
                                <div className="bg-white rounded-3xl p-8 border border-sky-100 shadow-lg shadow-sky-100/50 hover:shadow-xl hover:shadow-sky-200/30 transition-all group">
                                    <div className="bg-sky-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Activity className="text-sky-600 w-7 h-7" />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-800 mb-3">Inpatient Care</h4>
                                    <p className="text-slate-600 text-sm mb-4">
                                        Visual bed management and real-time vitals monitoring keep your wards efficient and safe.
                                    </p>
                                    <div className="flex items-center gap-2 text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-full w-fit">
                                        <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></span>
                                        Live Bed Tracking
                                    </div>
                                </div>

                                {/* Pharmacy */}
                                <div className="bg-white rounded-3xl p-8 border border-sky-100 shadow-lg shadow-sky-100/50 hover:shadow-xl hover:shadow-sky-200/30 transition-all group">
                                    <div className="bg-sky-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Pill className="text-sky-600 w-7 h-7" />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-800 mb-3">Smart Pharmacy</h4>
                                    <p className="text-slate-600 text-sm mb-4">
                                        Prevent stockouts with automated inventory tracking and low-stock alerts.
                                    </p>
                                    <div className="flex -space-x-2">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-sky-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-sky-600">
                                                Rx
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Lab - Spans 2 columns */}
                                <div className="md:col-span-2 lg:col-span-2 bg-white rounded-3xl p-8 border border-sky-100 shadow-lg shadow-sky-100/50 hover:shadow-xl hover:shadow-sky-200/30 transition-all group">
                                    <div className="flex flex-col md:flex-row gap-6 items-center">
                                        <div className="flex-1 space-y-4">
                                            <div className="bg-sky-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                                <FlaskConical className="text-sky-600 w-7 h-7" />
                                            </div>
                                            <h4 className="text-xl font-bold text-slate-800">Advanced Diagnostics</h4>
                                            <p className="text-slate-600 text-sm">
                                                Streamline lab workflows from digital test requests to automated result delivery. Minimize errors and speed up diagnoses.
                                            </p>
                                        </div>
                                        <div className="flex-1 bg-sky-50 rounded-2xl p-4 border border-sky-100 w-full">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs font-bold text-slate-500 uppercase">Recent Results</span>
                                                <BarChart3 className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <div className="space-y-2">
                                                {[1, 2].map(i => (
                                                    <div key={i} className="flex items-center justify-between text-sm bg-white p-3 rounded-xl border border-sky-100 shadow-sm">
                                                        <span className="font-semibold text-slate-700">Hemoglobin A1c</span>
                                                        <span className="text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded text-xs">Normal</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Empowering Every Role */}
                            <div className="text-center max-w-2xl mx-auto mb-12">
                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider mb-4">
                                    Empowering Your Team
                                </span>
                                <h3 className="text-3xl font-extrabold text-slate-800">Built for every stakeholder</h3>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                {[
                                    { icon: Stethoscope, title: 'Clinicians', desc: 'Focus on care, not paperwork. Access patient history, vitals, and notes in one click.', color: 'sky' },
                                    { icon: ShieldCheck, title: 'Administrators', desc: 'Gain total visibility. Track financials, staff performance, and facility utilization in real-time.', color: 'blue' },
                                    { icon: User, title: 'Patients', desc: 'A seamless experience. Easy online booking, access to records, and transparent billing.', color: 'sky' }
                                ].map((role, i) => (
                                    <div key={i} className="group text-center space-y-4 p-8 bg-white rounded-3xl border border-sky-100 shadow-lg shadow-sky-100/50 hover:shadow-xl hover:shadow-sky-200/30 transition-all">
                                        <div className={`w-16 h-16 bg-${role.color}-100 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform`}>
                                            <role.icon className={`w-8 h-8 text-${role.color}-600`} />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-800">{role.title}</h4>
                                        <p className="text-slate-600 text-sm leading-relaxed">{role.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Analytics Section with Video - Side by Side */}
                <section id="demo" className="py-24 bg-gradient-to-r from-sky-50/80 via-white to-sky-50/60">
                    <div className="container mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            {/* Video Side */}
                            <div 
                                className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl cursor-pointer group aspect-video"
                                onClick={() => !videoOpen && setVideoOpen(true)}
                            >
                                {videoOpen ? (
                                    <video 
                                        className="w-full h-full object-cover"
                                        controls
                                        autoPlay
                                        src="/oltra-promo.mp4"
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent z-10"></div>
                                        <img 
                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZ47HYvNvBIFPgz8DJVLYWvVm-J86X-EaxqJmPSFCp2CtxX5zjPhSWkakxC4daSdtKNLgG9PYgfom8F0gJmzI1L9MGiNy7su0MKzsZPDvxFz-9unAUinQHVBXdob602MsU9Omr725oNtqVqHy5M55TLEPFAIxppoiZHbirGRponTp0YLmqpDxIhLFLdtArdCZYUwZztuVkY60hQd0SJUZiuM-vcI4_cMUnBrfHQ2X5F3bJDDd83x0rcH6l-frrZYskFgcqjNkMXQ" 
                                            alt="Modern hospital dashboard" 
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center z-20">
                                            <div className="w-24 h-24 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                                                <div className="w-20 h-20 bg-sky-500 rounded-full flex items-center justify-center shadow-lg">
                                                    <Play className="w-8 h-8 text-white ml-1 fill-current" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-8 left-8 z-20">
                                            <p className="text-white font-bold text-lg">1-Minute Demo</p>
                                            <p className="text-slate-300 text-sm">See OltraHMS in action</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Text Side */}
                            <div className="space-y-8">
                                <div>
                                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider mb-4">
                                        <Video className="w-4 h-4" />
                                        Watch Demo
                                    </span>
                                    <h3 className="text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">Real-time Insights for Informed Decisions</h3>
                                    <p className="text-lg text-slate-600 font-medium">Our analytics dashboard provides a bird's eye view of your facility's performance, from patient intake to administrative efficiency, with data-driven precision.</p>
                                </div>
                                
                                <div className="space-y-4">
                                    {['Live Bed Occupancy Tracking', 'Active Revenue Leakage Detection', 'Real-time Staff Performance Metrics'].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-sky-100 shadow-sm">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-400/30 shrink-0">
                                                <span className="material-icons text-sm">check</span>
                                            </div>
                                            <p className="font-semibold text-slate-800">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Onboarding / Waitlist Section - Baby Blue */}
                <section id="onboarding" className="py-24 bg-gradient-to-b from-white to-sky-50">
                    <div className="container mx-auto px-6">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-8 lg:p-20 text-center relative overflow-hidden shadow-2xl">
                            {/* Background Glows */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
                            
                            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                                <h2 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">Join the Network of Modern Facilities</h2>
                                <p className="text-xl text-slate-300 font-medium">Get started with OltraHMS. We use a dedicated waitlist to ensure every partner receives white-glove onboarding.</p>
                                
                                {/* Waitlist Form */}
                                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl text-left max-w-xl mx-auto transform transition-all hover:scale-[1.01]">
                                    {status === 'success' ? (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-400/30">
                                                <CheckCircle2 className="w-8 h-8 text-white" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white mb-2">You're on the list!</h3>
                                            <p className="text-slate-300 font-medium">We'll be in touch shortly with your access details.</p>
                                            <button onClick={() => setStatus('idle')} className="mt-6 text-sky-400 font-bold hover:text-sky-300 transition-colors">Register another</button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-200 mb-2">Full Name</label>
                                                <input 
                                                    required
                                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all text-white placeholder-slate-400 font-medium"
                                                    placeholder="Dr. John Doe"
                                                    value={formData.name}
                                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-200 mb-2">Email Address</label>
                                                <input 
                                                    required
                                                    type="email"
                                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all text-white placeholder-slate-400 font-medium"
                                                    placeholder="john@hospital.com"
                                                    value={formData.email}
                                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-200 mb-2">Organization</label>
                                                    <input 
                                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all text-white placeholder-slate-400 font-medium"
                                                        placeholder="General Hospital"
                                                        value={formData.organization}
                                                        onChange={e => setFormData({...formData, organization: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-200 mb-2">Role</label>
                                                    <select 
                                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all text-white font-medium appearance-none cursor-pointer"
                                                        value={formData.role}
                                                        onChange={e => setFormData({...formData, role: e.target.value})}
                                                    >
                                                        <option className="bg-slate-700 text-white">Administrator</option>
                                                        <option className="bg-slate-700 text-white">Doctor</option>
                                                        <option className="bg-slate-700 text-white">Receptionist</option>
                                                        <option className="bg-slate-700 text-white">Owner</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <button 
                                                disabled={status === 'loading'}
                                                className="w-full bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-400/30 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
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

            {/* Footer - Baby Blue Theme */}
            <footer className="bg-slate-800 text-slate-300 pt-20 pb-10">
                <div className="container mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-sky-500 rounded-lg flex items-center justify-center shadow-lg shadow-sky-400/30">
                                <span className="material-icons text-white text-sm">local_hospital</span>
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-white">
                                Oltra<span className="text-sky-400">HMS</span>
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed font-medium">
                            The digital infrastructure for modern healthcare providers. Secure, efficient, and patient-centric management live today.
                        </p>
                        <div className="flex gap-4">
                            {['facebook', 'alternate_email', 'forum'].map((icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all">
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
                            <ul className="space-y-4 text-slate-400 text-sm font-medium">
                                {col.links.map((link, j) => (
                                    <li key={j}><a href="#" className="hover:text-sky-400 transition-colors">{link}</a></li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="container mx-auto px-6 pt-10 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <p>© 2026 Oltra Health Systems Inc. All rights reserved.</p>
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