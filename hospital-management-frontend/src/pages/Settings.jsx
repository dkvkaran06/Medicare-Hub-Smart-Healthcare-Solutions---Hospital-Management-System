export default function Settings() {
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
        <div className="settings-item">
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

        <div className="settings-item">
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

        <div className="settings-item danger">
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
    </div>
  );
}
