import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getAppointments, getBills, getDoctorByEmail,
  getDoctors, getPatientByEmail, getPatients
} from '../api/hospitalApi';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { cachedFetch } from '../api/cache';

/* ─── helpers ─── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${minutes} ${ampm}`;
}

function formatDateDribbble(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.toLocaleString('default', { month: 'long' });
  const year = d.getFullYear();
  return `${day}, ${month} ${year}`;
}

function getStatusBadge(status, date) {
  let finalStatus = status?.toUpperCase();
  const today = new Date().toISOString().split('T')[0];
  if (finalStatus === 'SCHEDULED' && date < today) {
    finalStatus = 'MISSED';
  }
  const map = {
    SCHEDULED:  { label: 'Upcoming',  color: '#2563EB', bg: '#EFF6FF' },
    COMPLETED:  { label: 'Completed', color: '#16A34A', bg: '#F0FDF4' },
    CANCELLED:  { label: 'Cancelled', color: '#DC2626', bg: '#FEF2F2' },
    MISSED:     { label: 'Missed',    color: '#DC2626', bg: '#FEF2F2' },
  };
  const s = map[finalStatus] || { label: status || '—', color: '#64748B', bg: '#F1F5F9' };
  return <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, color: s.color, background: s.bg }}>{s.label}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [apts, setApts] = useState([]);
  const [docs, setDocs] = useState([]);
  
  useEffect(() => {
    async function load() {
      try {
        let docsData = [];
        await cachedFetch('doctors', getDoctors, d => { docsData = d; setDocs(d); });
        
        let fetchedApts = [];
        if (user.role === 'patient') {
          let pat = null;
          try { pat = (await getPatientByEmail(user.email)).data; } catch {}
          if (pat) fetchedApts = (await getAppointments({ patientId: pat.id })).data;
        } else if (user.role === 'doctor') {
          let doc = null;
          try { doc = (await getDoctorByEmail(user.email)).data; } catch {}
          if (doc) fetchedApts = (await getAppointments({ doctorId: doc.id })).data;
        } else {
          fetchedApts = (await getAppointments()).data;
        }
        setApts(fetchedApts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const docName = (id) => {
    const d = docs.find(x => x.id === id);
    if (!d) return 'Unknown Doctor';
    return d.name.startsWith('Dr.') ? d.name : `Dr. ${d.name}`;
  };

  const docInitial = (id) => {
    const d = docs.find(x => x.id === id);
    if (!d) return 'U';
    const clean = d.name.replace(/^Dr\.\s*/i, '');
    return clean.charAt(0).toUpperCase();
  };

  const docImage = (id) => {
    // Predictably assign male/female photo based on doctor ID
    return (id % 2 === 0) ? '/images/female_doc.jpg' : '/images/male_doc.jpg';
  };

  const docSpec = (id) => {
    const d = docs.find(x => x.id === id);
    return d ? d.specialization : 'Specialist';
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Derive data
  const upcoming = apts.filter(a => a.status?.toUpperCase() === 'SCHEDULED' && a.appointmentDate >= todayStr)
                       .sort((a,b) => a.appointmentDate.localeCompare(b.appointmentDate) || a.appointmentTime.localeCompare(b.appointmentTime));
  
  const nextAppointment = upcoming.length > 0 ? upcoming[0] : null;
  const recentApts = apts.slice(-2).reverse(); // Limit to 2 for compact fit

  // Chart Mock Data
  const lineChartData = [
    { name: 'Jan', value: 60 }, { name: 'Feb', value: 75 }, { name: 'Mar', value: 85 },
    { name: 'Apr', value: 70 }, { name: 'May', value: 95 }, { name: 'Jun', value: 65 },
    { name: 'Jul', value: 80 }, { name: 'Aug', value: 90 },
  ];
  
  const barChartData = [
    { name: 'Jan', Missed: 4, Cancelled: 2, Upcoming: 10 },
    { name: 'Feb', Missed: 2, Cancelled: 1, Upcoming: 14 },
    { name: 'Mar', Missed: 5, Cancelled: 3, Upcoming: 12 },
    { name: 'Apr', Missed: 1, Cancelled: 0, Upcoming: 18 },
    { name: 'May', Missed: 3, Cancelled: 2, Upcoming: 15 },
    { name: 'Jun', Missed: 2, Cancelled: 1, Upcoming: 20 },
  ];

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading dashboard...</div>;

  return (
    <div className="dashboard-grid">
      
      {/* ─── LEFT COLUMN ─── */}
      <div className="dash-col-left">
        <div className="hero-banner">
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋</h1>
          <p>Here's your healthcare overview for today.</p>
          <div className="hero-progress">
            <div className="hero-progress-fill" style={{ width: upcoming.length > 0 ? '80%' : '10%' }}></div>
          </div>
        </div>

        <div>
          <div className="section-header">
            <h3>Upcoming Schedule</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>View All</span>
          </div>
          <div className="pill-list">
            {upcoming.slice(0,2).map((apt, i) => (
              <div className="pill-card" key={i}>
                <div className="pill-left">
                  <div className="pill-avatar" style={{ padding: 0, overflow: 'hidden' }}>
                    <img src={docImage(apt.doctorId)} alt="Doctor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="pill-info">
                    <h4>{docName(apt.doctorId)}</h4>
                    <p>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      {docSpec(apt.doctorId)}
                    </p>
                  </div>
                </div>
                <div className="pill-right">
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>{formatTime(apt.appointmentTime)}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)' }}><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </div>
            ))}
            {upcoming.length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No upcoming schedules</div>}
          </div>
        </div>

        <div>
          <div className="section-header" style={{ marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
            <h3>Recent Appointments</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Your 4 most recent appointments</span>
          </div>
          <div className="pill-list">
            {recentApts.map((apt, i) => (
              <div className="pill-card" key={i} style={{ borderRadius: 'var(--radius-md)', padding: '16px' }}>
                <div className="pill-left">
                  <div className="pill-avatar" style={{ padding: 0, overflow: 'hidden' }}>
                    <img src={docImage(apt.doctorId)} alt="Doctor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="pill-info">
                    <h4>{docName(apt.doctorId)}</h4>
                    <p style={{ marginTop: 2 }}>{apt.appointmentDate} • {formatTime(apt.appointmentTime)}</p>
                  </div>
                </div>
                <div className="pill-right">
                  {getStatusBadge(apt.status, apt.appointmentDate)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── MIDDLE COLUMN ─── */}
      <div className="dash-col-middle">
        
        {/* Find Doctor CTA */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', marginBottom: '16px', border: '1px solid var(--color-border-light)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: '#111827' }}>Find the right doctor for you</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 16 }}>Search by doctor, specialty or department</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 12, top: 10, color: '#9CA3AF' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Search doctors or specialties..." style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.9rem' }} />
            </div>
            <Link to="/doctors" style={{ background: '#111827', color: '#fff', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Find Doctor
            </Link>
          </div>
        </div>

        <div className="stat-grid-3">
          <div className="stat-card-modern red">
            <div className="stat-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div>
              <div className="stat-label">Total Appointments</div>
              <div className="stat-value">{apts.length}</div>
            </div>
          </div>
          <div className="stat-card-modern yellow">
            <div className="stat-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <div>
              <div className="stat-label">Medical Records</div>
              <div className="stat-value">2</div>
            </div>
          </div>
          <div className="stat-card-modern green">
            <div className="stat-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div>
              <div className="stat-label">Health Score</div>
              <div className="stat-value">87.5 / 100</div>
            </div>
          </div>
        </div>

        <div className="chart-card" style={{ height: 160 }}>
          <div className="chart-header">
            <h3>Health Score</h3>
            <span style={{ fontSize: '0.8rem', background: '#F1F5F9', padding: '4px 12px', borderRadius: '999px', color: '#64748B', fontWeight: 600 }}>This Year ▼</span>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dx={-10} />
              <Tooltip cursor={{stroke: '#7C3AED', strokeWidth: 1, strokeDasharray: '3 3'}} contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
              <Line type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={3} dot={{r: 4, fill: '#7C3AED', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card" style={{ height: 200 }}>
          <div className="chart-header">
            <h3>Appointments Overview</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', gap: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{width: 8, height: 8, borderRadius: '50%', background: '#7C3AED'}}></div> Upcoming</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{width: 8, height: 8, borderRadius: '50%', background: '#111827'}}></div> Cancelled</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{width: 8, height: 8, borderRadius: '50%', background: '#E5E7EB'}}></div> Missed</span>
            </span>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={barChartData} barSize={12}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dx={-10} label={{ value: 'Appointments', angle: -90, position: 'insideLeft', fill: '#9CA3AF', fontSize: 12, dy: 40 }} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
              <Bar dataKey="Upcoming" fill="#7C3AED" radius={[10, 10, 10, 10]} />
              <Bar dataKey="Cancelled" fill="#111827" radius={[10, 10, 10, 10]} />
              <Bar dataKey="Missed" fill="#E5E7EB" radius={[10, 10, 10, 10]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── RIGHT COLUMN ─── */}
      <div className="dash-col-right">
        {nextAppointment ? (
          <div className="featured-doctor-card" style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF2FF 100%)', position: 'relative', padding: '24px 24px 0 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, borderRadius: 'var(--radius-lg)', border: 'none', boxShadow: 'none' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, textAlign: 'left' }}>
               <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#1F2937', margin: 0 }}>Upcoming</h3>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#1F2937', margin: 0 }}>Appointments</h3>
               </div>
               <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4B5563' }}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
               </div>
            </div>

            {/* Doctor Name & Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, zIndex: 10, position: 'relative', textAlign: 'left' }}>
               <div>
                 <h2 style={{ fontSize: '1.7rem', fontWeight: 500, margin: '0 0 12px 0', color: '#111827', letterSpacing: '-0.5px' }}>{docName(nextAppointment.doctorId)}</h2>
                 <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#6366F1', color: '#fff', padding: '6px 16px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 500 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    {docSpec(nextAppointment.doctorId)}
                 </span>
               </div>
               <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1F2937', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0 }}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M8 10h.01M12 10h.01M16 10h.01" /></svg>
               </div>
            </div>

            {/* Huge Image container */}
            <div style={{ position: 'relative', height: '240px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 1 }}>
               <img src={docImage(nextAppointment.doctorId)} alt="Doctor" style={{ height: '110%', objectFit: 'contain', maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)' }} />
            </div>

            {/* Overlapping Info Card */}
            <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', borderRadius: '24px 24px var(--radius-lg) var(--radius-lg)', padding: '24px', margin: '0 -24px 0 -24px', zIndex: 10, position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
               <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 8px 0', color: '#1F2937' }}>About {docName(nextAppointment.doctorId)}</h3>
               <p style={{ fontSize: '0.85rem', color: '#9CA3AF', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                 She is a senior cardiologist with over 12 years of experience in interventional cardiology, specializing in coronary artery disease and heart... <span style={{ color: '#9CA3AF', cursor: 'pointer' }}>Read more</span>
               </p>

               <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', fontWeight: 500, color: '#374151', background: '#F8FAFC', padding: '8px 14px', borderRadius: '999px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {formatDateDribbble(nextAppointment.appointmentDate)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', fontWeight: 500, color: '#374151', background: '#F8FAFC', padding: '8px 14px', borderRadius: '999px' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    45 Minutes
                  </div>
               </div>

               <Link to={`/appointments?date=${nextAppointment.appointmentDate}`} style={{ marginTop: 'auto', background: '#1F2937', color: '#fff', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', textDecoration: 'none', fontWeight: 400, fontSize: '0.95rem' }}>
                 Check Appointment
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
               </Link>
            </div>
          </div>
        ) : (
          <div className="featured-doctor-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, background: '#fff' }}>
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{color: '#E5E7EB', marginBottom: 16}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
             <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>No Upcoming Appointments</h3>
             <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 24 }}>You don't have any scheduled appointments.</p>
             <Link to="/doctors" className="btn-check-appointment">Book an Appointment</Link>
          </div>
        )}
      </div>

    </div>
  );
}
