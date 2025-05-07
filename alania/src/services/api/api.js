import axios from 'axios';
import API_BASE from './apiBase';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
