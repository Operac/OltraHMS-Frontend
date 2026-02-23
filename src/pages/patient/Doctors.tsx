import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Calendar, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Doctors = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                // Using the receptionist endpoint as it likely returns the format we need, 
                // or we can use /api/staff/doctors
                const res = await axios.get('http://localhost:3000/api/staff/doctors', {
                     headers: { Authorization: `Bearer ${token}` }
                });
                setDoctors(res.data);
            } catch (err) {
                console.error("Failed to load doctors", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, [token]);

    const filteredDoctors = doctors.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Loading doctors...</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                     <h1 className="text-2xl font-bold text-gray-900">Find a Doctor</h1>
                     <p className="text-gray-500">Book appointments with top specialists</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name or specialty..."
                        className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:ring-2 focus:ring-blue-500"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDoctors.map(doc => (
                    <div key={doc.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                        <div className="p-6 flex flex-col items-center text-center flex-1">
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold mb-4">
                                {doc.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{doc.name}</h3>
                            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mt-2 mb-4">
                                {doc.specialization || 'General Practitioner'}
                            </span>
                            <div className="flex items-center gap-1 text-yellow-500 text-sm mb-4">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="font-medium">4.8</span>
                                <span className="text-gray-400">(124 reviews)</span>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 mt-auto bg-gray-50">
                            <button 
                                onClick={() => navigate(`/appointments/new?doctorId=${doc.id}`)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <Calendar className="w-4 h-4" />
                                Book Appointment
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {filteredDoctors.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No doctors found matching your search.
                </div>
            )}
        </div>
    );
};

export default Doctors;
