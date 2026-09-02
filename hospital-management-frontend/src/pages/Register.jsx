import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser, getDepartments } from '../api/hospitalApi';
import { useEffect } from 'react';

/* ── Password-strength helpers ── */
const PASSWORD_RULES = [
  { id: 'length',    label: 'At least 8 characters',            test: (p) => p.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter (A-Z)',       test: (p) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'One lowercase letter (a-z)',       test: (p) => /[a-z]/.test(p) },
  { id: 'number',    label: 'One number (0-9)',                 test: (p) => /[0-9]/.test(p) },
  { id: 'symbol',    label: 'One special character (!@#$%...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const STRENGTH_LEVELS = [
  { label: 'Too weak',  color: '#DC2626', className: 'pw-weak'   },  // 0 rules passed
  { label: 'Too weak',  color: '#DC2626', className: 'pw-weak'   },  // 1 rule  passed
  { label: 'Weak',      color: '#F97316', className: 'pw-fair'   },  // 2 rules passed
  { label: 'Fair',      color: '#F59E0B', className: 'pw-fair'   },  // 3 rules passed
  { label: 'Good',      color: '#22C55E', className: 'pw-good'   },  // 4 rules passed
  { label: 'Strong',    color: '#16A34A', className: 'pw-strong' },  // 5 rules passed (all)
];

function getStrength(password) {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  return { passed, total: PASSWORD_RULES.length, level: STRENGTH_LEVELS[passed] ?? STRENGTH_LEVELS[0] };
}

/* ── Email validation helper ── */
function isValidGmail(email) {
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email);
}

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  
  // Patient fields
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Doctor fields
  const [specialization, setSpecialization] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getDepartments().then(res => setDepartments(res.data)).catch(() => {});
  }, []);

  /* Live password strength */
  const strength = useMemo(() => getStrength(password), [password]);
  const allPasswordRulesPassed = strength.passed === strength.total;

  /* Email error (shown only after the user interacts with the field) */
  const emailError = emailTouched && email && !isValidGmail(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (!isValidGmail(email)) {
      setError('Only @gmail.com email addresses are accepted');
      return;
    }
    if (!allPasswordRulesPassed) {
      setError('Please meet all password requirements before continuing');
      return;
    }

    setLoading(true);
    try {
      const payload = { name, email, password, role };
      if (role === 'patient') {
        Object.assign(payload, { age, gender, phone, bloodGroup });
      } else if (role === 'doctor') {
        Object.assign(payload, { phone, specialization, departmentId });
      }
      const response = await registerUser(payload);
      login(response.data);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Register to get started</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* ── Full Name ── */}
          <div className="form-group">
            <label>Full Name:</label>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* ── Email (gmail only) ── */}
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              placeholder="yourname@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              className={emailError ? 'input-error' : ''}
              required
            />
            {emailError && (
              <span className="field-hint field-hint--error">
                ✕ Only @gmail.com addresses are accepted
              </span>
            )}
            {emailTouched && email && isValidGmail(email) && (
              <span className="field-hint field-hint--success">
                ✓ Valid Gmail address
              </span>
            )}
          </div>

          {/* ── Password with strength meter ── */}
          <div className="form-group">
            <label>Password:</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '44px', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', padding: '0',
                  color: '#94A3B8', display: 'flex', alignItems: 'center'
                }}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Strength bar + label */}
            {password && (
              <div className="pw-strength-wrapper">
                <div className="pw-strength-bar-track">
                  <div
                    className={`pw-strength-bar-fill ${strength.level.className}`}
                    style={{ width: `${(strength.passed / strength.total) * 100}%` }}
                  />
                </div>
                <span className="pw-strength-label" style={{ color: strength.level.color }}>
                  {strength.level.label}
                </span>
              </div>
            )}

            {/* Requirement checklist */}
            {password && (
              <ul className="pw-checklist">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(password);
                  return (
                    <li key={rule.id} className={passed ? 'pw-rule-pass' : 'pw-rule-fail'}>
                      <span className="pw-rule-icon">{passed ? '✓' : '✕'}</span>
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* ── Role selector ── */}
          <div className="form-group">
            <label>Register as:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {/* ── Conditional Fields ── */}
          {role === 'patient' && (
            <>
              <div className="form-group">
                <label>Age:</label>
                <input type="number" placeholder="Your Age" value={age} onChange={(e) => setAge(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Gender:</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input type="text" placeholder="Your Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Blood Group:</label>
                <input type="text" placeholder="e.g. O+, A-, B+" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} required />
              </div>
            </>
          )}

          {role === 'doctor' && (
            <>
              <div className="form-group">
                <label>Phone:</label>
                <input type="text" placeholder="Your Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Specialization:</label>
                <input type="text" placeholder="e.g. Cardiologist" value={specialization} onChange={(e) => setSpecialization(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Department:</label>
                <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required>
                  <option value="">Select a Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn-auth"
            disabled={loading || emailError || (password && !allPasswordRulesPassed)}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
