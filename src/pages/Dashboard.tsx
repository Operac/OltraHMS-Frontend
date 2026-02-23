import { useAuth } from '../context/AuthContext';
import AdminDashboard from './admin/Dashboard';
import DoctorDashboard from './doctor/Dashboard';
import PatientDashboard from './patient/Dashboard';
import ReceptionistDashboard from './receptionist/Dashboard';
import InpatientDashboard from './inpatient/Dashboard';
import FinanceDashboard from './finance/Dashboard';
import LabDashboard from './lab/LabDashboard';
import PharmacyDashboard from './pharmacy/Dashboard';


const Dashboard = () => {
    const { user } = useAuth();
    
    // In a real app, user might be null initially, handle loading if needed.
    // AuthContext usually ensures user is present if ProtectedRoute is used.
    
    if (!user) {
        return <div>Loading user profile...</div>; 
    }

    switch (user.role) {
        case 'ADMIN':
            return <AdminDashboard />;
        case 'DOCTOR':
            return <DoctorDashboard />;
        case 'PATIENT':
            return <PatientDashboard />;
        case 'NURSE':
            return <InpatientDashboard />;
        case 'RECEPTIONIST':
            return <ReceptionistDashboard />;
        case 'ACCOUNTANT':
            return <FinanceDashboard />;
        case 'LAB_TECH':
            return <LabDashboard />;
        case 'PHARMACIST':
            return <PharmacyDashboard />;
        default:
            return (
                <div className="p-6 text-center">
                    <h2 className="text-xl font-bold">Welcome, {user.firstName}</h2>
                    <p className="text-gray-500">Your role ({user.role}) does not have a specific dashboard yet.</p>
                </div>
            );
    }
};

export default Dashboard;
