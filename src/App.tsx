import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
// Roles

// import PatientDashboard from './pages/patient/Dashboard'; // Placeholder if needed

// Shared Pages
import Dashboard from './pages/Dashboard'; // Is this the wrapper? Let's check logic later.
// Actually, Dashboard was just a wrapper. The moved ones are the role specific ones.
// Current Dashboard.tsx imports from ./dashboards/... so it needs update too.

import Patients from './pages/shared/Patients';
import RegisterPatient from './pages/shared/RegisterPatient';
import PatientDetails from './pages/shared/PatientDetails';
import NewAppointment from './pages/shared/NewAppointment';
import Staff from './pages/admin/StaffList';
import Appointments from './pages/shared/Appointments';
import Consultation from './pages/doctor/Consultation';
import VideoConsultation from './pages/shared/VideoConsultation';

import Medications from './pages/patient/Medications';
import Billing from './pages/patient/Billing';
import Records from './pages/Records';
// Dashboards
import AdminDashboard from './pages/admin/Dashboard';
import AuditLogs from './pages/admin/AuditLogs';
import InpatientDashboard from './pages/inpatient/Dashboard';
import WardDetails from './pages/inpatient/WardDetails';
import VideoCallPage from './pages/shared/VideoCallPage';
import PatientBooking from './pages/patient/Booking';
import DoctorDashboard from './pages/doctor/Dashboard';
import LabDashboard from './pages/lab/LabDashboard';
import ReceptionistDashboard from './pages/receptionist/Dashboard';
import ReceptionistRegistration from './pages/receptionist/Registration';
import ReceptionistBooking from './pages/receptionist/Booking';
import PharmacyDashboard from './pages/pharmacy/Dashboard';

import Settings from './pages/Settings';
import Login from './pages/auth/Login';
import LandingPage from './pages/LandingPage';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/app" element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/patients" element={
            <ProtectedRoute>
              <MainLayout>
                <Patients />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/patients/new" element={
            <ProtectedRoute>
              <MainLayout>
                <RegisterPatient />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/patients/:id" element={
            <ProtectedRoute>
              <MainLayout>
                <PatientDetails />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/consultation/:appointmentId" element={
            <ProtectedRoute>
              <MainLayout>
                <Consultation />
              </MainLayout>
            </ProtectedRoute>
          } />

          { /* Role Based Dashboards */ }
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/audit-logs" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <MainLayout>
                <AuditLogs />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* Inpatient Routes */}
          <Route path="/inpatient" element={
            <ProtectedRoute allowedRoles={['DOCTOR', 'NURSE', 'ADMIN']}>
              <MainLayout>
                <InpatientDashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/inpatient/ward/:id" element={
            <ProtectedRoute allowedRoles={['DOCTOR', 'NURSE', 'ADMIN']}>
              <MainLayout>
                <WardDetails />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* Telemedicine Routes */}
          <Route path="/consultation/video/:appointmentId" element={
            <ProtectedRoute allowedRoles={['DOCTOR', 'PATIENT']}>
               <VideoCallPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/book" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <MainLayout>
                <PatientBooking />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <MainLayout>
                <DoctorDashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/lab-tech" element={
            <ProtectedRoute allowedRoles={['LAB_TECH', 'ADMIN']}>
              <MainLayout>
                <LabDashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/receptionist" element={
            <ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN']}>
              <MainLayout>
                <ReceptionistDashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/receptionist/register" element={
            <ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN']}>
              <MainLayout>
                <ReceptionistRegistration />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/receptionist/booking" element={
            <ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN']}>
              <MainLayout>
                <ReceptionistBooking />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/pharmacy" element={
            <ProtectedRoute allowedRoles={['PHARMACIST', 'ADMIN']}>
              <MainLayout>
                <PharmacyDashboard />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/consultation/video/:appointmentId" element={
            <ProtectedRoute>
              <VideoConsultation />
            </ProtectedRoute>
          } />

          <Route path="/staff" element={
            <ProtectedRoute>
              <MainLayout>
                <Staff />
              </MainLayout>
            </ProtectedRoute>
          } />


          <Route path="/appointments" element={
            <ProtectedRoute>
              <MainLayout>
                <Appointments />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/appointments/new" element={
            <ProtectedRoute>
              <MainLayout>
                <NewAppointment />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/records" element={
            <ProtectedRoute>
              <MainLayout>
                <Records />
              </MainLayout>
            </ProtectedRoute>
           } />

            <Route path="/medications" element={
            <ProtectedRoute>
              <MainLayout>
                <Medications />
              </MainLayout>
            </ProtectedRoute>
           } />

           <Route path="/billing" element={
            <ProtectedRoute>
              <MainLayout>
                <Billing />
              </MainLayout>
            </ProtectedRoute>
           } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
