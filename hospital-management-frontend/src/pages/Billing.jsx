import { useEffect, useMemo, useState } from 'react';
import {
  createBill,
  deleteBill,
  getAppointments,
  getBills,
  getPatients,
  updateBill
} from '../api/hospitalApi';

const emptyForm = {
  id: null,
  amount: '',
  billDate: '',
  paymentStatus: 'PENDING',
  patientId: '',
  appointmentId: ''
};

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const patientNameById = useMemo(() => {
    return patients.reduce((acc, p) => { acc[p.id] = p.name; return acc; }, {});
  }, [patients]);

  const appointmentLabelById = useMemo(() => {
    return appointments.reduce((acc, a) => {
      acc[a.id] = `${a.appointmentDate} ${a.appointmentTime}`;
      return acc;
    }, {});
  }, [appointments]);

  const loadData = async () => {
    const [billRes, patRes, aptRes] = await Promise.all([
      getBills(), getPatients(), getAppointments()
    ]);
    setBills(billRes.data);
    setPatients(patRes.data);
    setAppointments(aptRes.data);
  };

  useEffect(() => {
    loadData().catch(() => showMessage('Failed to load bills', 'error'));
  }, []);

  const showMessage = (msg, type = 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((curr) => ({ ...curr, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      amount: Number(form.amount),
      patientId: Number(form.patientId),
      appointmentId: Number(form.appointmentId)
    };

    try {
      if (form.id) {
        await updateBill(form.id, payload);
        showMessage('Bill updated successfully', 'success');
      } else {
        await createBill(payload);
        showMessage('Bill created successfully', 'success');
      }
      resetForm();
      await loadData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to save bill', 'error');
    }
  };

  const handleEdit = (bill) => {
    setForm({
      ...bill,
      amount: String(bill.amount),
      patientId: bill.patientId ? String(bill.patientId) : '',
      appointmentId: bill.appointmentId ? String(bill.appointmentId) : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteBill(id);
      showMessage('Bill deleted successfully', 'success');
      await loadData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to delete bill', 'error');
    }
  };

  const getStatusClass = (status) => {
    if (!status) return '';
    return status.toLowerCase();
  };

  const filtered = bills.filter((b) => {
    if (filterStatus && b.paymentStatus !== filterStatus) return false;
    return true;
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-back" onClick={() => window.history.back()}>← Back</button>
          <h2 className="page-title">Billing Manager</h2>
        </div>
        <button className="btn-add-new" onClick={() => setShowForm(true)}>+ Add Bill</button>
      </div>

      {message && <div className={`error-banner ${messageType}`}>{message}</div>}

      <div className="page-card">
        <div className="table-section-title">All Bills ({filtered.length})</div>

        <div className="filter-row">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
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
                <th>Bill No</th>
                <th>Patient</th>
                <th>Appointment</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Events</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bill) => (
                <tr key={bill.id}>
                  <td>{bill.id}</td>
                  <td>{patientNameById[bill.patientId] || bill.patientId}</td>
                  <td>{appointmentLabelById[bill.appointmentId] || bill.appointmentId}</td>
                  <td>₹{bill.amount}</td>
                  <td>{bill.billDate}</td>
                  <td><span className={`status-pill ${getStatusClass(bill.paymentStatus)}`}>{bill.paymentStatus}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-edit" onClick={() => handleEdit(bill)}>✏ Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(bill.id)}>🗑 Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No bills found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="crud-form-overlay" onClick={(e) => e.target === e.currentTarget && resetForm()}>
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
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <select name="appointmentId" value={form.appointmentId} onChange={handleChange} required className="full-width">
                  <option value="">Select Appointment</option>
                  {appointments.map((a) => (
                    <option key={a.id} value={a.id}>{a.appointmentDate} / {a.appointmentTime}</option>
                  ))}
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
