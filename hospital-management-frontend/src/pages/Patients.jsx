import { useEffect, useMemo, useState } from 'react';
import { createPatient, deletePatient, getAppointments, getDoctors, getPatients, updatePatient } from '../api/hospitalApi';
import { cachedFetch, invalidate } from '../api/cache';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  id: null,
  name: '',
  age: '',
  gender: 'Male',
  phone: '',
  email: '',
  address: '',
  bloodGroup: ''
};

function SkeletonRow({ cols }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}>
          <div style={{
            height: '14px', borderRadius: '6px',
            background: 'linear-gradient(90deg, #E0F2FE 25%, #BAE6FD 50%, #E0F2FE 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite',
            width: i === 0 ? '70%' : '90%'
          }} />
        </td>
      ))}
    </tr>
  );
}

export default function Patients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';

  const myDoctorId = useMemo(() => {
    if (!isDoctor) return null;
    const match = doctors.find((d) => d.email === user?.email);
    return match ? match.id : null;
  }, [doctors, user, isDoctor]);

  const myPatientIds = useMemo(() => {
    if (!isDoctor || !myDoctorId) return null;
    const ids = new Set();
    appointments.forEach((apt) => { if (apt.doctorId === myDoctorId) ids.add(apt.patientId); });
    return ids;
  }, [appointments, myDoctorId, isDoctor]);

  const loadData = async (bustCache = false) => {
    if (bustCache) { invalidate('patients'); invalidate('doctors'); invalidate('appointments'); }
    await Promise.all([
      cachedFetch('patients', getPatients, (d) => { setPatients(d); setLoading(false); }),
      cachedFetch('doctors', getDoctors, setDoctors),
      cachedFetch('appointments', getAppointments, setAppointments),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadData().catch(() => { showMessage('Failed to load patients', 'error'); setLoading(false); });
  }, []);

  const showMessage = (msg, type = 'error') => {
    setMessage(msg); setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const resetForm = () => { setForm(emptyForm); setShowForm(false); };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = { ...form, age: Number(form.age) };
    try {
      if (form.id) {
        await updatePatient(form.id, payload);
        showMessage('Patient updated successfully', 'success');
      } else {
        await createPatient(payload);
        showMessage('Patient created successfully', 'success');
      }
      resetForm();
      await loadData(true);
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to save patient', 'error');
    }
  };

  const handleEdit = (patient) => {
    setForm({ ...patient, age: String(patient.age) });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deletePatient(id);
      showMessage('Patient deleted successfully', 'success');
      await loadData(true);
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to delete patient', 'error');
    }
  };

  const filteredPatients = patients.filter((p) => {
    if (isDoctor && (!myPatientIds || !myPatientIds.has(p.id))) return false;
    return (
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const canAdd = isAdmin;
  const canEdit = isAdmin;
  const canDelete = isAdmin;
  const colCount = canEdit || canDelete ? 7 : 6;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-back" onClick={() => window.history.back()}>← Back</button>
          <h2 className="page-title">{isDoctor ? 'My Patients' : 'Patients'}</h2>
        </div>
        {canAdd && <button className="btn-add-new" onClick={() => setShowForm(true)}>+ Add New</button>}
      </div>

      {message && <div className={`error-banner ${messageType}`}>{message}</div>}

      <div className="page-card">
        <div className="table-section-title">{isDoctor ? 'My' : 'All'} Patients ({filteredPatients.length})</div>

        <div className="filter-row">
          <label>Search:</label>
          <input type="text" placeholder="Search by name or email" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient Name</th><th>Email</th><th>Phone</th><th>Age</th><th>Gender</th><th>Blood Group</th>
                {(canEdit || canDelete) && <th>Events</th>}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={colCount} />)
                : filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td>{patient.name}</td>
                      <td>{patient.email}</td>
                      <td>{patient.phone}</td>
                      <td>{patient.age}</td>
                      <td>{patient.gender}</td>
                      <td>{patient.bloodGroup}</td>
                      {(canEdit || canDelete) && (
                        <td>
                          <div className="action-btns">
                            {canEdit && <button className="btn-edit" onClick={() => handleEdit(patient)}>✏ Edit</button>}
                            {canDelete && <button className="btn-delete" onClick={() => handleDelete(patient.id)}>🗑 Remove</button>}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
              }
              {!loading && filteredPatients.length === 0 && (
                <tr><td colSpan={colCount} style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No patients found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && canAdd && (
        <div className="crud-form-overlay" onClick={(e) => e.target === e.currentTarget && resetForm()}>
          <div className="crud-form-modal">
            <h3>{form.id ? 'Update Patient' : 'Add New Patient'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input name="name" value={form.name} onChange={handleChange} placeholder="Patient Name" required />
                <input name="age" type="number" value={form.age} onChange={handleChange} placeholder="Age" required />
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" required />
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
                <input name="bloodGroup" value={form.bloodGroup} onChange={handleChange} placeholder="Blood Group" required />
                <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="full-width" required />
              </div>
              <div className="button-row">
                <button type="button" className="secondary" onClick={resetForm}>Cancel</button>
                <button type="submit">{form.id ? 'Update Patient' : 'Add Patient'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
