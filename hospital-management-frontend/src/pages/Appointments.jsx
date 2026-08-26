import { useEffect, useMemo, useState } from 'react';
import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  getDoctorByEmail,
  getDoctors,
  getPatientByEmail,
  getPatients,
  updateAppointment
} from '../api/hospitalApi';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  id: null,
  appointmentDate: '',
  appointmentTime: '',
  status: 'SCHEDULED',
  patientId: '',
  doctorId: ''
};

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');

  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';
  const isPatient = user?.role === 'patient';

  const patientNameById = useMemo(() => {
    return patients.reduce((acc, p) => { acc[p.id] = p.name; return acc; }, {});
  }, [patients]);

  const doctorNameById = useMemo(() => {
    return doctors.reduce((acc, d) => { acc[d.id] = d.name; return acc; }, {});
  }, [doctors]);

  // Find the logged-in user's linked patient/doctor record by email
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
    // Patients/doctors fetch ONLY their own appointments from the server
    // (scoped by id) instead of downloading everyone's and filtering in the
    // browser. Admins still get the full set.
    if (isPatient) {
      let myPat = null;
      try { myPat = (await getPatientByEmail(user.email)).data; } catch { myPat = null; }
      const [aptRes, docRes] = await Promise.all([
        myPat ? getAppointments({ patientId: myPat.id }) : Promise.resolve({ data: [] }),
        getDoctors()
      ]);
      setAppointments(aptRes.data);
      setPatients(myPat ? [myPat] : []);
      setDoctors(docRes.data);
      return;
    }
    if (isDoctor) {
      let myDoc = null;
      try { myDoc = (await getDoctorByEmail(user.email)).data; } catch { myDoc = null; }
      const [aptRes, patRes, docRes] = await Promise.all([
        myDoc ? getAppointments({ doctorId: myDoc.id }) : Promise.resolve({ data: [] }),
        getPatients(),
        getDoctors()
      ]);
      setAppointments(aptRes.data);
      setPatients(patRes.data);
      setDoctors(docRes.data);
      return;
    }
    const [aptRes, patRes, docRes] = await Promise.all([
      getAppointments(), getPatients(), getDoctors()
    ]);
    setAppointments(aptRes.data);
    setPatients(patRes.data);
    setDoctors(docRes.data);
  };

  useEffect(() => {
    loadData().catch(() => showMessage('Failed to load appointments', 'error'));
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
        await updateAppointment(form.id, payload);
        showMessage('Appointment updated successfully', 'success');
      } else {
        await createAppointment(payload);
        showMessage('Appointment created successfully', 'success');
      }
      resetForm();
      await loadData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to save appointment', 'error');
    }
  };

  const handleEdit = (apt) => {
    setForm({
      ...apt,
      patientId: apt.patientId ? String(apt.patientId) : '',
      doctorId: apt.doctorId ? String(apt.doctorId) : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAppointment(id);
      showMessage('Appointment deleted successfully', 'success');
      await loadData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to delete appointment', 'error');
    }
  };

  const getStatusClass = (status) => {
    if (!status) return '';
    return status.toLowerCase();
  };

  // Role-based filtering
  const filtered = appointments.filter((apt) => {
    // Patient sees only their own appointments (no linked record => see nothing)
    if (isPatient && apt.patientId !== myPatientId) return false;
    // Doctor sees only their own appointments (no linked record => see nothing)
    if (isDoctor && apt.doctorId !== myDoctorId) return false;
    // Admin sees all — apply user filters
    if (filterDate && apt.appointmentDate !== filterDate) return false;
    if (filterDoctor && String(apt.doctorId) !== filterDoctor) return false;
    return true;
  });

  const canAdd = isAdmin;
  const canEdit = isAdmin || isDoctor;
  const canDelete = isAdmin;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-back" onClick={() => window.history.back()}>← Back</button>
          <h2 className="page-title">
            {isPatient ? 'My Appointments' : isDoctor ? 'My Schedule' : 'Schedule Manager'}
          </h2>
        </div>
        {canAdd && (
          <button className="btn-add-new" onClick={() => setShowForm(true)}>+ Add Appointment</button>
        )}
      </div>

      {message && <div className={`error-banner ${messageType}`}>{message}</div>}

      <div className="page-card">
        <div className="table-section-title">
          {isPatient ? 'My' : isDoctor ? 'My' : 'All'} Appointments ({filtered.length})
        </div>

        {isAdmin && (
          <div className="filter-row">
            <label>Date:</label>
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
            <label>Doctor:</label>
            <select value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)}>
              <option value="">Choose Doctor Name from the list</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <button className="btn-filter" onClick={() => { setFilterDate(''); setFilterDoctor(''); }}>
              ⟲ Clear
            </button>
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Apt. No</th>
                <th>Patient Name</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                {(canEdit || canDelete) && <th>Events</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((apt) => (
                <tr key={apt.id}>
                  <td>{apt.id}</td>
                  <td>{patientNameById[apt.patientId] || apt.patientId}</td>
                  <td>{doctorNameById[apt.doctorId] || apt.doctorId}</td>
                  <td>{apt.appointmentDate}</td>
                  <td>{apt.appointmentTime}</td>
                  <td><span className={`status-pill ${getStatusClass(apt.status)}`}>{apt.status}</span></td>
                  {(canEdit || canDelete) && (
                    <td>
                      <div className="action-btns">
                        {canEdit && <button className="btn-edit" onClick={() => handleEdit(apt)}>✏ Edit</button>}
                        {canDelete && <button className="btn-delete" onClick={() => handleDelete(apt.id)}>🗑 Remove</button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={canEdit || canDelete ? "7" : "6"} style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No appointments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (canAdd || canEdit) && (
        <div className="crud-form-overlay" onClick={(e) => e.target === e.currentTarget && resetForm()}>
          <div className="crud-form-modal">
            <h3>{form.id ? 'Update Appointment' : 'Add New Appointment'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input name="appointmentDate" type="date" value={form.appointmentDate} onChange={handleChange} required />
                <input name="appointmentTime" type="time" value={form.appointmentTime} onChange={handleChange} required />
                <select name="status" value={form.status} onChange={handleChange} required>
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
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
                <button type="submit">{form.id ? 'Update' : 'Add Appointment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
