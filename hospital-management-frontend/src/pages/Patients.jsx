import { useEffect, useState } from 'react';
import { createPatient, deletePatient, getPatients, updatePatient } from '../api/hospitalApi';

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

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadPatients = async () => {
    const response = await getPatients();
    setPatients(response.data);
  };

  useEffect(() => {
    loadPatients().catch(() => showMessage('Failed to load patients', 'error'));
  }, []);

  const showMessage = (msg, type = 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      age: Number(form.age)
    };

    try {
      if (form.id) {
        await updatePatient(form.id, payload);
        showMessage('Patient updated successfully', 'success');
      } else {
        await createPatient(payload);
        showMessage('Patient created successfully', 'success');
      }
      resetForm();
      await loadPatients();
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
      await loadPatients();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to delete patient', 'error');
    }
  };

  const filteredPatients = patients.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-back" onClick={() => window.history.back()}>← Back</button>
          <h2 className="page-title">Patients</h2>
        </div>
        <button className="btn-add-new" onClick={() => setShowForm(true)}>+ Add New</button>
      </div>

      {message && <div className={`error-banner ${messageType}`}>{message}</div>}

      <div className="page-card">
        <div className="table-section-title">All Patients ({filteredPatients.length})</div>

        <div className="filter-row">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Blood Group</th>
                <th>Events</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.name}</td>
                  <td>{patient.email}</td>
                  <td>{patient.phone}</td>
                  <td>{patient.age}</td>
                  <td>{patient.gender}</td>
                  <td>{patient.bloodGroup}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-edit" onClick={() => handleEdit(patient)}>✏ Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(patient.id)}>🗑 Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No patients found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
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
