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

export default client;