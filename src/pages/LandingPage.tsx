import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, CheckCircle2, Video, Activity, Pill, FlaskConical, Stethoscope, BarChart3, User, ShieldCheck } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
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
            await axios.post(`${import.meta.env.VITE_API_URL}/api/public/waitlist`, formData);
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
        <div className="bg-white font-display text-slate-900 antialiased min-h-screen selection:bg-primary selection:text-white overflow-x-hidden">
            
            {/* Header - Forced White Background for Visibility */}
            <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
                <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.location.reload()}>
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                            <span className="material-icons text-blue-500">local_hospital</span>
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                            Oltra<span className="text-blue-500">HMS</span>
                        </span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-10">
                        <a href="#features" className="text-md font-bold text-slate-600 hover:text-primary transition-colors">Features</a>
                        <a href="#onboarding" className="text-md font-bold text-slate-600 hover:text-primary transition-colors">Trust</a>
                        <button onClick={() => navigate('/login')} className="text-md font-bold text-slate-600 hover:text-primary transition-colors">Login</button>
                    </div>
                    
                    <div>
                        <button 
                            onClick={scrollToWaitlist}
                            className="bg-blue-600 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-md transition-all transform hover:scale-105 shadow-md shadow-primary/20"
                        >
                            Join Waitlist
                        </button>
                    </div>
                </nav>
            </header>

            <main className="pt-28">
                
                {/* Hero Section */}
                <section className="container mx-auto px-6 pb-20 lg:pb-32 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100 text-green-500 text-xs font-bold uppercase tracking-wider shadow-sm">
                            <span className="material-icons text-sm">verified</span>
                            <span>Now Live & Available</span>
                        </div>
                        
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                            Revolutionizing Hospital <span className="text-blue-600">Operations</span> Today
                        </h1>
                        
                        <p className="text-lg text-slate-600 leading-relaxed max-w-xl font-medium">
                            Oltra HMS is now fully available and ready to power your healthcare facility. Join our waitlist today—it's the first step toward a personalized onboarding experience.
                        </p>
                        
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button 
                                    onClick={scrollToWaitlist}
                                    className="bg-blue-600 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-md transition-all shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1"
                                >
                                    Join Waitlist
                                </button>
                                <button 
                                    onClick={() => navigate('/login')}
                                    className="bg-white border-2 border-slate-200 hover:border-primary/50 hover:bg-slate-50 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 text-slate-700 shadow-sm hover:text-primary"
                                >
                                    Login
                                </button>
                            </div>
                            <p className="text-sm text-slate-500 italic flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-green-500 inline" /> 
                                <span className="font-semibold text-slate-600">White-glove onboarding included.</span>
                            </p>
                        </div>
                    </div>

                    <div className="relative group perspective-1000">
                        <div className="absolute -inset-4 bg-blue-600/20 rounded-[2rem] blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>
                        <div 
                            className="relative rounded-2xl overflow-hidden shadow-2xl shadow-slate-200 border-4 border-white bg-slate-900 aspect-video cursor-pointer transform transition-transform duration-500 group-hover:rotate-1"
                            onClick={() => !videoOpen && setVideoOpen(true)}
                        >
                            {videoOpen ? (
                                <video 
                                    className="w-full h-full object-cover rounded-xl animate-in fade-in duration-500"
                                    controls
                                    autoPlay
                                    src="/oltra-promo.mp4"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                                    <img 
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZ47HYvNvBIFPgz8DJVLYWvVm-J86X-EaxqJmPSFCp2CtxX5zjPhSWkakxC4daSdtKNLgG9PYgfom8F0gJmzI1L9MGiNy7su0MKzsZPDvxFz-9unAUinQHVBXdob602MsU9Omr725oNtqVqHy5M55TLEPFAIxppoiZHbirGRponTp0YLmqpDxIhLFLdtArdCZYUwZztuVkY60hQd0SJUZiuM-vcI4_cMUnBrfHQ2X5F3bJDDd83x0rcH6l-frrZYskFgcqjNkMXQ" 
                                        alt="Modern hospital dashboard" 
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center z-20">
                                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300 border border-white/40">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner">
                                                <Play className="w-6 h-6 text-primary ml-1 fill-current" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-6 left-6 right-6 z-20">
                                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-center gap-4 hover:bg-white/20 transition-colors">
                                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                                                <Play className="w-3 h-3 text-white fill-current" />
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-sm">Watch 1-Minute Demo</p>
                                                <p className="text-slate-200 text-xs font-medium">See OltraHMS in action</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -bottom-8 -left-8 bg-white p-5 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center gap-4 max-w-xs hidden lg:flex animate-in fade-in slide-in-from-left-4 duration-1000 delay-300">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                <span className="material-icons">verified</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</p>
                                <p className="text-lg font-extrabold text-slate-900">Active & Live</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid - Slate-50 Background for Contrast */}
                <section id="features" className="py-24 bg-blue-50/50 border-t border-slate-200">
                    <div className="container mx-auto px-6 text-center max-w-2xl mb-16">
                        <h2 className="text-blue-600 font-bold text-sm tracking-widest uppercase mb-4 bg-blue-50 border border-blue-100 inline-block px-4 py-1.5 rounded-full">Core Capabilities</h2>
                        <h3 className="text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">High-performance tools for modern healthcare</h3>
                    </div>
                    
                    <div className="container mx-auto px-6 max-w-7xl">
                        {/* Section 1: The Core Platform (Bento Grid) */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
                            {/* Telemedicine - Large Feature */}
                            <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-blue-100 shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100 transition-colors"></div>
                                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                                    <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-600/30">
                                        <Video className="text-white w-8 h-8" />
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        <h4 className="text-2xl font-bold text-slate-900">Virtual Care Suite</h4>
                                        <p className="text-slate-600 leading-relaxed">
                                            Expand your reach beyond facility walls. Offer HD video consultations, secure messaging, and digital prescriptions directly within the platform.
                                        </p>
                                        <ul className="space-y-2 mt-4">
                                            {[
                                                'Integrated WebRTC Video Calls',
                                                'Real-time Chat with File Sharing',
                                                'Digital Prescriptions & Notes'
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Inpatient Management */}
                            <div className="bg-white rounded-3xl p-8 border border-blue-100 shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all group">
                                <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Activity className="text-blue-600 w-7 h-7" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Inpatient Care</h4>
                                <p className="text-slate-600 text-sm mb-4">
                                    Visual bed management and real-time vitals monitoring keep your wards efficient and safe.
                                </p>
                                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit">
                                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                                    Live Bed Tracking
                                </div>
                            </div>

                            {/* Pharmacy */}
                            <div className="bg-white rounded-3xl p-8 border border-blue-100 shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all group">
                                <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Pill className="text-blue-600 w-7 h-7" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">Smart Pharmacy</h4>
                                <p className="text-slate-600 text-sm mb-4">
                                    Prevent stockouts with automated inventory tracking and low-stock alerts.
                                </p>
                                <div className="flex -space-x-2">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                                            Rx
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Lab */}
                            <div className="bg-white rounded-3xl p-8 border border-blue-100 shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all group md:col-span-2 lg:col-span-2">
                                <div className="flex flex-col md:flex-row gap-6 items-center">
                                    <div className="flex-1 space-y-4">
                                        <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                            <FlaskConical className="text-blue-600 w-7 h-7" />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900">Advanced Diagnostics</h4>
                                        <p className="text-slate-600 text-sm">
                                            Streamline lab workflows from digital test requests to automated result delivery. Minimize errors and speed up diagnoses.
                                        </p>
                                    </div>
                                    <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 w-full">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Recent Results</span>
                                            <BarChart3 className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div className="space-y-2">
                                            {[1, 2].map(i => (
                                                <div key={i} className="flex items-center justify-between text-sm bg-white p-2 rounded-lg shadow-sm">
                                                    <span className="font-semibold text-slate-700">Hemoglobin A1c</span>
                                                    <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded text-xs">Normal</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Empowering Every Role */}
                        <div className="text-center max-w-2xl mx-auto mb-16">
                             <h2 className="text-blue-600 font-bold text-sm tracking-widest uppercase mb-4 bg-blue-50 border border-blue-100 inline-block px-4 py-1.5 rounded-full">Empowering Your Team</h2>
                             <h3 className="text-3xl font-extrabold text-slate-900 mt-2">Built for every stakeholder</h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Doctor */}
                            <div className="group text-center space-y-4 p-6 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 rounded-2xl transition-all border border-transparent hover:border-blue-50">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    <Stethoscope className="w-8 h-8" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900">Clinicians</h4>
                                <p className="text-slate-600 text-sm leading-relaxed">Focus on care, not paperwork. Access patient history, vitals, and notes in one click.</p>
                            </div>

                            {/* Admin */}
                            <div className="group text-center space-y-4 p-6 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 rounded-2xl transition-all border border-transparent hover:border-blue-50">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900">Administrators</h4>
                                <p className="text-slate-600 text-sm leading-relaxed">Gain total visibility. Track financials, staff performance, and facility utilization in real-time.</p>
                            </div>

                            {/* Patient */}
                            <div className="group text-center space-y-4 p-6 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 rounded-2xl transition-all border border-transparent hover:border-blue-50">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    <User className="w-8 h-8" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900">Patients</h4>
                                <p className="text-slate-600 text-sm leading-relaxed">A seamless experience. Easy online booking, access to records, and transparent billing.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Analytics Section - Dark Background for POP */}
                <section className="py-24 bg-white text-slate-900 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
                    
                    <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 relative z-10">
                        <div className="lg:w-1/2">
                             <div className="relative rounded-2xl p-2 bg-blue-50 border border-slate-700 shadow-2xl backdrop-blur-sm">
                                <img 
                                    className="rounded-xl shadow-inner w-full"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDz-nIhFVcoQ98NN_QS2wOGMHDai_spXU2jNq5AL3s7lwKh4BC5rqIEl9anqLXwJaeEZt5O7cAaCGMP7B2ooa0BUYJ7FCUYe9b_7qEPgbJNiU8YRhxuLyVsfR3vk7bkZNNBWh_cg_4q2YJcXVbhZU4ZbhQPYBnXMi2eIL99v-zOxq7CqZLRcTftqx27XMwFcsq61mfzQDxOvgSw5p5LWHu_oZ2BoZxlVA9p8KaTHqKZwzQD7u1vix-u4AHRELYjuZDqsz6djtL6PQ" 
                                    alt="Analytics Dashboard" 
                                />
                             </div>
                        </div>
                        <div className="lg:w-1/2 space-y-8">
                            <div>
                                <h2 className="text-sm text-slate-900 font-bold uppercase tracking-widest mb-2">Data Intelligence</h2>
                                <h3 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">Real-time Insights for Informed Decisions</h3>
                            </div>
                            <p className="text-lg text-slate-400 font-medium">Our analytics dashboard provides a bird's eye view of your facility's performance, from patient intake to administrative efficiency, with data-driven precision.</p>
                            <ul className="space-y-4">
                                {['Live Bed Occupancy Tracking', 'Active Revenue Leakage Detection', 'Real-time Staff Performance Metrics'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center ring-1 ring-blue-600/40">
                                            <span className="material-icons text-sm">check</span>
                                        </div>
                                        <span className="font-semibold text-slate-900">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <button className="text-blue-600 bg-white/10 hover:bg-white/20 px-8 py-4 rounded-xl font-bold flex items-center gap-2 group transition-all border border-blue-600/10 hover:border-blue-600/30">
                                Explore Advanced Analytics
                                <span className="material-icons group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Onboarding / Waitlist Section */}
                <section id="onboarding" className="py-24 container mx-auto px-6 bg-white">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/30">
                        {/* Background Patterns */}
                        <div className="absolute inset-0 bg-slate-900 opacity-20"></div>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-900 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
                        
                        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                            <h2 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">Join the Network of Modern Facilities</h2>
                            <p className="text-xl text-white font-medium">Get started with OltraHMS. We use a dedicated waitlist to ensure every partner receives white-glove onboarding.</p>
                            
                            {/* Waitlist Form Logic Integrated Here */}
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl text-left max-w-xl mx-auto transform transition-all hover:scale-[1.01]">
                                {status === 'success' ? (
                                    <div className="text-center py-8 animate-in fade-in zoom-in">
                                        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">You're on the list!</h3>
                                        <p className="text-slate-300 font-medium">We'll be in touch shortly with your access details.</p>
                                        <button onClick={() => setStatus('idle')} className="mt-6 text-blue-400 font-bold hover:text-blue-300 transition-colors">Register another</button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Full Name</label>
                                            <input 
                                                required
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-slate-400 font-medium"
                                                placeholder="Dr. John Doe"
                                                value={formData.name}
                                                onChange={e => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1">Email Address</label>
                                            <input 
                                                required
                                                type="email"
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-slate-400 font-medium"
                                                placeholder="john@hospital.com"
                                                value={formData.email}
                                                onChange={e => setFormData({...formData, email: e.target.value})}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-200 mb-1">Organization</label>
                                                <input 
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-slate-400 font-medium"
                                                    placeholder="General Hospital"
                                                    value={formData.organization}
                                                    onChange={e => setFormData({...formData, organization: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-200 mb-1">Role</label>
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
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed mt-2 border border-blue-500/50"
                                        >
                                            {status === 'loading' ? 'Processing...' : 'Join Private Waitlist'}
                                        </button>

                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-200 pt-20 pb-10">
                <div className="container mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="material-icons text-white text-sm">local_hospital</span>
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-white">Oltra<span className="text-primary">HMS</span></span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed font-medium">
                            The digital infrastructure for modern healthcare providers. Secure, efficient, and patient-centric management live today.
                        </p>
                        <div className="flex gap-4">
                            {['facebook', 'alternate_email', 'forum'].map((icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-slate-400">
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
                                    <li key={j}><a href="#" className="hover:text-primary transition-colors">{link}</a></li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="container mx-auto px-6 pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs font-bold uppercase tracking-wider">
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