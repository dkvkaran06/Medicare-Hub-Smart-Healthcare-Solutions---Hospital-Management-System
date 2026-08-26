import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Departments from './pages/Departments';
import Appointments from './pages/Appointments';
import MedicalRecords from './pages/MedicalRecords';
import Billing from './pages/Billing';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="patients" element={<ProtectedRoute allowedRoles={['admin', 'doctor']}><Patients /></ProtectedRoute>} />
        <Route path="doctors" element={<ProtectedRoute allowedRoles={['admin', 'patient']}><Doctors /></ProtectedRoute>} />
        <Route path="departments" element={<ProtectedRoute allowedRoles={['admin']}><Departments /></ProtectedRoute>} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="medical-records" element={<MedicalRecords />} />
        <Route path="billing" element={<ProtectedRoute allowedRoles={['admin', 'patient']}><Billing /></ProtectedRoute>} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
