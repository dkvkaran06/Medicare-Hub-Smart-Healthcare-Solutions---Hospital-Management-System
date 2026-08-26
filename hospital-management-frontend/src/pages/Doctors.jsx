import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  createDoctor,
  deleteDoctor,
  getDepartments,
  getDoctors,
  updateDoctor
} from '../api/hospitalApi';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  id: null,
  name: '',
  specialization: '',
  phone: '',
  email: '',
  departmentId: ''
};

export default function Doctors() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user?.role === 'admin';

  // Read search query from URL params
  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearchTerm(q);
  }, [searchParams]);

  const departmentNameById = useMemo(() => {
    return departments.reduce((acc, dept) => {
      acc[dept.id] = dept.name;
      return acc;
    }, {});
  }, [departments]);

  const loadData = async () => {
    const [doctorRes, deptRes] = await Promise.all([getDoctors(), getDepartments()]);
    setDoctors(doctorRes.data);
    setDepartments(deptRes.data);
  };

  useEffect(() => {
    loadData().catch(() => showMessage('Failed to load doctors', 'error'));
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
    const payload = { ...form, departmentId: Number(form.departmentId) };

    try {
      if (form.id) {
        await updateDoctor(form.id, payload);
        showMessage('Doctor updated successfully', 'success');
      } else {
        await createDoctor(payload);
        showMessage('Doctor created successfully', 'success');
      }
      resetForm();
      await loadData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to save doctor', 'error');
    }
  };

  const handleEdit = (doctor) => {
    setForm({ ...doctor, departmentId: doctor.departmentId ? String(doctor.departmentId) : '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoctor(id);
      showMessage('Doctor deleted successfully', 'success');
      await loadData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to delete doctor', 'error');
    }
  };

  const filteredDoctors = doctors.filter((d) =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canAdd = isAdmin;
  const canEdit = isAdmin;
  const canDelete = isAdmin;

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-back" onClick={() => window.history.back()}>← Back</button>
          <h2 className="page-title">{isAdmin ? 'Add New Doctor' : 'All Doctors'}</h2>
        </div>
        {canAdd && (
          <button className="btn-add-new" onClick={() => setShowForm(true)}>+ Add New</button>
        )}
      </div>

      {message && <div className={`error-banner ${messageType}`}>{message}</div>}

      <div className="page-card">
        <div className="table-section-title">All Doctors ({filteredDoctors.length})</div>

        <div className="filter-row">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search Doctor name or Email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Doctor Name</th>
                <th>Email</th>
                <th>Specialties</th>
                <th>Department</th>
                {(canEdit || canDelete) && <th>Events</th>}
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>{doctor.name}</td>
                  <td>{doctor.email}</td>
                  <td>{doctor.specialization}</td>
                  <td>{departmentNameById[doctor.departmentId] || doctor.departmentId}</td>
                  {(canEdit || canDelete) && (
                    <td>
                      <div className="action-btns">
                        {canEdit && <button className="btn-edit" onClick={() => handleEdit(doctor)}>✏ Edit</button>}
                        {canDelete && <button className="btn-delete" onClick={() => handleDelete(doctor.id)}>🗑 Remove</button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredDoctors.length === 0 && (
                <tr><td colSpan={canEdit || canDelete ? "5" : "4"} style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No doctors found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && canAdd && (
        <div className="crud-form-overlay" onClick={(e) => e.target === e.currentTarget && resetForm()}>
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
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
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
