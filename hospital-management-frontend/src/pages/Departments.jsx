import { useEffect, useState } from 'react';
import { createDepartment, deleteDepartment, getDepartments, updateDepartment } from '../api/hospitalApi';
import { cachedFetch, invalidate } from '../api/cache';

const emptyForm = { id: null, name: '', description: '' };

function SkeletonRow() {
  return (
    <tr>
      {[0, 1, 2].map((i) => (
        <td key={i}>
          <div style={{
            height: '14px', borderRadius: '6px',
            background: 'linear-gradient(90deg, #E0F2FE 25%, #BAE6FD 50%, #E0F2FE 75%)',
            backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
            width: i === 2 ? '40%' : '80%'
          }} />
        </td>
      ))}
    </tr>
  );
}

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadDepartments = async (bustCache = false) => {
    if (bustCache) invalidate('departments');
    await cachedFetch('departments', getDepartments, (d) => { setDepartments(d); setLoading(false); });
    setLoading(false);
  };

  useEffect(() => {
    loadDepartments().catch(() => { showMessage('Failed to load departments', 'error'); setLoading(false); });
  }, []);

  const showMessage = (msg, type = 'error') => {
    setMessage(msg); setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((curr) => ({ ...curr, [name]: value }));
  };

  const resetForm = () => { setForm(emptyForm); setShowForm(false); };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (form.id) {
        await updateDepartment(form.id, form);
        showMessage('Department updated successfully', 'success');
      } else {
        await createDepartment(form);
        showMessage('Department created successfully', 'success');
      }
      resetForm();
      await loadDepartments(true);
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to save department', 'error');
    }
  };

  const handleEdit = (department) => { setForm(department); setShowForm(true); };

  const handleDelete = async (id) => {
    try {
      await deleteDepartment(id);
      showMessage('Department deleted successfully', 'success');
      await loadDepartments(true);
    } catch (error) {
      showMessage(error.response?.data?.message || 'Failed to delete department', 'error');
    }
  };

  const filtered = departments.filter((d) =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-back" onClick={() => window.history.back()}>← Back</button>
          <h2 className="page-title">Departments</h2>
        </div>
        <button className="btn-add-new" onClick={() => setShowForm(true)}>+ Add New</button>
      </div>

      {message && <div className={`error-banner ${messageType}`}>{message}</div>}

      <div className="page-card">
        <div className="table-section-title">All Departments ({filtered.length})</div>

        <div className="filter-row">
          <label>Search:</label>
          <input type="text" placeholder="Search department name" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Description</th>
                <th>Events</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : filtered.map((dept) => (
                    <tr key={dept.id}>
                      <td>{dept.name}</td>
                      <td>{dept.description}</td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-edit" onClick={() => handleEdit(dept)}>✏ Edit</button>
                          <button className="btn-delete" onClick={() => handleDelete(dept.id)}>🗑 Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
              {!loading && filtered.length === 0 && (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>No departments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="crud-form-overlay" onClick={(e) => e.target === e.currentTarget && resetForm()}>
          <div className="crud-form-modal">
            <h3>{form.id ? 'Update Department' : 'Add New Department'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input name="name" value={form.name} onChange={handleChange} placeholder="Department Name" required className="full-width" />
                <input name="description" value={form.description} onChange={handleChange} placeholder="Description" required className="full-width" />
              </div>
              <div className="button-row">
                <button type="button" className="secondary" onClick={resetForm}>Cancel</button>
                <button type="submit">{form.id ? 'Update' : 'Add Department'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
