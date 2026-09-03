import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMe, updateMe, deleteMe } from '../api/hospitalApi';

export default function Settings() {
  const [activeSection, setActiveSection] = useState(null); // 'profile' | 'security' | 'delete'
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName]               = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profilePic, setProfilePic] = useState('');

  useEffect(() => { fetchMe(); }, []);

  useEffect(() => {
    if (user?.email) {
      const storedPic = localStorage.getItem(`profile_pic_${user.email}`);
      if (storedPic) setProfilePic(storedPic);
    }
  }, [user]);

  const handlePicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfilePic(base64String);
        localStorage.setItem(`profile_pic_${user?.email}`, base64String);
        window.dispatchEvent(new Event('profilePicUpdated'));
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchMe = async () => {
    try {
      const res = await getMe();
      setUserDetails(res.data);
      setName(res.data.name);
    } catch (err) { console.error(err); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (newPassword && newPassword !== confirmPassword) { setError('New passwords do not match'); return; }
    setLoading(true);
    try {
      const payload = { name };
      if (newPassword) { payload.oldPassword = oldPassword; payload.newPassword = newPassword; }
      const res = await updateMe(payload);
      setSuccess('Account updated successfully!');
      setUserDetails(res.data);
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      setTimeout(() => { setActiveSection(null); setSuccess(''); }, 2000);
    } catch (err) { setError(err.response?.data?.error || 'Failed to update account'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    setError(''); setLoading(true);
    try { await deleteMe(); logout(); navigate('/'); }
    catch (err) { setError(err.response?.data?.error || 'Failed to delete account'); setLoading(false); }
  };

  const roleLabel = userDetails?.role?.toUpperCase() || '';

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-back" onClick={() => window.history.back()}>← Back</button>
          <h2 className="page-title">Settings</h2>
        </div>
      </div>

      {/* ── Profile card ── */}
      {userDetails && (
        <div className="settings-profile-card">
          <div className="settings-profile-avatar" style={{ position: 'relative', overflow: 'hidden' }}>
            {profilePic ? (
              <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              userDetails.name?.charAt(0)?.toUpperCase() || '?'
            )}
            <label style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: '#fff', textAlign: 'center', cursor: 'pointer', padding: '4px 0', opacity: 0.8 }} title="Change Profile Picture">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto' }}>
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePicUpload} />
            </label>
          </div>
          <div className="settings-profile-info">
            <div className="settings-profile-name">{userDetails.name}</div>
            <div className="settings-profile-email">{userDetails.email}</div>
            <span className="specialty-badge" style={{ marginTop: 4 }}>{roleLabel}</span>
          </div>
        </div>
      )}

      {/* ── Account section ── */}
      <div className="settings-section-label">ACCOUNT</div>
      <div className="settings-group">
        <button className="settings-row" onClick={() => { setActiveSection(activeSection === 'profile' ? null : 'profile'); setError(''); setSuccess(''); }}>
          <div className="settings-row-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div className="settings-row-body">
            <div className="settings-row-title">Profile Information</div>
            <div className="settings-row-desc">Name, email, and personal details</div>
          </div>
          <div className="settings-row-arrow">{activeSection === 'profile' ? '↑' : '›'}</div>
        </button>

        {/* Profile details inline */}
        {activeSection === 'profile' && userDetails && (
          <div className="settings-inline-panel">
            <div className="settings-detail-grid">
              <div className="settings-detail-group">
                <div className="settings-detail-section">Contact Information</div>
                <div className="settings-detail-row">
                  <span className="settings-detail-key">Email</span>
                  <span className="settings-detail-val">{userDetails.email}</span>
                </div>
                {userDetails.phone && (
                  <div className="settings-detail-row">
                    <span className="settings-detail-key">Phone</span>
                    <span className="settings-detail-val">{userDetails.phone}</span>
                  </div>
                )}
              </div>
              {userDetails.role === 'patient' && (
                <div className="settings-detail-group">
                  <div className="settings-detail-section">Personal Information</div>
                  {userDetails.age !== undefined && (
                    <div className="settings-detail-row">
                      <span className="settings-detail-key">Age</span>
                      <span className="settings-detail-val">{userDetails.age}</span>
                    </div>
                  )}
                  {userDetails.gender && (
                    <div className="settings-detail-row">
                      <span className="settings-detail-key">Gender</span>
                      <span className="settings-detail-val">{userDetails.gender}</span>
                    </div>
                  )}
                  {userDetails.bloodGroup && (
                    <div className="settings-detail-row">
                      <span className="settings-detail-key">Blood Group</span>
                      <span className="settings-detail-val">{userDetails.bloodGroup}</span>
                    </div>
                  )}
                </div>
              )}
              {userDetails.role === 'doctor' && (
                <div className="settings-detail-group">
                  <div className="settings-detail-section">Professional</div>
                  {userDetails.specialization && (
                    <div className="settings-detail-row">
                      <span className="settings-detail-key">Specialization</span>
                      <span className="settings-detail-val">{userDetails.specialization}</span>
                    </div>
                  )}
                  {userDetails.department && (
                    <div className="settings-detail-row">
                      <span className="settings-detail-key">Department</span>
                      <span className="settings-detail-val">{userDetails.department}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <button className="settings-row" onClick={() => { setActiveSection(activeSection === 'security' ? null : 'security'); setError(''); setSuccess(''); }}>
          <div className="settings-row-icon" style={{ background: '#F0FDF4', color: '#16A34A' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div className="settings-row-body">
            <div className="settings-row-title">Password & Security</div>
            <div className="settings-row-desc">Change your name and password</div>
          </div>
          <div className="settings-row-arrow">{activeSection === 'security' ? '↑' : '›'}</div>
        </button>

        {/* Security form inline */}
        {activeSection === 'security' && (
          <div className="settings-inline-panel">
            {error   && <div className="auth-error">{error}</div>}
            {success && <div className="auth-error" style={{ background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0', border: '1px solid #34d399' }}>{success}</div>}
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Current Password <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(only if changing)</span></label>
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
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-add-new" disabled={loading}>{loading ? 'Saving…' : 'Save Changes'}</button>
                <button type="button" className="secondary" onClick={() => setActiveSection(null)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── Danger Zone ── */}
      <div className="settings-section-label" style={{ marginTop: 32 }}>ACCOUNT MANAGEMENT</div>
      <div className="danger-zone">
        <div className="danger-zone-header">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Danger Zone
        </div>
        <div className="danger-zone-body">
          <div className="danger-zone-info">
            <div className="danger-zone-title">Delete Account</div>
            <div className="danger-zone-desc">Permanently delete your Medicare Hub account and all associated data. This action cannot be undone.</div>
          </div>
          <button
            className="danger-zone-btn"
            onClick={() => setActiveSection(activeSection === 'delete' ? null : 'delete')}
          >
            Delete Account
          </button>
        </div>

        {activeSection === 'delete' && (
          <div className="danger-zone-confirm">
            {error && <div className="auth-error">{error}</div>}
            <p>Are you absolutely sure? Type your intent by clicking the button below. All your data — appointments, bills, and records — will be permanently erased.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="danger-zone-btn" onClick={handleDelete} disabled={loading}>
                {loading ? 'Deleting…' : 'Yes, permanently delete my account'}
              </button>
              <button className="secondary" onClick={() => setActiveSection(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
