import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  timeout: 30000,
  headers: {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  },
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  console.log(' Request:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    hasFile: config.data instanceof FormData,
  });

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(' Response:', response.status);
    return response;
  },
  (error) => {
    console.error(' Error Response:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  },
);

export default api;
