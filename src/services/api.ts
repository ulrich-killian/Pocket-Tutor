import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 30000,
});

console.log('BASE URL:', api.defaults.baseURL);

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
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
    console.error('Code:', error.code);
    console.error('Config URL:', error.config?.url);
    console.error('Is Transferred:', error.request?._sent);

    if (error.code === 'ERR_NETWORK') {
      console.error(
        'Check: 1. Android Cleartext Policy 2. Server Port 3000 Accessibility',
      );
    }

    return Promise.reject(error);
  },
);

export default api;
