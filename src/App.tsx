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
import Doctors from './pages/patient/Doctors';

import Staff from './pages/admin/StaffList';
import Appointments from './pages/shared/Appointments';
import Consultation from './pages/doctor/Consultation';


import Medications from './pages/patient/Medications';
import Billing from './pages/patient/Billing';
import Records from './pages/Records';
// Dashboards
import AdminDashboard from './pages/admin/Dashboard';
import FacilityManagement from './pages/admin/FacilityManagement';
import AuditLogs from './pages/admin/AuditLogs';
import PayrollManagement from './pages/admin/PayrollManagement';
import LeaveManagement from './pages/admin/LeaveManagement';
import LeaveSettings from './pages/admin/LeaveSettings';
import DepartmentList from './pages/admin/DepartmentList';
import ReportsDashboard from './pages/admin/ReportsDashboard';
import InpatientDashboard from './pages/inpatient/Dashboard';
import WardDetails from './pages/inpatient/WardDetails';
import VideoCallPage from './pages/shared/VideoCallPage';
import PatientBooking from './pages/patient/Booking';
import DoctorDashboard from './pages/doctor/Dashboard';
import TelemedicineDashboard from './pages/doctor/TelemedicineDashboard';
import LabDashboard from './pages/lab/LabDashboard';
import ReceptionistDashboard from './pages/receptionist/Dashboard';
import ReceptionistRegistration from './pages/receptionist/Registration';
import ReceptionistBooking from './pages/receptionist/Booking';
import PharmacyDashboard from './pages/pharmacy/Dashboard';
import FinanceDashboard from './pages/finance/Dashboard';
import AdmissionDashboard from './pages/admission/Dashboard';
import TreatmentDashboard from './pages/nurse/TreatmentDashboard';
import RadiologyDashboard from './pages/radiology/RadiologyDashboard';
import RequestImaging from './pages/doctor/RequestImaging';
import SurgeryDashboard from './pages/surgery/SurgeryDashboard';
import BookSurgery from './pages/doctor/BookSurgery';
import WellnessTracker from './pages/patient/WellnessTracker';

import Settings from './pages/Settings';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register'; // New Import
import LandingPage from './pages/LandingPage';
import Theaters from './pages/admin/Theaters';
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
          <Route path="/register" element={<Register />} /> {/* New Route */}
          
          <Route path="/app" element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/patients" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']}>
              <MainLayout>
                <Patients />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/patients/new" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']}>
              <MainLayout>
                <RegisterPatient />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/patients/:id" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']}>
              <MainLayout>
                <PatientDetails />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/consultation/:appointmentId" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
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

          <Route path="/admin/facility" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <MainLayout>
                <FacilityManagement />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/theaters" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <MainLayout>
                <Theaters />
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

          <Route path="/admin/payroll" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
              <MainLayout>
                <PayrollManagement />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/leaves" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <MainLayout>
                <LeaveManagement />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/leaves/settings" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <MainLayout>
                <LeaveSettings />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/departments" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <MainLayout>
                <DepartmentList />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <MainLayout>
                <ReportsDashboard />
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

          <Route path="/treatments" element={
            <ProtectedRoute allowedRoles={['NURSE', 'ADMIN']}>
              <MainLayout>
                <TreatmentDashboard />
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
          
          <Route path="/patient/doctors" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <MainLayout>
                <Doctors />
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
          <Route path="/doctor/telemedicine" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <MainLayout>
                <TelemedicineDashboard />
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
          <Route path="/finance" element={
            <ProtectedRoute allowedRoles={['ACCOUNTANT', 'ADMIN']}>
              <MainLayout>
                <FinanceDashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/admissions" element={
            <ProtectedRoute allowedRoles={['NURSE', 'ADMIN', 'DOCTOR']}>
              <MainLayout>
                <AdmissionDashboard />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* Radiology Routes */}
          <Route path="/radiology" element={
            <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN', 'LAB_TECH']}>
              <MainLayout>
                <RadiologyDashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/radiology/request" element={
            <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
              <MainLayout>
                <RequestImaging />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* Surgery Routes */}
          <Route path="/surgery" element={
            <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN', 'NURSE']}>
              <MainLayout>
                <SurgeryDashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/surgery/book" element={
            <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
              <MainLayout>
                <BookSurgery />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/wellness" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <MainLayout>
                <WellnessTracker />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST']}>
              <MainLayout>
                <Staff />
              </MainLayout>
            </ProtectedRoute>
          } />


          <Route path="/appointments" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT']}>
              <MainLayout>
                <Appointments />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/appointments/new" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT']}>
              <MainLayout>
                <NewAppointment />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/records" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'NURSE', 'PATIENT']}>
              <MainLayout>
                <Records />
              </MainLayout>
            </ProtectedRoute>
           } />

            <Route path="/medications" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <MainLayout>
                <Medications />
              </MainLayout>
            </ProtectedRoute>
           } />

           <Route path="/billing" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
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
