/**
 * Shared axios instance.
 * Base URL points to the Express backend, and the Authorization header is
 * auto-populated from localStorage for every request.
 * @module api/axios
 */
import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5000';
export const STORAGE_KEY = 'apartment_user';

/** Absolute base for uploaded files (served statically by Express). */
export const ASSET_BASE_URL = `${API_BASE_URL}/uploads`;

/**
 * Resolves a stored photoUrl (e.g. "/uploads/visitor-123.jpg") into an
 * absolute URL the browser can load.
 * @param {string} [photoUrl] - Stored value from the Visitor document.
 * @returns {string} Absolute image URL.
 */
export const resolvePhotoUrl = (photoUrl) => {
  if (!photoUrl) return '';
  return `${API_BASE_URL}${photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`}`;
};

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Attach the JWT from localStorage to every outgoing request.
api.interceptors.request.use(
  (config) => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const user = JSON.parse(raw);
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// On a 401 the token is stale; clear the session and send the user to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEY);
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;