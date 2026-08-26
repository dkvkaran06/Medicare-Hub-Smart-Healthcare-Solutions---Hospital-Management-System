import axios from 'axios';

const client = axios.create({
  baseURL: 'https://medicare-hub-backend-ntpd.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default client;