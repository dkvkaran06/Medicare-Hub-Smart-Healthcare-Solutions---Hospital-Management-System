import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/hospitalApi';
import client from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Pre-warm: silently ping the backend the moment this page loads.
  // By the time the user types credentials and clicks Login, the Render
  // server is already awake and the TCP connection is established —
  // making the actual login request feel near-instant.
  useEffect(() => {
    const base = (import.meta.env.VITE_API_URL || 'https://medicare-hub-backend-ntpd.onrender.com/api').replace('/api', '');
    fetch(`${base}/healthz`).catch(() => {/* ignore — fire-and-forget */});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser({ email, password });
      login(response.data);       // save user to context/localStorage
      navigate('/dashboard');     // only navigate AFTER successful login
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome Back!</h2>
        <p className="auth-subtitle">Login with your details to continue</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
