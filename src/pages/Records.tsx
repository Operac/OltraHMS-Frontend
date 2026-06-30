import { useAuth } from '../context/AuthContext';
import DoctorMedicalRecords from './doctor/MedicalRecords';
import PatientMedicalRecords from './patient/Records'; // Corrected import path
import { Role } from '../constants/roles';

const Records = () => {
    const { user } = useAuth();

    // These roles can view all medical records
    if ([Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.LAB_TECH, Role.PHARMACIST, Role.RADIOLOGIST, Role.ACCOUNTANT, Role.INSURANCE_OFFICER].includes(user?.role as any)) {
        return <DoctorMedicalRecords />;
    }

    if (user?.role === Role.PATIENT) {
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
