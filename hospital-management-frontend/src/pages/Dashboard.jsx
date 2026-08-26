import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAppointments, getBills, getDoctors, getPatients } from '../api/hospitalApi';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [allAppointments, setAllAppointments] = useState([]);
  const [allBills, setAllBills] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';
  const isPatient = user?.role === 'patient';

  // Find linked patient/doctor by email
  const myPatientId = useMemo(() => {
    if (!isPatient) return null;
    const match = patients.find((p) => p.email === user?.email);
    return match ? match.id : null;
  }, [patients, user, isPatient]);

  const myDoctorId = useMemo(() => {
    if (!isDoctor) return null;
    const match = doctors.find((d) => d.email === user?.email);
    return match ? match.id : null;
  }, [doctors, user, isDoctor]);

  useEffect(() => {
    const loadStats = async () => {
      const [patientsRes, doctorsRes, appointmentsRes, billsRes] = await Promise.all([
        getPatients(),
        getDoctors(),
        getAppointments(),
        getBills(),
      ]);

      setPatients(patientsRes.data);
      setDoctors(doctorsRes.data);
      setAllAppointments(appointmentsRes.data);
      setAllBills(billsRes.data);
    };

    loadStats().catch(() => {});
  }, []);

  // Role-based filtered data
  const myAppointments = useMemo(() => {
    if (isAdmin) return allAppointments;
    if (isPatient && myPatientId) return allAppointments.filter((a) => a.patientId === myPatientId);
    if (isDoctor && myDoctorId) return allAppointments.filter((a) => a.doctorId === myDoctorId);
    return [];
  }, [allAppointments, isAdmin, isPatient, isDoctor, myPatientId, myDoctorId]);

  const myBills = useMemo(() => {
    if (isAdmin) return allBills;
    if (isPatient && myPatientId) return allBills.filter((b) => b.patientId === myPatientId);
    return [];
  }, [allBills, isAdmin, isPatient, myPatientId]);

  const myPatients = useMemo(() => {
    if (isAdmin) return patients;
    if (isDoctor && myDoctorId) {
      const patientIds = new Set(allAppointments.filter((a) => a.doctorId === myDoctorId).map((a) => a.patientId));
      return patients.filter((p) => patientIds.has(p.id));
    }
    return [];
  }, [patients, allAppointments, isAdmin, isDoctor, myDoctorId]);

  const stats = {
    patients: isAdmin ? patients.length : isDoctor ? myPatients.length : 0,
    doctors: doctors.length,
    appointments: myAppointments.length,
    pendingBills: myBills.filter((b) => b.paymentStatus === 'PENDING').length,
  };

  const recentAppointments = myAppointments.slice(0, 5);

  const getPatientName = (id) => {
    const p = patients.find((pat) => pat.id === id);
    return p ? p.name : id;
  };

  const getDoctorName = (id) => {
    const d = doctors.find((doc) => doc.id === id);
    return d ? d.name : id;
  };

  return (
    <div className="page-content">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <h3>Welcome!</h3>
        <h2>{user?.name || 'User'}.</h2>
        <p>
          Thanks for joining us. We are always trying to get you a complete service.
          {isDoctor && ' You can view your daily schedule, Reach Patients Appointment at home!'}
          {isAdmin && ' Manage your hospital operations from this dashboard.'}
          {isPatient && ' Find your doctor and book appointments easily!'}
        </p>
        <Link to="/appointments" className="btn-primary">
          View {isAdmin ? '' : 'My '}Appointments
        </Link>
      </div>

      {/* Status Cards */}
      <h3 className="dashboard-label">Status</h3>
      <div className="stat-grid">
        {(isAdmin || isDoctor) && (
          <StatCard
            label={isDoctor ? 'My Patients' : 'All Doctors'}
            value={isDoctor ? stats.patients : stats.doctors}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" />
              </svg>
            }
          />
        )}
        {isAdmin && (
          <StatCard
            label="All Patients"
            value={stats.patients}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
        )}
        <StatCard
          label={isAdmin ? 'NewBooking' : 'My Appointments'}
          value={stats.appointments}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
        {(isAdmin || isPatient) && (
          <StatCard
            label={isPatient ? 'My Pending Bills' : 'Pending Bills'}
            value={stats.pendingBills}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
          />
        )}
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h4>{isAdmin ? 'Upcoming Appointments until Next Friday' : 'My Recent Appointments'}</h4>
          <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '14px' }}>
            {isAdmin
              ? "Here's Quick access to Upcoming Appointments until 7 days. More details available in @Appointment section."
              : 'Your most recent appointments. View all in the Appointments section.'}
          </p>
          {recentAppointments.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Apt. No</th>
                    <th>Patient Name</th>
                    <th>Doctor</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map((apt) => (
                    <tr key={apt.id}>
                      <td>{apt.id}</td>
                      <td>{getPatientName(apt.patientId)}</td>
                      <td>{getDoctorName(apt.doctorId)}</td>
                      <td>{apt.appointmentDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state-inline">
              <p>No upcoming appointments found</p>
            </div>
          )}
          <div style={{ marginTop: '14px' }}>
            <Link to="/appointments" className="btn-add-new" style={{ width: '100%', justifyContent: 'center' }}>
              Show all Appointments
            </Link>
          </div>
        </div>

        <div className="dashboard-section">
          <h4>{isPatient ? 'My Billing Summary' : 'Recent Billing Activity'}</h4>
          <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '14px' }}>
            {isPatient
              ? 'Overview of your billing. More details in the Billing section.'
              : 'Quick overview of recent billing. More details in @Billing section.'}
          </p>
          <div className="empty-state-inline">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ width: 80, height: 80, margin: '0 auto 12px', display: 'block', color: '#E2E8F0' }}>
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <p>View billing details in the Billing section</p>
          </div>
          <div style={{ marginTop: '14px' }}>
            <Link to="/billing" className="btn-add-new" style={{ width: '100%', justifyContent: 'center' }}>
              Show all Bills
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
