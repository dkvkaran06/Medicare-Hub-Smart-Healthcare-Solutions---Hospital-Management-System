import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMe, updateMe, deleteMe } from '../api/hospitalApi';

export default function Settings() {
  const [activeModal, setActiveModal] = useState(null); // 'edit', 'details', 'delete'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchMe();
  }, []);

  const fetchMe = async () => {
    try {
      const res = await getMe();
      setUserDetails(res.data);
      setName(res.data.name);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const payload = { name };
      if (newPassword) {
        payload.oldPassword = oldPassword;
        payload.newPassword = newPassword;
      }
      
      const res = await updateMe(payload);
      setSuccess('Account updated successfully!');
      setUserDetails(res.data);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => { setActiveModal(null); setSuccess(''); }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setLoading(true);
    try {
      await deleteMe();
      logout();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete account');
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-back" onClick={() => window.history.back()}>
            ← Back
          </button>
          <h2 className="page-title">Settings</h2>
        </div>
      </div>

      <div className="settings-list">
        <div className="settings-item" style={{cursor: 'pointer'}} onClick={() => { setActiveModal('edit'); setError(''); setSuccess(''); }}>
          <div className="settings-item-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className="settings-item-text">
            <h4>Account Settings</h4>
            <p>Edit your Account Details & Change Password</p>
          </div>
        </div>

        <div className="settings-item" style={{cursor: 'pointer'}} onClick={() => setActiveModal('details')}>
          <div className="settings-item-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div className="settings-item-text">
            <h4>View Account Details</h4>
            <p>View Personal information About Your Account</p>
          </div>
        </div>

        <div className="settings-item danger" style={{cursor: 'pointer'}} onClick={() => { setActiveModal('delete'); setError(''); }}>
          <div className="settings-item-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
              <line x1="18" y1="8" x2="23" y2="13" />
              <line x1="23" y1="8" x2="18" y2="13" />
            </svg>
          </div>
          <div className="settings-item-text">
            <h4>Delete Account</h4>
            <p>Will Permanently Remove your Account</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'edit' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Account Settings</h3>
            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-error" style={{backgroundColor: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0', border: '1px solid #34d399'}}>{success}</div>}
            <form onSubmit={handleUpdate} className="auth-form" style={{marginTop: '20px'}}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Old Password (if changing)</label>
                <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn-auth" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn-auth" style={{backgroundColor: '#e2e8f0', color: '#475569'}} onClick={() => setActiveModal(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'details' && (
        <div className="modal-overlay">
          <div className="modal-content" style={{textAlign: 'left'}}>
            <h3>Account Details</h3>
            {userDetails ? (
              <div style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px'}}>
                <div><strong>Name:</strong> {userDetails.name}</div>
                <div><strong>Email:</strong> {userDetails.email}</div>
                <div><strong>Role:</strong> <span className={`status-badge status-${userDetails.role}`}>{userDetails.role?.toUpperCase()}</span></div>
                
                {userDetails.phone && <div><strong>Phone:</strong> {userDetails.phone}</div>}
                
                {userDetails.role === 'patient' && (
                  <>
                    {userDetails.age !== undefined && <div><strong>Age:</strong> {userDetails.age}</div>}
                    {userDetails.gender && <div><strong>Gender:</strong> {userDetails.gender}</div>}
                    {userDetails.bloodGroup && <div><strong>Blood Group:</strong> {userDetails.bloodGroup}</div>}
                  </>
                )}
                
                {userDetails.role === 'doctor' && (
                  <>
                    {userDetails.specialization && <div><strong>Specialization:</strong> {userDetails.specialization}</div>}
                    {userDetails.department && <div><strong>Department:</strong> {userDetails.department}</div>}
                  </>
                )}
              </div>
            ) : (
              <p>Loading...</p>
            )}
            <button type="button" className="btn-auth" style={{marginTop: '30px'}} onClick={() => setActiveModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {activeModal === 'delete' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{color: '#dc2626'}}>Delete Account</h3>
            <p style={{marginTop: '15px', marginBottom: '20px', color: '#475569'}}>
              Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
            </p>
            {error && <div className="auth-error">{error}</div>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn-auth" style={{backgroundColor: '#dc2626'}} onClick={handleDelete} disabled={loading}>
                {loading ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
              <button type="button" className="btn-auth" style={{backgroundColor: '#e2e8f0', color: '#475569'}} onClick={() => setActiveModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
