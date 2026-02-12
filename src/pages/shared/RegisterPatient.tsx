import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Save, User, MapPin, Heart, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RegisterPatient = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: 'MALE',
        address: '',
        bloodGroup: '',
        genotype: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
                gender: formData.gender,
                address: formData.address,
                bloodGroup: formData.bloodGroup || undefined,
                genotype: formData.genotype || undefined,
                emergencyContact: {
                    name: formData.emergencyContactName,
                    phone: formData.emergencyContactPhone,
                    relationship: formData.emergencyContactRelation
                }
            };

            await axios.post('http://localhost:3000/api/patients', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            navigate('/patients');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register patient');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto animate-in fade-in duration-500">
            <button 
                onClick={() => navigate('/patients')}
                className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
            >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Patient List
            </button>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Register New Patient</h1>
                    <p className="text-gray-500 mt-1">Create a new patient record and unique HMS ID.</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                                required
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                type="text"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                                required
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                type="text"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                required
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                type="email"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                            <input
                                required
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                type="date"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                        Contact Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                required
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                type="tel"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                                required
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                type="text"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Medical & Emergency */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Heart className="w-5 h-5 mr-2 text-blue-600" />
                        Medical & Emergency
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                            <select
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="">Select...</option>
                                <option value="A_POSITIVE">A+</option>
                                <option value="A_NEGATIVE">A-</option>
                                <option value="B_POSITIVE">B+</option>
                                <option value="B_NEGATIVE">B-</option>
                                <option value="O_POSITIVE">O+</option>
                                <option value="O_NEGATIVE">O-</option>
                                <option value="AB_POSITIVE">AB+</option>
                                <option value="AB_NEGATIVE">AB-</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Genotype</label>
                            <select
                                name="genotype"
                                value={formData.genotype}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="">Select...</option>
                                <option value="AA">AA</option>
                                <option value="AS">AS</option>
                                <option value="SS">SS</option>
                                <option value="AC">AC</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-4">
                         <h4 className="text-sm font-medium text-gray-900 mb-4">Emergency Contact</h4>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    name="emergencyContactName"
                                    value={formData.emergencyContactName}
                                    onChange={handleChange}
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    name="emergencyContactPhone"
                                    value={formData.emergencyContactPhone}
                                    onChange={handleChange}
                                    type="tel"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                                <input
                                    name="emergencyContactRelation"
                                    value={formData.emergencyContactRelation}
                                    onChange={handleChange}
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                         </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Registering...' : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Register Patient
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterPatient;
