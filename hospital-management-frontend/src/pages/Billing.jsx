import { useEffect, useMemo, useState } from 'react';
import { createBill, deleteBill, getAppointments, getBills, getPatientByEmail, getPatients, updateBill } from '../api/hospitalApi';
import { cachedFetch, invalidate } from '../api/cache';
import { useAuth } from '../context/AuthContext';

const emptyForm = { id: null, amount: '', billDate: '', paymentStatus: 'PENDING', patientId: '', appointmentId: '' };

function SkeletonRow({ cols }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}><div style={{ height: '14px', borderRadius: '6px', background: 'linear-gradient(90deg,#E0F2FE 25%,#BAE6FD 50%,#E0F2FE 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', width: i === 0 ? '50%' : '85%' }} /></td>
      ))}
    </tr>
  );
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

function StatusBadge({ status }) {
  const s = status?.toUpperCase();
  if (s === 'PAID')    return <span className="status-badge badge-success">✅ Paid</span>;
  if (s === 'PENDING') return <span className="status-badge badge-warning">🟡 Pending</span>;
  return <span className="status-badge badge-info">{status}</span>;
}

export default function Billing() {
  const { user } = useAuth();
  const [bills, setBills]             = useState([]);
  const [patients, setPatients]       = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [form, setForm]               = useState(emptyForm);
  const [message, setMessage]         = useState('');
  const [messageType, setMessageType] = useState('error');
  const [showForm, setShowForm]       = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const isAdmin   = user?.role === 'admin';
  const isPatient = user?.role === 'patient';

  const patientNameById    = useMemo(() => patients.reduce((acc, p) => { acc[p.id] = p.name; return acc; }, {}), [patients]);
  const appointmentLabelById = useMemo(() => appointments.reduce((acc, a) => { acc[a.id] = `${a.appointmentDate} ${a.appointmentTime}`; return acc; }, {}), [appointments]);

  const myPatientId = useMemo(() => {
    if (!isPatient) return null;
    return patients.find(p => p.email === user?.email)?.id ?? null;
  }, [patients, user, isPatient]);

  const loadData = async (bustCache = false) => {
    if (bustCache) { invalidate('bills'); invalidate('patients'); invalidate('appointments'); }
    if (isPatient) {
      let myPat = null;
      try { myPat = (await getPatientByEmail(user.email)).data; } catch { myPat = null; }
      const [billRes, aptRes] = await Promise.all([
        myPat ? getBills({ patientId: myPat.id })        : Promise.resolve({ data: [] }),
        myPat ? getAppointments({ patientId: myPat.id }) : Promise.resolve({ data: [] })
      ]);
      setBills(billRes.data); setPatients(myPat ? [myPat] : []); setAppointments(aptRes.data);
      setLoading(false); return;
    }
    await Promise.all([
      cachedFetch('bills', getBills, (d) => { setBills(d); setLoading(false); }),
      cachedFetch('patients', getPatients, setPatients),
      cachedFetch('appointments', getAppointments, setAppointments),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadData().catch(() => { showMessage('Failed to load bills', 'error'); setLoading(false); });
  }, []);

  const showMessage = (msg, type = 'error') => { setMessage(msg); setMessageType(type); setTimeout(() => setMessage(''), 4000); };
  const handleChange = (e) => setForm(c => ({ ...c, [e.target.name]: e.target.value }));
  const resetForm = () => { setForm(emptyForm); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, amount: Number(form.amount), patientId: Number(form.patientId), appointmentId: Number(form.appointmentId) };
    try {
      if (form.id) { await updateBill(form.id, payload); showMessage('Bill updated successfully', 'success'); }
      else { await createBill(payload); showMessage('Bill created successfully', 'success'); }
      resetForm(); await loadData(true);
    } catch (err) { showMessage(err.response?.data?.message || 'Failed to save bill', 'error'); }
  };

  const handleEdit = (b) => { setForm({ ...b, amount: String(b.amount), patientId: b.patientId ? String(b.patientId) : '', appointmentId: b.appointmentId ? String(b.appointmentId) : '' }); setShowForm(true); };
  const handleDelete = async (id) => {
    try { await deleteBill(id); showMessage('Bill deleted successfully', 'success'); await loadData(true); }
    catch (err) { showMessage(err.response?.data?.message || 'Failed to delete bill', 'error'); }
  };

  const myBills = useMemo(() => {
    return bills.filter(b => {
      if (isPatient && b.patientId !== myPatientId) return false;
      if (filterStatus && b.paymentStatus !== filterStatus) return false;
      return true;
    });
  }, [bills, isPatient, myPatientId, filterStatus]);

  // Billing overview stats
  const totalAmount   = myBills.reduce((s, b) => s + (b.amount || 0), 0);
  const paidBills     = myBills.filter(b => b.paymentStatus === 'PAID');
  const pendingBills  = myBills.filter(b => b.paymentStatus === 'PENDING');
  const paidAmount    = paidBills.reduce((s, b) => s + (b.amount || 0), 0);
  const pendingAmount = pendingBills.reduce((s, b) => s + (b.amount || 0), 0);

  const canAdd    = isAdmin;
  const canEdit   = isAdmin;
  const canDelete = isAdmin;
  const colCount  = canEdit || canDelete ? 7 : 6;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-back" onClick={() => window.history.back()}>← Back</button>
          <h2 className="page-title">{isPatient ? 'My Bills' : 'Billing Manager'}</h2>
        </div>
        {canAdd && <button className="btn-add-new" onClick={() => setShowForm(true)}>+ Add Bill</button>}
      </div>

      {message && <div className={`error-banner ${messageType}`}>{message}</div>}

      {/* ── Billing Overview cards ── */}
      {!loading && myBills.length > 0 && (
        <div className="billing-overview">
          <div className="billing-stat-card" data-color="blue">
            <div className="billing-stat-label">Total Bills</div>
            <div className="billing-stat-value">{formatCurrency(totalAmount)}</div>
            <div className="billing-stat-sub">{myBills.length} invoice{myBills.length !== 1 ? 's' : ''}</div>
          </div>
          <div className="billing-stat-card" data-color="amber">
            <div className="billing-stat-label">Pending</div>
            <div className="billing-stat-value">{formatCurrency(pendingAmount)}</div>
            <div className="billing-stat-sub">{pendingBills.length} unpaid</div>
          </div>
          <div className="billing-stat-card" data-color="green">
            <div className="billing-stat-label">Paid</div>
            <div className="billing-stat-value">{formatCurrency(paidAmount)}</div>
            <div className="billing-stat-sub">{paidBills.length} cleared</div>
          </div>
        </div>
      )}

      {/* ── Patients: bill cards ── */}
      {isPatient ? (
        <>
          {loading ? (
            <div className="bill-card-list">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bill-card skeleton">
                  <div className="skeleton-box" style={{ width: '30%', height: 12, marginBottom: 12 }} />
                  <div className="skeleton-box" style={{ width: '50%', height: 20, marginBottom: 8 }} />
                  <div className="skeleton-box" style={{ width: '60%', height: 12 }} />
                </div>
              ))}
            </div>
          ) : myBills.length === 0 ? (
            <div className="db-empty-state" style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '64px 24px' }}>
              <div className="db-empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <p className="db-empty-title">No bills yet</p>
              <p className="db-empty-body">Your consultation and payment history will appear here after your visits.</p>
            </div>
          ) : (
            <div className="bill-card-list">
              {myBills.map(bill => (
                <div key={bill.id} className="bill-card">
                  <div className="bill-card-left">
                    <div className="bill-card-id">Bill #{bill.id}</div>
                    <div className="bill-card-patient">{patientNameById[bill.patientId] || 'Patient'}</div>
                    <div className="bill-card-date">{formatDate(bill.billDate)}</div>
                    {appointmentLabelById[bill.appointmentId] && (
                      <div className="bill-card-apt">Apt: {appointmentLabelById[bill.appointmentId]}</div>
                    )}
                  </div>
                  <div className="bill-card-right">
                    <div className="bill-card-amount">{formatCurrency(bill.amount)}</div>
                    <StatusBadge status={bill.paymentStatus} />
                    <button className="bill-card-invoice-btn">View Invoice</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* ── Admin table view ── */
        <div className="page-card">
          <div className="table-section-title">All Bills ({myBills.length})</div>
          <div className="filter-row">
            <label>Status:</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
            </select>
            <button className="btn-filter" onClick={() => setFilterStatus('')}>⟲ Clear</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Bill No</th><th>Patient</th><th>Appointment</th><th>Amount</th><th>Date</th><th>Status</th>
                  {(canEdit || canDelete) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={colCount} />)
                  : myBills.map(bill => (
                    <tr key={bill.id}>
                      <td>{bill.id}</td>
                      <td>{patientNameById[bill.patientId] || bill.patientId}</td>
                      <td>{appointmentLabelById[bill.appointmentId] || bill.appointmentId}</td>
                      <td>{formatCurrency(bill.amount)}</td>
                      <td>{bill.billDate}</td>
                      <td><StatusBadge status={bill.paymentStatus} /></td>
                      {(canEdit || canDelete) && (
                        <td>
                          <div className="action-btns">
                            {canEdit && <button className="btn-edit" onClick={() => handleEdit(bill)}>✏ Edit</button>}
                            {canDelete && <button className="btn-delete" onClick={() => handleDelete(bill.id)}>🗑 Remove</button>}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                }
                {!loading && myBills.length === 0 && (
                  <tr><td colSpan={colCount} style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No bills found</td></tr>
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
            <h3>{form.id ? 'Update Bill' : 'Add New Bill'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input name="amount" type="number" step="0.01" value={form.amount} onChange={handleChange} placeholder="Amount" required />
                <input name="billDate" type="date" value={form.billDate} onChange={handleChange} required />
                <select name="paymentStatus" value={form.paymentStatus} onChange={handleChange} required>
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID</option>
                </select>
                <select name="patientId" value={form.patientId} onChange={handleChange} required>
                  <option value="">Select Patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select name="appointmentId" value={form.appointmentId} onChange={handleChange} required className="full-width">
                  <option value="">Select Appointment</option>
                  {appointments.map(a => <option key={a.id} value={a.id}>{a.appointmentDate} / {a.appointmentTime}</option>)}
                </select>
              </div>
              <div className="button-row">
                <button type="button" className="secondary" onClick={resetForm}>Cancel</button>
                <button type="submit">{form.id ? 'Update' : 'Add Bill'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
