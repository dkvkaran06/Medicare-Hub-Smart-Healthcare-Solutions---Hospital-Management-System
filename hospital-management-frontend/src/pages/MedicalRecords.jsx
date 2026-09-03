import { useEffect, useMemo, useState } from 'react';
import {
  createMedicalRecord, deleteMedicalRecord, getDoctorByEmail, getDoctors,
  getMedicalRecords, getPatientByEmail, getPatients, updateMedicalRecord
} from '../api/hospitalApi';
import { cachedFetch, invalidate } from '../api/cache';
import { useAuth } from '../context/AuthContext';

const emptyForm = { id: null, diagnosis: '', treatment: '', prescription: '', recordDate: '', patientId: '', doctorId: '' };

function SkeletonRow({ cols }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}><div style={{ height: '14px', borderRadius: '6px', background: 'linear-gradient(90deg,#E0F2FE 25%,#BAE6FD 50%,#E0F2FE 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', width: i === 0 ? '60%' : '85%' }} /></td>
      ))}
    </tr>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function MedicalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

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

  const loadData = async (bustCache = false) => {
    if (bustCache) { invalidate('medical-records'); invalidate('patients'); invalidate('doctors'); }
    if (isPatient) {
      let myPat = null;
      try { myPat = (await getPatientByEmail(user.email)).data; } catch { myPat = null; }
      const [recRes] = await Promise.all([
        myPat ? getMedicalRecords({ patientId: myPat.id }) : Promise.resolve({ data: [] }),
        cachedFetch('doctors', getDoctors, setDoctors),
      ]);
      if (recRes) setRecords(recRes.data);
      setPatients(myPat ? [myPat] : []);
      setLoading(false);
      return;
    }
    if (isDoctor) {
      let myDoc = null;
      try { myDoc = (await getDoctorByEmail(user.email)).data; } catch { myDoc = null; }
      const [recRes] = await Promise.all([
        myDoc ? getMedicalRecords({ doctorId: myDoc.id }) : Promise.resolve({ data: [] }),
        cachedFetch('patients', getPatients, setPatients),
        cachedFetch('doctors', getDoctors, setDoctors),
      ]);
      if (recRes) setRecords(recRes.data);
      setLoading(false);
      return;
    }
    await Promise.all([
      cachedFetch('medical-records', getMedicalRecords, (d) => { setRecords(d); setLoading(false); }),
      cachedFetch('patients', getPatients, setPatients),
      cachedFetch('doctors', getDoctors, setDoctors),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadData().catch(() => { showMessage('Failed to load medical records', 'error'); setLoading(false); });
  }, []);

  const showMessage = (msg, type = 'error') => { setMessage(msg); setMessageType(type); setTimeout(() => setMessage(''), 4000); };
  const handleChange = (e) => setForm(c => ({ ...c, [e.target.name]: e.target.value }));
  const resetForm = () => { setForm(emptyForm); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, patientId: Number(form.patientId), doctorId: Number(form.doctorId) };
    try {
      if (form.id) { await updateMedicalRecord(form.id, payload); showMessage('Record updated successfully', 'success'); }
      else { await createMedicalRecord(payload); showMessage('Record created successfully', 'success'); }
      resetForm(); await loadData(true);
    } catch (err) { showMessage(err.response?.data?.message || 'Failed to save record', 'error'); }
  };

  const handleEdit = (r) => { setForm({ ...r, patientId: r.patientId ? String(r.patientId) : '', doctorId: r.doctorId ? String(r.doctorId) : '' }); setShowForm(true); };
  const handleDelete = async (id) => {
    try { await deleteMedicalRecord(id); showMessage('Record deleted successfully', 'success'); await loadData(true); }
    catch (err) { showMessage(err.response?.data?.message || 'Failed to delete record', 'error'); }
  };

  const filtered = records.filter(r => {
    if (isPatient && r.patientId !== myPatientId) return false;
    if (isDoctor  && r.doctorId  !== myDoctorId)  return false;
    const patName = patientNameById[r.patientId] || '';
    return patName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Sort newest first
  const sorted = [...filtered].sort((a, b) => (b.recordDate || '').localeCompare(a.recordDate || ''));

  const canAdd    = isAdmin || isDoctor;
  const canEdit   = isAdmin || isDoctor;
  const canDelete = isAdmin;
  const colCount  = canEdit || canDelete ? 7 : 6;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-back" onClick={() => window.history.back()}>← Back</button>
          <h2 className="page-title">
            {isPatient ? 'My Medical Records' : isDoctor ? 'My Patient Records' : 'Medical Records'}
          </h2>
        </div>
        {canAdd && <button className="btn-add-new" onClick={() => setShowForm(true)}>+ Add Record</button>}
      </div>

      {message && <div className={`error-banner ${messageType}`}>{message}</div>}

      {/* ── Search bar ── */}
      <div className="doctors-toolbar" style={{ marginBottom: '20px' }}>
        <div className="doctors-search-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search by diagnosis or patient name…"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* ── Patients / Doctors: card view ── */}
      {!isAdmin ? (
        loading ? (
          <div className="record-card-list">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="record-card skeleton">
                <div className="skeleton-box" style={{ width: '30%', height: 12, marginBottom: 12 }} />
                <div className="skeleton-box" style={{ width: '50%', height: 16, marginBottom: 8 }} />
                <div className="skeleton-box" style={{ width: '80%', height: 12 }} />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="db-empty-state" style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '64px 24px' }}>
            <div className="db-empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <p className="db-empty-title">No medical records</p>
            <p className="db-empty-body">
              {isPatient
                ? 'Your medical history and consultation records will appear here after your visits.'
                : 'No patient records found.'}
            </p>
            {isPatient && <a href="/doctors" className="db-empty-cta">Find a Doctor</a>}
          </div>
        ) : (
          <div className="record-card-list">
            {sorted.map(record => {
              const docName = doctorNameById[record.doctorId] || `Doctor #${record.doctorId}`;
              const docSpec = doctorSpecById[record.doctorId] || '';
              const patName = patientNameById[record.patientId] || '';
              const isExpanded = expandedId === record.id;
              return (
                <div key={record.id} className="record-card">
                  <div className="record-card-date">{formatDate(record.recordDate)}</div>

                  <div className="record-card-doctor">
                    <div className="apt-card-doc-avatar" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>
                      {docName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="apt-card-doc-name">{docName}</div>
                      {docSpec && <div className="apt-card-doc-spec">{docSpec}</div>}
                      {!isPatient && patName && <div className="apt-card-doc-spec">Patient: {patName}</div>}
                    </div>
                  </div>

                  <div className="record-card-row">
                    <div className="record-card-label">Diagnosis</div>
                    <div className="record-card-value">{record.diagnosis || '—'}</div>
                  </div>

                  <div className="record-card-row">
                    <div className="record-card-label">Treatment</div>
                    <div className="record-card-value">{record.treatment || '—'}</div>
                  </div>

                  {isExpanded && record.prescription && (
                    <div className="record-card-row">
                      <div className="record-card-label">Prescription</div>
                      <div className="record-card-value">{record.prescription}</div>
                    </div>
                  )}

                  <div className="record-card-footer">
                    {record.prescription && (
                      <button className="record-card-expand" onClick={() => setExpandedId(isExpanded ? null : record.id)}>
                        {isExpanded ? 'Show less ↑' : 'View prescription ↓'}
                      </button>
                    )}
                    {canEdit && (
                      <button className="btn-edit" style={{ marginLeft: 'auto' }} onClick={() => handleEdit(record)}>✏ Edit</button>
                    )}
                    {canDelete && (
                      <button className="btn-delete" onClick={() => handleDelete(record.id)}>🗑 Remove</button>
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
          <div className="table-section-title">All Records ({filtered.length})</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th><th>Patient</th><th>Doctor</th><th>Diagnosis</th><th>Treatment</th><th>Prescription</th>
                  {(canEdit || canDelete) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={colCount} />)
                  : sorted.map(record => (
                    <tr key={record.id}>
                      <td>{record.recordDate}</td>
                      <td>{patientNameById[record.patientId] || record.patientId}</td>
                      <td>{doctorNameById[record.doctorId] || record.doctorId}</td>
                      <td>{record.diagnosis}</td>
                      <td>{record.treatment}</td>
                      <td>{record.prescription}</td>
                      {(canEdit || canDelete) && (
                        <td>
                          <div className="action-btns">
                            {canEdit && <button className="btn-edit" onClick={() => handleEdit(record)}>✏ Edit</button>}
                            {canDelete && <button className="btn-delete" onClick={() => handleDelete(record.id)}>🗑 Remove</button>}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                }
                {!loading && sorted.length === 0 && (
                  <tr><td colSpan={colCount} style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add/Edit modal ── */}
      {showForm && canAdd && (
        <div className="crud-form-overlay" onClick={e => e.target === e.currentTarget && resetForm()}>
          <div className="crud-form-modal">
            <h3>{form.id ? 'Update Medical Record' : 'Add New Medical Record'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input name="diagnosis" value={form.diagnosis} onChange={handleChange} placeholder="Diagnosis" required />
                <input name="treatment" value={form.treatment} onChange={handleChange} placeholder="Treatment" required />
                <input name="prescription" value={form.prescription} onChange={handleChange} placeholder="Prescription" required className="full-width" />
                <input name="recordDate" type="date" value={form.recordDate} onChange={handleChange} required />
                <select name="patientId" value={form.patientId} onChange={handleChange} required>
                  <option value="">Select Patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select name="doctorId" value={form.doctorId} onChange={handleChange} required className="full-width">
                  <option value="">Select Doctor</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="button-row">
                <button type="button" className="secondary" onClick={resetForm}>Cancel</button>
                <button type="submit">{form.id ? 'Update' : 'Add Record'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
