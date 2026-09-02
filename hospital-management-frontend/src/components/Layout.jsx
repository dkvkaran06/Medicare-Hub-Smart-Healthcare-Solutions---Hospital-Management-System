import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/doctors', label: 'Doctors', icon: 'doctors' },
  { to: '/patients', label: 'Patients', icon: 'patients' },
  { to: '/departments', label: 'Departments', icon: 'departments' },
  { to: '/appointments', label: 'Appointment', icon: 'appointments' },
  { to: '/medical-records', label: 'Medical Records', icon: 'records' },
  { to: '/billing', label: 'Billing', icon: 'billing' },
];

const doctorLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/appointments', label: 'My Appointments', icon: 'appointments' },
  { to: '/patients', label: 'My Patients', icon: 'patients' },
  { to: '/medical-records', label: 'Medical Records', icon: 'records' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

const patientLinks = [
  { to: '/dashboard', label: 'Home', icon: 'dashboard' },
  { to: '/doctors', label: 'All Doctors', icon: 'doctors' },
  { to: '/appointments', label: 'My Appointments', icon: 'appointments' },
  { to: '/medical-records', label: 'My Records', icon: 'records' },
  { to: '/billing', label: 'My Bills', icon: 'billing' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

function getNavIcon(icon) {
  const icons = {
    dashboard: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    doctors: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" />
      </svg>
    ),
    patients: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    departments: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    appointments: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    records: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    billing: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    settings: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  };
  return icons[icon] || icons.dashboard;
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function MiniCalendar({ onSelect, onClose }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayStr = getToday();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{
      position: 'absolute', top: '110%', right: 0, zIndex: 200,
      background: '#fff', border: '1px solid #BAE6FD',
      borderRadius: '12px', boxShadow: '0 8px 32px rgba(14,165,233,0.15)',
      padding: '16px', width: '260px',
      animation: 'slideUp 0.2s ease'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#0EA5E9', padding: '2px 8px' }}>‹</button>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#0EA5E9', padding: '2px 8px' }}>›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, color: '#94A3B8', padding: '2px' }}>{d}</div>
        ))}
      </div>

      {/* Date cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const isToday = dateStr === todayStr;
          return (
            <button
              key={dateStr}
              onClick={() => { onSelect(dateStr); onClose(); }}
              style={{
                background: isToday ? '#0EA5E9' : 'none',
                color: isToday ? '#fff' : '#0F172A',
                border: 'none', borderRadius: '6px',
                padding: '5px 0', fontSize: '0.82rem',
                cursor: 'pointer', fontWeight: isToday ? 700 : 400,
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => { if (!isToday) e.target.style.background = '#E0F2FE'; }}
              onMouseLeave={e => { if (!isToday) e.target.style.background = 'none'; }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Today shortcut */}
      <button
        onClick={() => { onSelect(todayStr); onClose(); }}
        style={{
          marginTop: '12px', width: '100%', background: '#E0F2FE',
          border: '1px solid #BAE6FD', borderRadius: '6px',
          padding: '6px', fontSize: '0.82rem', fontWeight: 600,
          color: '#0284C7', cursor: 'pointer'
        }}
      >
        Today
      </button>
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (q) navigate(`/doctors?search=${encodeURIComponent(q)}`);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleDateSelect = (dateStr) => {
    navigate(`/appointments?date=${dateStr}`);
  };

  let links = adminLinks;
  if (user?.role === 'doctor') links = doctorLinks;
  if (user?.role === 'patient') links = patientLinks;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-profile">
          <div className="sidebar-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="sidebar-name">{user?.name || 'User'}</div>
          <div className="sidebar-email">{user?.email || 'user@email.com'}</div>
          <button className="btn-logout" onClick={handleLogout}>Log out</button>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              {getNavIcon(link.icon)}
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div className="topbar-search">
            <input
              type="text"
              placeholder="Search Doctor name or Email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <button className="btn-search" onClick={handleSearch}>Search</button>
          </div>

          {/* Date + Mini Calendar */}
          <div ref={calendarRef} style={{ position: 'relative' }}>
            <div
              className="topbar-date"
              onClick={() => setShowCalendar(v => !v)}
              title="Pick a date to filter appointments"
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              <div>
                <div className="date-label">Today's Date</div>
                <div className="date-value">{getToday()}</div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>

            {showCalendar && (
              <MiniCalendar
                onSelect={handleDateSelect}
                onClose={() => setShowCalendar(false)}
              />
            )}
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
