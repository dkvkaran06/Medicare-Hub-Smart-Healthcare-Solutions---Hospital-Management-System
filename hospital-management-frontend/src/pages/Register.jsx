import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../api/hospitalApi';

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
  const { login } = useAuth();
  const navigate = useNavigate();

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
      const response = await registerUser({ name, email, password, role });
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
            <input
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

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
