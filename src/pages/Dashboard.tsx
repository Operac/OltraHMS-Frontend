import { useAuth } from '../context/AuthContext';
import AdminDashboard from './admin/Dashboard';
import DoctorDashboard from './doctor/Dashboard';
import PatientDashboard from './patient/Dashboard';


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
            return <div className="p-6">Nurse Dashboard (Coming Soon)</div>; // Placeholder
        case 'RECEPTIONIST':
            return <div className="p-6">Receptionist Dashboard (Coming Soon)</div>;
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
