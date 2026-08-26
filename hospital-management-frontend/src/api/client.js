import axios from 'axios';

// Base URL comes from VITE_API_URL when set (see .env.local, which points at
// http://localhost:8080/api for local testing). Production builds on Vercel set
// no such variable, so they fall back to the deployed Render backend.
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://medicare-hub-backend-ntpd.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach the JWT (saved by AuthContext under hms_auth_user) to every request.
// Sessions from before auth existed have no token, so no header is sent and the
// backend treats them as anonymous (401) -> the response interceptor below turns
// that into a clean re-login.
client.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('hms_auth_user');
    if (stored) {
      const token = JSON.parse(stored)?.token;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (e) {
    // Corrupt/unreadable storage -> just send the request without a token.
  }
  return config;
});

// A 401 means the token is missing/expired/invalid: drop the stale session and
// send the user to /login. We deliberately skip this for /auth/* calls so a
// wrong-password login keeps showing its inline error instead of redirecting,
// and we never log out on 403 (that is a role/ownership denial, not an expired
// session). window.location is used because interceptors run outside the Router.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';
    if (status === 401 && !url.includes('/auth/')) {
      try {
        localStorage.removeItem('hms_auth_user');
      } catch (e) {
        // ignore storage errors
      }
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
