import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getAppointments, getBills, getDoctorByEmail,
  getDoctors, getPatientByEmail, getPatients
} from '../api/hospitalApi';
import { useAuth } from '../context/AuthContext';

/* ─── helpers ─── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatCurrency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

function getStatusBadge(status) {
  const map = {
    SCHEDULED:  { label: 'Scheduled',  cls: 'badge-info'    },
    COMPLETED:  { label: 'Completed',  cls: 'badge-success' },
    CANCELLED:  { label: 'Cancelled',  cls: 'badge-danger'  },
    PENDING:    { label: 'Pending',    cls: 'badge-warning' },
  };
  const s = map[status?.toUpperCase()] || { label: status || '—', cls: 'badge-info' };
  return <span className={`status-badge ${s.cls}`}>{s.label}</span>;
}

/* ─── sub-components ─── */

/** Search banner — only shown to patients */
function FindDoctorBanner() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const handleSearch = () => {
    if (q.trim()) navigate(`/doctors?search=${encodeURIComponent(q.trim())}`);
    else navigate('/doctors');
  };
  return (
    <div className="db-find-banner">
      <div className="db-find-banner-text">
        <h3>Find the right doctor for your needs</h3>
        <p>Search by name, specialty, or department — then book in seconds.</p>
      </div>
      <div className="db-find-banner-search">
        <div className="db-find-input-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search doctors or specialties…"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button className="db-find-btn" onClick={handleSearch}>Find a Doctor</button>
      </div>
    </div>
  );
}

/** Clickable overview stat card */
function OverviewCard({ icon, label, value, sub, to, color }) {
  return (
    <Link to={to} className="db-overview-card" data-color={color}>
      <div className="db-overview-icon">{icon}</div>
      <div className="db-overview-body">
        <div className="db-overview-value">{value}</div>
        <div className="db-overview-label">{label}</div>
        {sub && <div className="db-overview-sub">{sub}</div>}
      </div>
      <div className="db-overview-arrow">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </div>
    </Link>
  );
}

