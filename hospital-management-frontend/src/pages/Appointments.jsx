import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  createAppointment, deleteAppointment, getAppointments,
  getDoctorByEmail, getDoctors, getPatientByEmail, getPatients, updateAppointment
} from '../api/hospitalApi';
import { cachedFetch, invalidate } from '../api/cache';
import { useAuth } from '../context/AuthContext';

const emptyForm = { id: null, appointmentDate: '', appointmentTime: '', status: 'SCHEDULED', patientId: '', doctorId: '' };

const STATUS_TABS = ['All', 'Upcoming', 'Completed', 'Cancelled', 'Missed'];

function SkeletonRow({ cols }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}>
          <div style={{ height: '14px', borderRadius: '6px', background: 'linear-gradient(90deg,#E0F2FE 25%,#BAE6FD 50%,#E0F2FE 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', width: i === 0 ? '60%' : '85%' }} />
        </td>
      ))}
    </tr>
  );
}

function StatusBadge({ status, date }) {
  let key = status?.toLowerCase();
  const today = new Date().toISOString().split('T')[0];
  if (key === 'scheduled' && date < today) key = 'missed';

  const map = {
    scheduled:  { label: '🟢 Scheduled',  cls: 'badge-info'    },
    completed:  { label: '✅ Completed',  cls: 'badge-success' },
    cancelled:  { label: '🔴 Cancelled',  cls: 'badge-danger'  },
    missed:     { label: '⚪ Missed',     cls: 'badge-danger'  },
  };
  const s = map[key] || { label: status || '—', cls: 'badge-info' };
  return <span className={`status-badge ${s.cls}`}>{s.label}</span>;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(t) {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export default function Appointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [searchParams] = useSearchParams();

  const isAdmin   = user?.role === 'admin';
  const isDoctor  = user?.role === 'doctor';
  const isPatient = user?.role === 'patient';

  const patientNameById = useMemo(() => patients.reduce((acc, p) => { acc[p.id] = p.name; return acc; }, {}), [patients]);
  const doctorNameById  = useMemo(() => doctors.reduce((acc, d) => { acc[d.id] = d.name; return acc; }, {}), [doctors]);
  const doctorSpecById  = useMemo(() => doctors.reduce((acc, d) => { acc[d.id] = d.specialization; return acc; }, {}), [doctors]);

  const myPatientId = useMemo(() => {
    if (!isPatient) return null;
    return patients.find(p => p.email === user?.email)?.id ?? null;
  }, [patients, user, isPatient]);

  const myDoctorId = useMemo(() => {
    if (!isDoctor) return null;
    return doctors.find(d => d.email === user?.email)?.id ?? null;
  }, [doctors, user, isDoctor]);

  useEffect(() => {
    const d = searchParams.get('date');
    if (d) setFilterDate(d);

    const docId = searchParams.get('bookDoctor');
    if (docId && isPatient && myPatientId) {
      setForm({ ...emptyForm, doctorId: docId, patientId: String(myPatientId) });
      setShowForm(true);
      navigate('/appointments', { replace: true });
    }
  }, [searchParams, isPatient, myPatientId, navigate]);

  const loadData = async (bustCache = false) => {
    if (bustCache) { invalidate('appointments'); invalidate('patients'); invalidate('doctors'); }
    if (isPatient) {
      let myPat = null;
      try { myPat = (await getPatientByEmail(user.email)).data; } catch { myPat = null; }
      const [aptRes] = await Promise.all([
        myPat ? getAppointments({ patientId: myPat.id }) : Promise.resolve({ data: [] }),
        cachedFetch('doctors', getDoctors, setDoctors) ?? Promise.resolve()
      ]);
      if (aptRes) setAppointments(aptRes.data);
      setPatients(myPat ? [myPat] : []);
      setLoading(false);
      return;
    }
    if (isDoctor) {
      let myDoc = null;
      try { myDoc = (await getDoctorByEmail(user.email)).data; } catch { myDoc = null; }
      const [aptRes] = await Promise.all([
        myDoc ? getAppointments({ doctorId: myDoc.id }) : Promise.resolve({ data: [] }),
        cachedFetch('patients', getPatients, setPatients),
        cachedFetch('doctors', getDoctors, setDoctors),
      ]);
      if (aptRes) setAppointments(aptRes.data);
      setLoading(false);
      return;
    }
    await Promise.all([
      cachedFetch('appointments', getAppointments, (d) => { setAppointments(d); setLoading(false); }),
      cachedFetch('patients', getPatients, setPatients),
      cachedFetch('doctors', getDoctors, setDoctors),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadData().catch(() => { showMessage('Failed to load appointments', 'error'); setLoading(false); });
  }, []);

  const showMessage = (msg, type = 'error') => { setMessage(msg); setMessageType(type); setTimeout(() => setMessage(''), 4000); };
  const handleChange = (e) => setForm(c => ({ ...c, [e.target.name]: e.target.value }));
  const resetForm = () => { setForm(emptyForm); setShowForm(false); };
  const handleAddNew = () => {
    setForm({ ...emptyForm, patientId: isPatient ? String(myPatientId) : '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, patientId: Number(form.patientId), doctorId: Number(form.doctorId) };
    try {
      if (form.id) { await updateAppointment(form.id, payload); showMessage('Appointment updated successfully', 'success'); }
      else { await createAppointment(payload); showMessage('Appointment created successfully', 'success'); }
      resetForm(); await loadData(true);
    } catch (err) { showMessage(err.response?.data?.message || 'Failed to save appointment', 'error'); }
  };

  const handleEdit = (apt) => { setForm({ ...apt, patientId: apt.patientId ? String(apt.patientId) : '', doctorId: apt.doctorId ? String(apt.doctorId) : '' }); setShowForm(true); };
  const handleDelete = async (id) => {
    try { await deleteAppointment(id); showMessage('Deleted successfully', 'success'); await loadData(true); }
    catch (err) { showMessage(err.response?.data?.message || 'Failed to delete', 'error'); }
  };

  const today = new Date().toISOString().split('T')[0];

  const baseFiltered = appointments.filter(apt => {
    if (isPatient && apt.patientId !== myPatientId) return false;
    if (isDoctor  && apt.doctorId  !== myDoctorId)  return false;
    if (filterDate   && apt.appointmentDate !== filterDate) return false;
    if (filterDoctor && String(apt.doctorId) !== filterDoctor) return false;
    return true;
  });

  const tabFiltered = baseFiltered.filter(apt => {
    const isPast = apt.appointmentDate < today;
    const status = apt.status?.toUpperCase();
    if (activeTab === 'All')       return true;
    if (activeTab === 'Upcoming')  return !isPast && status === 'SCHEDULED';
    if (activeTab === 'Completed') return status === 'COMPLETED';
    if (activeTab === 'Cancelled') return status === 'CANCELLED';
    if (activeTab === 'Missed')    return isPast && status === 'SCHEDULED';
    return true;
  });

  const canAdd    = isAdmin || isPatient;
  const canEdit   = isAdmin || isDoctor;
  const canDelete = isAdmin;
  const colCount  = canEdit || canDelete ? 7 : 6;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-back" onClick={() => window.history.back()}>← Back</button>
          <h2 className="page-title">
            {isPatient ? 'My Appointments' : isDoctor ? 'My Schedule' : 'Schedule Manager'}
          </h2>
        </div>
        {canAdd && <button className="btn-add-new" onClick={handleAddNew}>+ Add Appointment</button>}
      </div>

      {message && <div className={`error-banner ${messageType}`}>{message}</div>}

      {/* ── Tab filter (patients + doctors) ── */}
      {!isAdmin && (
        <div className="apt-tabs">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              className={`apt-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              <span className="apt-tab-count">
                {tab === 'All' ? baseFiltered.length
                  : tab === 'Upcoming'  ? baseFiltered.filter(a => a.appointmentDate >= today && a.status?.toUpperCase() === 'SCHEDULED').length
                  : baseFiltered.filter(a => a.status?.toUpperCase() === tab.toUpperCase()).length}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── Admin filters ── */}
      {isAdmin && (
        <div className="page-card" style={{ marginBottom: 16 }}>
          <div className="filter-row">
            <label>Date:</label>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            <label>Doctor:</label>
            <select value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)}>
              <option value="">All Doctors</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <button className="btn-filter" onClick={() => { setFilterDate(''); setFilterDoctor(''); }}>⟲ Clear</button>
          </div>
        </div>
      )}

      {/* ── Patient / Doctor: card view ── */}
      {!isAdmin ? (
        loading ? (
          <div className="apt-card-list">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="apt-card skeleton">
                <div className="skeleton-box" style={{ width: '40%', height: 12, marginBottom: 12 }} />
                <div className="skeleton-box" style={{ width: '60%', height: 16, marginBottom: 8 }} />
                <div className="skeleton-box" style={{ width: '80%', height: 12 }} />
              </div>
            ))}
          </div>
        ) : tabFiltered.length === 0 ? (
          <div className="db-empty-state" style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '64px 24px' }}>
            <div className="db-empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <p className="db-empty-title">
              {activeTab === 'All' ? 'No appointments yet' : `No ${activeTab.toLowerCase()} appointments`}
            </p>
            <p className="db-empty-body">
              {activeTab === 'All' || activeTab === 'Upcoming'
                ? 'Your upcoming doctor visits will appear here.'
                : `You have no ${activeTab.toLowerCase()} appointments.`}
            </p>
            {(activeTab === 'All' || activeTab === 'Upcoming') && isPatient && (
              <Link to="/doctors" className="db-empty-cta">Find a Doctor</Link>
            )}
          </div>
        ) : (
          <div className="apt-card-list">
            {tabFiltered.map(apt => {
              const docName = doctorNameById[apt.doctorId] || `Doctor #${apt.doctorId}`;
              const docSpec = doctorSpecById[apt.doctorId] || '';
              const patName = patientNameById[apt.patientId] || '';
              const isUpcoming = apt.appointmentDate >= today && apt.status?.toUpperCase() === 'SCHEDULED';
              return (
                <div key={apt.id} className="apt-card">
                  <div className="apt-card-top">
                    <div className="apt-card-date-label">
                      {apt.appointmentDate === today ? 'Today' : formatDate(apt.appointmentDate)}
                      {apt.appointmentTime && ` · ${formatTime(apt.appointmentTime)}`}
                    </div>
                    <StatusBadge status={apt.status} date={apt.appointmentDate} />
                  </div>

                  <div className="apt-card-doctor">
                    <div className="apt-card-doc-avatar">
                      {docName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="apt-card-doc-name">{docName}</div>
                      {docSpec && <div className="apt-card-doc-spec">{docSpec}</div>}
                      {isPatient && patName && <div className="apt-card-doc-spec" style={{ color: 'var(--color-text-muted)' }}>Patient: {patName}</div>}
                    </div>
                  </div>

                  <div className="apt-card-details">
                    <div className="apt-card-detail-row">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {formatDate(apt.appointmentDate)}
                    </div>
                    {apt.appointmentTime && (
                      <div className="apt-card-detail-row">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {formatTime(apt.appointmentTime)}
                      </div>
                    )}
                  </div>

                  <div className="apt-card-actions">
                    {canEdit && <button className="btn-edit" onClick={() => handleEdit(apt)}>✏ Edit</button>}
                    {isUpcoming && canDelete && (
                      <button className="btn-delete" onClick={() => handleDelete(apt.id)}>🗑 Cancel</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* ── Admin table view ── */
        <div className="page-card">
          <div className="table-section-title">All Appointments ({tabFiltered.length})</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Apt. No</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th>
                  {(canEdit || canDelete) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={colCount} />)
                  : baseFiltered.map(apt => (
                    <tr key={apt.id}>
                      <td>{apt.id}</td>
                      <td>{patientNameById[apt.patientId] || apt.patientId}</td>
                      <td>{doctorNameById[apt.doctorId] || apt.doctorId}</td>
                      <td>{apt.appointmentDate}</td>
                      <td>{apt.appointmentTime}</td>
                      <td><StatusBadge status={apt.status} date={apt.appointmentDate} /></td>
                      {(canEdit || canDelete) && (
                        <td>
                          <div className="action-btns">
                            {canEdit && <button className="btn-edit" onClick={() => handleEdit(apt)}>✏ Edit</button>}
                            {canDelete && <button className="btn-delete" onClick={() => handleDelete(apt.id)}>🗑 Remove</button>}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                }
                {!loading && baseFiltered.length === 0 && (
                  <tr><td colSpan={colCount} style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No appointments found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add/Edit modal ── */}
      {showForm && (canAdd || canEdit) && (
        <div className="crud-form-overlay" onClick={e => e.target === e.currentTarget && resetForm()}>
          <div className="crud-form-modal">
            <h3>{form.id ? 'Update Appointment' : 'Add New Appointment'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input name="appointmentDate" type="date" value={form.appointmentDate} onChange={handleChange} required />
                <input name="appointmentTime" type="time" value={form.appointmentTime} onChange={handleChange} required />
                {!isPatient && (
                  <select name="status" value={form.status} onChange={handleChange} required>
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                )}
                {!isPatient && (
                  <select name="patientId" value={form.patientId} onChange={handleChange} required>
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                )}
                <select name="doctorId" value={form.doctorId} onChange={handleChange} required className={isPatient ? 'full-width' : ''}>
                  <option value="">Select Doctor</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="button-row">
                <button type="button" className="secondary" onClick={resetForm}>Cancel</button>
                <button type="submit">{form.id ? 'Update' : 'Add Appointment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
