import { useAuth } from '../context/AuthContext';
import DoctorMedicalRecords from './doctor/MedicalRecords';
import PatientMedicalRecords from './patient/Records'; // Corrected import path

const Records = () => {
    const { user } = useAuth();

    if (user?.role === 'DOCTOR') {
        return <DoctorMedicalRecords />;
    }

    if (user?.role === 'PATIENT' || user?.role === 'ADMIN') {
        return <PatientMedicalRecords />;
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Medical Records</h2>
            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                <p className="text-gray-500">Record management features coming soon for {user?.role}.</p>
            </div>
        </div>
    );
};
export default Records;
