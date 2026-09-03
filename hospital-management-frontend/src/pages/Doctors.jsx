import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  createDoctor, deleteDoctor, getDepartments, getDoctors, updateDoctor
} from '../api/hospitalApi';
import { cachedFetch, invalidate } from '../api/cache';
import { useAuth } from '../context/AuthContext';

const emptyForm = { id: null, name: '', specialization: '', phone: '', email: '', departmentId: '' };

function SkeletonCard() {
  return (
    <div className="doctor-card skeleton">
      <div className="doctor-card-avatar skeleton-box" />
      <div style={{ flex: 1 }}>
        <div className="skeleton-box" style={{ width: '60%', height: 14, marginBottom: 8 }} />
        <div className="skeleton-box" style={{ width: '40%', height: 12, marginBottom: 6 }} />
        <div className="skeleton-box" style={{ width: '80%', height: 12 }} />
      </div>
    </div>
  );
}

function DoctorAvatar({ name }) {
  const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'DR';
  const colors = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2'];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div className="doctor-card-avatar" style={{ background: `${color}20`, color }}>
      {initials}
    </div>
  );
}

export default function Doctors() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSpec, setActiveSpec] = useState('All');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearchTerm(q);
  }, [searchParams]);

  const departmentNameById = useMemo(() =>
    departments.reduce((acc, d) => { acc[d.id] = d.name; return acc; }, {}),
    [departments]);

  const loadData = async (bustCache = false) => {
    if (bustCache) { invalidate('doctors'); invalidate('departments'); }
    await Promise.all([
      cachedFetch('doctors', getDoctors, (d) => { setDoctors(d); setLoading(false); }),
      cachedFetch('departments', getDepartments, setDepartments),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadData().catch(() => { showMessage('Failed to load doctors', 'error'); setLoading(false); });
  }, []);

  const showMessage = (msg, type = 'error') => {
    setMessage(msg); setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleChange = (e) => setForm(c => ({ ...c, [e.target.name]: e.target.value }));
  const resetForm = () => { setForm(emptyForm); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, departmentId: Number(form.departmentId) };
    try {
      if (form.id) { await updateDoctor(form.id, payload); showMessage('Doctor updated successfully', 'success'); }
      else { await createDoctor(payload); showMessage('Doctor created successfully', 'success'); }
      resetForm(); await loadData(true);
    } catch (err) { showMessage(err.response?.data?.message || 'Failed to save doctor', 'error'); }
  };

  const handleEdit = (d) => { setForm({ ...d, departmentId: d.departmentId ? String(d.departmentId) : '' }); setShowForm(true); };
  const handleDelete = async (id) => {
    try { await deleteDoctor(id); showMessage('Doctor deleted successfully', 'success'); await loadData(true); }
    catch (err) { showMessage(err.response?.data?.message || 'Failed to delete doctor', 'error'); }
  };

  // All unique specializations for filter chips
  const specializations = useMemo(() => {
    const set = new Set(doctors.map(d => d.specialization).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [doctors]);

  const filtered = doctors.filter(d => {
    const matchesSearch = !searchTerm ||
      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpec = activeSpec === 'All' || d.specialization === activeSpec;
    return matchesSearch && matchesSpec;
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-back" onClick={() => window.history.back()}>← Back</button>
          <h2 className="page-title">
            {isAdmin ? 'Doctors' : 'Our Doctors'}
            <span className="page-title-count">{filtered.length}</span>
          </h2>
        </div>
        {isAdmin && (
          <button className="btn-add-new" onClick={() => setShowForm(true)}>+ Add Doctor</button>
        )}
      </div>

      {message && <div className={`error-banner ${messageType}`}>{message}</div>}

      {/* ── Search + Filter ── */}
      <div className="doctors-toolbar">
        <div className="doctors-search-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            width="16" height="16">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search doctors or specialties…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── Specialty chips ── */}
      <div className="specialty-chips">
        {specializations.map(spec => (
          <button
            key={spec}
            className={`specialty-chip${activeSpec === spec ? ' active' : ''}`}
            onClick={() => setActiveSpec(spec)}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* ── Doctor cards (patients/doctors view) ── */}
      {!isAdmin ? (
        <div className="doctor-card-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.length === 0
              ? (
                <div className="db-empty-state" style={{ gridColumn: '1/-1' }}>
                  <div className="db-empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <p className="db-empty-title">No doctors found</p>
                  <p className="db-empty-body">Try a different search term or specialty filter.</p>
                </div>
              )
              : filtered.map(doctor => (
                <div key={doctor.id} className="doctor-card">
                  <div className="doctor-card-header">
                    <DoctorAvatar name={doctor.name} />
                    <div className="doctor-card-meta">
                      <div className="doctor-card-name">{doctor.name}</div>
                      {doctor.specialization && (
                        <span className="specialty-badge">{doctor.specialization}</span>
                      )}
                    </div>
                  </div>

                  <div className="doctor-card-dept">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    {departmentNameById[doctor.departmentId] || 'Department'}
                  </div>

                  <div className="doctor-card-email">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    {doctor.email}
                  </div>

                  <div className="doctor-card-footer">
                    <span className="doctor-available">
                      <span className="available-dot" />
                      Available
                    </span>
                    <Link to={`/appointments?bookDoctor=${doctor.id}`} className="btn-book">Book Appointment</Link>
                  </div>
                </div>
              ))
          }
        </div>
      ) : (
        /* ── Admin table view ── */
        <div className="page-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={5}><div className="skeleton-box" style={{ height: 14, width: '80%', borderRadius: 6 }} /></td></tr>
                  ))
                  : filtered.map(doctor => (
                    <tr key={doctor.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <DoctorAvatar name={doctor.name} />
                          <span style={{ fontWeight: 500 }}>{doctor.name}</span>
                        </div>
                      </td>
                      <td><span className="specialty-badge">{doctor.specialization || '—'}</span></td>
                      <td>{departmentNameById[doctor.departmentId] || '—'}</td>
                      <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{doctor.email}</td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-edit" onClick={() => handleEdit(doctor)}>✏ Edit</button>
                          <button className="btn-delete" onClick={() => handleDelete(doctor.id)}>🗑 Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No doctors found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add/Edit modal (admin only) ── */}
      {showForm && isAdmin && (
        <div className="crud-form-overlay" onClick={e => e.target === e.currentTarget && resetForm()}>
          <div className="crud-form-modal">
            <h3>{form.id ? 'Update Doctor' : 'Add New Doctor'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input name="name" value={form.name} onChange={handleChange} placeholder="Doctor Name" required />
                <input name="specialization" value={form.specialization} onChange={handleChange} placeholder="Specialization" required />
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" required />
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
                <select name="departmentId" value={form.departmentId} onChange={handleChange} required className="full-width">
                  <option value="">Select Department</option>
                  {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                </select>
              </div>
              <div className="button-row">
                <button type="button" className="secondary" onClick={resetForm}>Cancel</button>
                <button type="submit">{form.id ? 'Update Doctor' : 'Add Doctor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
