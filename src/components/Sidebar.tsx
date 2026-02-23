import { LayoutDashboard, Users, UserPlus, Calendar, FileText, Settings, LogOut, Pill, CreditCard, Activity, Building2, BarChart, Video, DollarSign, Bed, BedDouble, Stethoscope, Heart } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Assuming logout exists

  const getNavItems = (role?: string) => {
    const common = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
    ];

    if (role === 'ADMIN') {
      return [
        ...common,
        { icon: Users, label: 'Patients', path: '/patients' },
        { icon: UserPlus, label: 'Staff', path: '/staff' },
        { icon: Calendar, label: 'Appointments', path: '/appointments' },
        { icon: FileText, label: 'Records', path: '/records' },
        { icon: Building2, label: 'Departments', path: '/departments' },
        { icon: BarChart, label: 'Reports', path: '/reports' },
        { icon: DollarSign, label: 'Finance', path: '/finance' },
        { icon: Bed, label: 'Admissions', path: '/admissions' },
        { icon: BedDouble, label: 'Facility & Wards', path: '/admin/facility' },
        { icon: DollarSign, label: 'Payroll', path: '/admin/payroll' },
        { icon: Calendar, label: 'Leaves', path: '/admin/leaves' },
        { icon: Settings, label: 'Leave Settings', path: '/admin/leaves/settings' },
        { icon: Activity, label: 'Radiology', path: '/radiology' },
        { icon: Activity, label: 'Surgery & OT', path: '/surgery' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ];
    }

    if (role === 'DOCTOR') {
      return [
        ...common,
        { icon: Users, label: 'My Patients', path: '/patients' }, // Maybe filter patients?
        { icon: Calendar, label: 'Schedule', path: '/appointments' },
        { icon: Video, label: 'Telemedicine', path: '/doctor/telemedicine' },
        { icon: Activity, label: 'Radiology', path: '/radiology' },
        { icon: Activity, label: 'Surgery & OT', path: '/surgery' },
        { icon: FileText, label: 'Medical Records', path: '/records' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ];
    }

    if (role === 'PATIENT') {
        return [
          ...common,
          { icon: Calendar, label: 'My Appointments', path: '/appointments' },
          { icon: FileText, label: 'My Records', path: '/records' },
          { icon: Pill, label: 'My Medications', path: '/medications' },
          { icon: CreditCard, label: 'My Bills', path: '/billing' },
          { icon: Users, label: 'Find a Doctor', path: '/patient/doctors' },
          { icon: Heart, label: 'Wellness Tracker', path: '/wellness' },
          { icon: Settings, label: 'Profile', path: '/settings' },

        ];
    }

    if (role === 'RECEPTIONIST') {
      return [
        ...common,
        { icon: Users, label: 'Patients', path: '/patients' },
        { icon: Calendar, label: 'Appointments', path: '/appointments' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ];
    }

    if (role === 'NURSE') {
      return [
        ...common,
        { icon: Users, label: 'Patients', path: '/patients' },
        { icon: Activity, label: 'Inpatients', path: '/inpatient' }, // Access to wards
        { icon: Stethoscope, label: 'Treatments', path: '/treatments' },
        { icon: Activity, label: 'Surgery & OT', path: '/surgery' },
        { icon: Calendar, label: 'Schedule', path: '/appointments' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ];
    }

    if (role === 'ACCOUNTANT') {
        return [
          { icon: DollarSign, label: 'Finance Dashboard', path: '/finance' },
          { icon: DollarSign, label: 'Payroll', path: '/admin/payroll' },
          { icon: Settings, label: 'Settings', path: '/settings' },
        ];
    }

    if (role === 'LAB_TECH') {
        return [
          { icon: Activity, label: 'Lab Dashboard', path: '/lab-tech' },
          { icon: Activity, label: 'Radiology', path: '/radiology' },
          { icon: Settings, label: 'Profile', path: '/settings' },
        ];
    }

    if (role === 'PHARMACIST') {
        return [
          { icon: Pill, label: 'Pharmacy Dashboard', path: '/pharmacy' },
          { icon: Settings, label: 'Profile', path: '/settings' },
        ];
    }

    return common;
  };

  const navItems = getNavItems(user?.role);

  return (
    <div className="flex flex-col h-screen w-64 bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">OltraHMS</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={clsx(
                    'flex items-center px-6 py-3 text-sm font-medium transition-colors',
                    isActive 
                      ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button 
            onClick={() => {
                logout();
                navigate('/login');
            }}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