/* ─── main component ─── */
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allAppointments, setAllAppointments] = useState([]);
  const [allBills,        setAllBills]        = useState([]);
  const [doctors,         setDoctors]         = useState([]);
  const [patients,        setPatients]        = useState([]);
  const [loading,         setLoading]         = useState(true);

  const isAdmin   = user?.role === 'admin';
  const isDoctor  = user?.role === 'doctor';
  const isPatient = user?.role === 'patient';

  /* linked patient/doctor */
  const myPatient = useMemo(() =>
    isPatient ? patients.find(p => p.email === user?.email) : null,
    [patients, user, isPatient]);

  const myDoctor = useMemo(() =>
    isDoctor ? doctors.find(d => d.email === user?.email) : null,
    [doctors, user, isDoctor]);

  const myPatientId = myPatient?.id ?? null;
  const myDoctorId  = myDoctor?.id  ?? null;

  useEffect(() => {
    (async () => {
      try {
        if (isPatient) {
          let myPat = null;
          try { myPat = (await getPatientByEmail(user.email)).data; } catch { /* ok */ }
          const [aptsRes, billsRes, docsRes] = await Promise.all([
            myPat ? getAppointments({ patientId: myPat.id }) : Promise.resolve({ data: [] }),
            myPat ? getBills({ patientId: myPat.id })        : Promise.resolve({ data: [] }),
            getDoctors(),
          ]);
          setPatients(myPat ? [myPat] : []);
          setDoctors(docsRes.data);
          setAllAppointments(aptsRes.data);
          setAllBills(billsRes.data);
        } else if (isDoctor) {
          let myDoc = null;
          try { myDoc = (await getDoctorByEmail(user.email)).data; } catch { /* ok */ }
          const [aptsRes, patsRes, docsRes] = await Promise.all([
            myDoc ? getAppointments({ doctorId: myDoc.id }) : Promise.resolve({ data: [] }),
            getPatients(),
            getDoctors(),
          ]);
          setPatients(patsRes.data);
          setDoctors(docsRes.data);
          setAllAppointments(aptsRes.data);
          setAllBills([]);
        } else {
          const [patsRes, docsRes, aptsRes, billsRes] = await Promise.all([
            getPatients(), getDoctors(), getAppointments(), getBills(),
          ]);
          setPatients(patsRes.data);
          setDoctors(docsRes.data);
          setAllAppointments(aptsRes.data);
          setAllBills(billsRes.data);
        }
      } catch { /* silently ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  /* filtered data */
  const myAppointments = useMemo(() => {
    if (isAdmin)   return allAppointments;
    if (isPatient && myPatientId) return allAppointments.filter(a => a.patientId === myPatientId);
    if (isDoctor  && myDoctorId)  return allAppointments.filter(a => a.doctorId  === myDoctorId);
    return [];
  }, [allAppointments, isAdmin, isPatient, isDoctor, myPatientId, myDoctorId]);

  const myBills = useMemo(() => {
    if (isAdmin)   return allBills;
    if (isPatient && myPatientId) return allBills.filter(b => b.patientId === myPatientId);
    return [];
  }, [allBills, isAdmin, isPatient, myPatientId]);

  const myPatients = useMemo(() => {
    if (isAdmin) return patients;
    if (isDoctor && myDoctorId) {
      const ids = new Set(allAppointments.filter(a => a.doctorId === myDoctorId).map(a => a.patientId));
      return patients.filter(p => ids.has(p.id));
    }
    return [];
  }, [patients, allAppointments, isAdmin, isDoctor, myDoctorId]);

  const pendingBills   = myBills.filter(b => b.paymentStatus === 'PENDING');
  const pendingAmount  = pendingBills.reduce((s, b) => s + (b.amount || 0), 0);
  const upcomingApts   = myAppointments
    .filter(a => a.appointmentDate >= new Date().toISOString().split('T')[0])
    .sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate))
    .slice(0, 5);

  /* lookup helpers */
  const getPatientName = id => patients.find(p => p.id === id)?.name || `Patient #${id}`;
  const getDoctorName  = id => doctors.find(d => d.id === id)?.name  || `Doctor #${id}`;

  /* ── medical records count (stored on patient object if available) */
  const medicalRecordsCount = myPatient?.medicalRecordsCount ?? 0;

  return (
    <div className="page-content">

      {/* ── Greeting ─────────────────────────────────────── */}
      <div className="db-greeting">
        <div>
          <h1 className="db-greeting-title">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="db-greeting-sub">
            {isPatient && "Here's your healthcare overview for today."}
            {isDoctor  && "Here's your schedule and patient overview for today."}
            {isAdmin   && "Here's your hospital operations summary for today."}
          </p>
        </div>
      </div>

      {/* ── Find a Doctor banner (patients only) ─────────── */}
      {isPatient && <FindDoctorBanner />}

      {/* ── Overview stat cards ───────────────────────────── */}
      <h2 className="db-section-title">Your Overview</h2>
      <div className="db-overview-grid">
        {/* Appointments */}
        <OverviewCard
          color="blue"
          to="/appointments"
          label={isAdmin ? 'Total Appointments' : isDoctor ? 'My Appointments' : 'Appointments'}
          value={loading ? '—' : myAppointments.length}
          sub="View all →"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          }
        />

        {/* Pending Bills — patients + admin */}
        {(isPatient || isAdmin) && (
          <OverviewCard
            color="amber"
            to="/billing"
            label={isAdmin ? 'Pending Bills' : 'Pending Bills'}
            value={loading ? '—' : isPatient ? formatCurrency(pendingAmount) : pendingBills.length}
            sub={isPatient ? `${pendingBills.length} invoice${pendingBills.length !== 1 ? 's' : ''} pending` : 'View all →'}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            }
          />
        )}

        {/* Medical Records — patients */}
        {isPatient && (
          <OverviewCard
            color="purple"
            to="/medical-records"
            label="Medical Records"
            value={loading ? '—' : medicalRecordsCount}
            sub="View records →"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            }
          />
        )}

        {/* My Patients — doctors */}
        {isDoctor && (
          <OverviewCard
            color="green"
            to="/patients"
            label="My Patients"
            value={loading ? '—' : myPatients.length}
            sub="View all →"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            }
          />
        )}

        {/* All Doctors / Patients — admin */}
        {isAdmin && (
          <>
            <OverviewCard
              color="green"
              to="/doctors"
              label="All Doctors"
              value={loading ? '—' : doctors.length}
              sub="View all →"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                  <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
                </svg>
              }
            />
            <OverviewCard
              color="purple"
              to="/patients"
              label="All Patients"
              value={loading ? '—' : patients.length}
              sub="View all →"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              }
            />
          </>
        )}
      </div>

      {/* ── Upcoming Appointment ──────────────────────────── */}
      <h2 className="db-section-title" style={{ marginTop: '32px' }}>
        {isAdmin ? 'Upcoming Appointments' : isDoctor ? 'My Upcoming Appointments' : 'Upcoming Appointment'}
      </h2>

      <div className="db-apt-section">
        {loading ? (
          <div className="db-empty-state">
            <p style={{ color: 'var(--color-text-muted)' }}>Loading…</p>
          </div>
        ) : upcomingApts.length > 0 ? (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient</th>
                    {!isPatient && <th>Doctor</th>}
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingApts.map(apt => (
                    <tr key={apt.id}>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{apt.id}</td>
                      <td>{getPatientName(apt.patientId)}</td>
                      {!isPatient && <td>{getDoctorName(apt.doctorId)}</td>}
                      <td>{apt.appointmentDate}</td>
                      <td>{getStatusBadge(apt.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
              <Link to="/appointments" className="btn-add-new">View all appointments</Link>
            </div>
          </>
        ) : (
          /* ── Actionable empty state ── */
          <div className="db-empty-state">
            <div className="db-empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            {isPatient ? (
              <>
                <p className="db-empty-title">No upcoming appointments</p>
                <p className="db-empty-body">
                  You don't have any appointments scheduled yet.<br/>
                  Find a doctor and book your first appointment.
                </p>
                <Link to="/doctors" className="btn-primary db-empty-cta">Find a Doctor</Link>
              </>
            ) : isDoctor ? (
              <>
                <p className="db-empty-title">No upcoming appointments</p>
                <p className="db-empty-body">You have no appointments scheduled for the coming days.</p>
              </>
            ) : (
              <>
                <p className="db-empty-title">No upcoming appointments</p>
                <p className="db-empty-body">There are no appointments scheduled in the system yet.</p>
                <Link to="/appointments" className="btn-primary db-empty-cta">Go to Appointments</Link>
              </>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
