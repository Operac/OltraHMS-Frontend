import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerPatient } from '../../services/receptionist.service';
import type { PatientRegistrationData } from '../../services/receptionist.service';
import { ArrowLeft, Save, Mail, Key, Printer } from 'lucide-react';

const Registration = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showCredentials, setShowCredentials] = useState(false);
    const [credentials, setCredentials] = useState<{email: string; password: string; patientNumber: string} | null>(null);
    const [formData, setFormData] = useState<PatientRegistrationData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: 'MALE',
        address: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await registerPatient(formData);
            
            // Store credentials for display
            if (response.credentials) {
                setCredentials(response.credentials);
                setShowCredentials(true);
            }
            
            if (confirm('Patient registered successfully! \nDo you want to book an appointment now?')) {
                // Ensure backend returns the full patient object in response.patient
                navigate('/receptionist/booking', { 
                    state: { 
                        patient: response.patient 
                    } 
                });
            } else {
                navigate('/receptionist');
            }
        } catch (error: any) {
            console.error("Registration failed", error);
            alert(error.response?.data?.message || 'Failed to register patient');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6 flex items-center gap-2">
                <button 
                    onClick={() => navigate('/receptionist')}
                    className="p-2 hover:bg-gray-100 rounded-full"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">New Patient Registration</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                            <input
                                type="text"
                                name="firstName"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                            <input
                                type="text"
                                name="lastName"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                            <select
                                name="gender"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea
                            name="address"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Registering...' : 'Register Patient'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Credentials Modal */}
            {showCredentials && credentials && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Key className="w-5 h-5 text-sky-500" />
                                Login Credentials
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                Please provide these credentials to the patient
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-500">Email</span>
                                </div>
                                <div className="font-medium text-gray-900">{credentials.email}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Key className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-500">Password</span>
                                </div>
                                <div className="font-medium text-gray-900">{credentials.password}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-500 mb-1">Patient Number</div>
                                <div className="font-medium text-gray-900">{credentials.patientNumber}</div>
                            </div>
                            <p className="text-xs text-gray-500 mt-4">
                                A welcome email has been sent to the patient&apos;s email address.
                            </p>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowCredentials(false);
                                    setCredentials(null);
                                    setFormData({
                                        firstName: '',
                                        lastName: '',
                                        email: '',
                                        phone: '',
                                        dateOfBirth: '',
                                        gender: 'MALE',
                                        address: ''
                                    });
                                }}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Register Another
                            </button>
                            <button
                                onClick={() => {
                                    window.print();
                                }}
                                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 flex items-center gap-2"
                            >
                                <Printer className="w-4 h-4" />
                                Print
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Registration;
