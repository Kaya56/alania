import axios from 'axios';
import storageService from '../storage/storageService'; // adapte le chemin si besoin
import API_BASE from './apiBase';

const axiosAuthInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajoute automatiquement le token à chaque requête
axiosAuthInstance.interceptors.request.use(
  async (config) => {
    const session = await storageService.getActiveSession();
    
    // console.log('[axiosAuthInstance] Preparing request to:', config.url);
    // console.log('[axiosAuthInstance] Current session:', session);
    
    if (session && session.accessToken) {
      config.headers['Authorization'] = `Bearer ${session.accessToken}`;
      // console.log('[axiosAuthInstance] Added Authorization header:', config.headers['Authorization']);
    } else {
      // console.warn('[axiosAuthInstance] No access token found, request sent without Authorization header.');
    }
    
    return config;
  },
  (error) => {
    // console.error('[axiosAuthInstance] Error in request interceptor:', error);
    return Promise.reject(error);
  }
);

export default axiosAuthInstance;
