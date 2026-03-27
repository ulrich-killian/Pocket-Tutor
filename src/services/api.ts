console.log('DEBUG - API URL:', process.env.EXPO_PUBLIC_API_URL);
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? '',
  timeout: 30000,
  // headers: {
  //   apikey: process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ?? '',
  // },
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    // DO NOT delete Content-Type on Android New Arch.
    // Instead, let it be, or set it explicitly to multipart.
    config.headers['Content-Type'] = 'multipart/form-data';
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(' Response:', response.status);
    return response;
  },
  (error) => {
    console.error('--- AXIOS DIAGNOSTICS ---');
    console.error('Code:', error.code); // e.g., ERR_NETWORK, ECONNABORTED
    console.error('Config URL:', error.config?.url);
    console.error('Is Transferred:', error.request?._sent); // Did the bytes even leave the phone?

    if (error.code === 'ERR_NETWORK') {
      console.error(
        'Check: 1. Android Cleartext Policy 2. Server Port 3000 Accessibility',
      );
    }

    return Promise.reject(error);
  },
);

export default api;
