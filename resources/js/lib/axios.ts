import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://your-api-url.com',
  withCredentials: true, // important if you're using Laravel Sanctum
});

export default api;