import { useState, useEffect } from 'react';
import { BedDouble, Activity } from 'lucide-react';
import { inpatientService as InpatientService } from '../../services/inpatient.service';
import { useNavigate } from 'react-router-dom';

const InpatientDashboard = () => {
    const [wards, setWards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadWards();
    }, []);

    const loadWards = async () => {
        try {
            const data = await InpatientService.getAllWards();
            setWards(data);
        } catch (error) {
            console.error("Failed to load wards");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BedDouble className="w-8 h-8 text-blue-600" /> Inpatient Wards
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div>Loading...</div>
                ) : wards.length === 0 ? (
                    <div className="text-gray-500">No wards found. Seed database first!</div>
                ) : wards.map((ward) => (
                    <div 
                        key={ward.id} 
                        onClick={() => navigate(`/inpatient/ward/${ward.id}`)}
                        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{ward.name}</h3>
                                <div className="text-sm text-gray-500 uppercase">{ward.type}</div>
                            </div>
                            <div className={`p-2 rounded-lg ${
                                ward.type === 'ICU' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                                <Activity className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Occupancy</span>
                                <span className="font-medium text-gray-900">
                                    {ward.stats.occupied} / {ward.stats.total}
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full ${
                                        ward.stats.occupied / ward.stats.total > 0.8 ? 'bg-red-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${(ward.stats.occupied / ward.stats.total) * 100}%` }}
                                />
                            </div>
                            
                            <div className="flex gap-4 text-xs pt-2 border-t border-gray-50">
                                <div className="flex items-center gap-1 text-green-600">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    {ward.stats.available} Available
                                </div>
                                <div className="flex items-center gap-1 text-yellow-600">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    {ward.stats.dirty} Cleaning Needed
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InpatientDashboard;
