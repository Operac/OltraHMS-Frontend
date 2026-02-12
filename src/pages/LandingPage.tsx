import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Stethoscope, 
  Users, 
  CalendarCheck, 
  Activity,
  ArrowRight,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';
import axios from 'axios';

const LandingPage = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        organization: '',
        role: 'Administrator'
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await axios.post('http://localhost:3000/api/public/waitlist', formData);
            setStatus('success');
            setFormData({ name: '', email: '', organization: '', role: 'Administrator' });
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
                                OltraHMS
                            </span>
                        </div>
                        
                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Features</a>
                            <a href="#demo" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Request Admin</a>
                            <button 
                                onClick={() => navigate('/login')}
                                className="text-gray-900 font-medium hover:text-blue-600"
                            >
                                Login
                            </button>
                            <a 
                                href="#waitlist"
                                className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30"
                            >
                                Get Early Access
                            </a>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600">
                                {mobileMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-gray-100 p-4 space-y-4">
                        <a onClick={() => setMobileMenuOpen(false)} href="#features" className="block text-gray-600 font-medium">Features</a>
                        <button onClick={() => navigate('/login')} className="block w-full text-left text-gray-600 font-medium">Login</button>
                        <a href="#waitlist" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-medium">Get Early Access</a>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] bg-blue-100/50 rounded-full blur-3xl -z-10 opacity-60"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Now accepting beta partners
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-tight">
                            Healthcare management, <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">reimagined.</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                            A unified platform for hospitals, clinics, and labs. Streamline patient care, automate operations, and boost efficiency with OltraHMS.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <a href="#waitlist" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-500/30 flex items-center justify-center gap-2">
                                Join Waitlist <ArrowRight className="w-5 h-5" />
                            </a>
                            <button onClick={() => window.open('https://calendly.com/', '_blank')} className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                <CalendarCheck className="w-5 h-5 text-gray-500" /> Book Live Demo
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div id="features" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to run a modern practice</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Built with doctors, receptionists, and administrators in mind.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: Stethoscope, title: "Doctor Portal", desc: "Digital SOAP notes, e-prescriptions, and one-click lab orders." },
                            { icon: CalendarCheck, title: "Receptionist Power", desc: "Efficient queue management, instant check-ins, and automated reminders." },
                            { icon: Users, title: "Patient Experience", desc: "Self-service booking, medical record access, and telemedicine." },
                            { icon: Activity, title: "Lab Integration", desc: "Seamless test requests and result reporting directly to doctor dashboards." },
                            { icon: ShieldCheck, title: "Admin Controls", desc: "Granular staff permissions, financial reporting, and system audits." },
                            { icon: CheckCircle2, title: "Telemedicine", desc: "Built-in secure video consultations for remote care delivery." }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                    <feature.icon className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Waitlist Section */}
            <div id="waitlist" className="py-24 bg-white relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <div className="bg-blue-600 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden relative">
                        {/* Background Patterns */}
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
                        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
                        
                        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                            <div className="text-white">
                                <h2 className="text-3xl font-bold mb-4">Ready to modernize your clinic?</h2>
                                <p className="text-blue-100 mb-8">Join leading healthcare providers on the OltraHMS waitlist today. Get exclusive early access and special pricing.</p>
                                <ul className="space-y-3">
                                    {['No credit card required', 'Priority support', 'Free data migration'].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-blue-50">
                                            <CheckCircle2 className="w-5 h-5 text-blue-300" /> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                {status === 'success' ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">You're on the list!</h3>
                                        <p className="text-gray-600">Thanks for joining. We'll be in touch soon.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <input 
                                                required
                                                type="text" 
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                placeholder="Dr. Sarah Johnson"
                                                value={formData.name}
                                                onChange={e => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <input 
                                                required
                                                type="email" 
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                placeholder="sarah@clinic.com"
                                                value={formData.email}
                                                onChange={e => setFormData({...formData, email: e.target.value})}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                    placeholder="City Hospital"
                                                    value={formData.organization}
                                                    onChange={e => setFormData({...formData, organization: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                                <select 
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                    value={formData.role}
                                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                                >
                                                    <option>Administrator</option>
                                                    <option>Doctor</option>
                                                    <option>Receptionist</option>
                                                    <option>Owner</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button 
                                            disabled={status === 'loading'}
                                            type="submit" 
                                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
                                        </button>
                                        {status === 'error' && (
                                            <p className="text-red-500 text-sm text-center">Something went wrong. Please try again.</p>
                                        )}
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <Activity className="w-6 h-6 text-blue-500" />
                        <span className="text-white font-bold text-lg">OltraHMS</span>
                    </div>
                    <div className="flex gap-8 text-sm">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Contact Support</a>
                    </div>
                    <div className="text-sm">
                        &copy; 2026 OltraHMS. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;