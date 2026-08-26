import { useEffect, useMemo, useState } from 'react';
import {
  createMedicalRecord,
  deleteMedicalRecord,
  getDoctorByEmail,
  getDoctors,
  getMedicalRecords,
  getPatientByEmail,
  getPatients,
  updateMedicalRecord
} from '../api/hospitalApi';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  id: null,
  diagnosis: '',
  treatment: '',
  prescription: '',
  recordDate: '',
  patientId: '',
  doctorId: ''
};

export default function MedicalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';
  const isPatient = user?.role === 'patient';

  const patientNameById = useMemo(() => {
    return patients.reduce((acc, p) => { acc[p.id] = p.name; return acc; }, {});
  }, [patients]);

  const doctorNameById = useMemo(() => {
    return doctors.reduce((acc, d) => { acc[d.id] = d.name; return acc; }, {});
  }, [doctors]);

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

  const loadData = async () => {
    // Patient sees only their own records; doctor sees only records where they
    // are the doctor. Both are scoped server-side rather than fetching all.
    if (isPatient) {
      let myPat = null;
      try { myPat = (await getPatientByEmail(user.email)).data; } catch { myPat = null; }
      const [recRes, docRes] = await Promise.all([
        myPat ? getMedicalRecords({ patientId: myPat.id }) : Promise.resolve({ data: [] }),
        getDoctors()
      ]);
      setRecords(recRes.data);
      setPatients(myPat ? [myPat] : []);
      setDoctors(docRes.data);
      return;
    }
    if (isDoctor) {
      let myDoc = null;
      try { myDoc = (await getDoctorByEmail(user.email)).data; } catch { myDoc = null; }
      const [recRes, patRes, docRes] = await Promise.all([
        myDoc ? getMedicalRecords({ doctorId: myDoc.id }) : Promise.resolve({ data: [] }),
        getPatients(),
        getDoctors()
      ]);
      setRecords(recRes.data);
      setPatients(patRes.data);
      setDoctors(docRes.data);
      return;
    }
    const [recRes, patRes, docRes] = await Promise.all([
      getMedicalRecords(), getPatients(), getDoctors()
    ]);
    setRecords(recRes.data);
    setPatients(patRes.data);
    setDoctors(docRes.data);
  };

  useEffect(() => {
    loadData().catch(() => showMessage('Failed to load medical records', 'error'));
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
      patientId: Number(form.patientId),
      doctorId: Number(form.doctorId)
    };

    try {
      if (form.id) {
        await updateMedicalRecord(form.id, payload);
        showMessage('Medical record updated successfully', 'success');
      } else {
        await createMedicalRecord(payload);
        showMessage('Medical record created successfully', 'success');
      }
      resetForm();
      await loadData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to save medical record', 'error');
    }
  };

  const handleEdit = (record) => {
    setForm({
      ...record,
      patientId: record.patientId ? String(record.patientId) : '',
      doctorId: record.doctorId ? String(record.doctorId) : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteMedicalRecord(id);
      showMessage('Medical record deleted successfully', 'success');
      await loadData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to delete medical record', 'error');
    }
  };

  // Role-based filtering
  const filtered = records.filter((r) => {
    // Patient sees only their own records (no linked record => see nothing)
    if (isPatient && r.patientId !== myPatientId) return false;
    // Doctor sees only records where they are the doctor (no linked record => see nothing)
    if (isDoctor && r.doctorId !== myDoctorId) return false;
    // Search filter
    const patientName = patientNameById[r.patientId] || '';
    return patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const canAdd = isAdmin || isDoctor;
  const canEdit = isAdmin || isDoctor;
  const canDelete = isAdmin;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-back" onClick={() => window.history.back()}>← Back</button>
          <h2 className="page-title">
            {isPatient ? 'My Medical Records' : isDoctor ? 'My Patient Records' : 'Medical Records'}
          </h2>
        </div>
        {canAdd && (
          <button className="btn-add-new" onClick={() => setShowForm(true)}>+ Add Record</button>
        )}
      </div>

      {message && <div className={`error-banner ${messageType}`}>{message}</div>}

      <div className="page-card">
        <div className="table-section-title">
          {isPatient ? 'My' : isDoctor ? 'My Patient' : 'All'} Records ({filtered.length})
        </div>

        <div className="filter-row">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search by patient name or diagnosis"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Diagnosis</th>
                <th>Treatment</th>
                <th>Prescription</th>
                {(canEdit || canDelete) && <th>Events</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => (
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
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={canEdit || canDelete ? "7" : "6"} style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && canAdd && (
        <div className="crud-form-overlay" onClick={(e) => e.target === e.currentTarget && resetForm()}>
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
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <select name="doctorId" value={form.doctorId} onChange={handleChange} required className="full-width">
                  <option value="">Select Doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
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
