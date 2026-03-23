import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  timeout: 30000,
  headers: {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  },
});

// Add this interceptor to handle FormData correctly
api.interceptors.request.use((config) => {
  // If the data is FormData, remove the Content-Type header
  // Let the browser/RN set it automatically with the boundary
  if (config.data instanceof FormData) {
    // Delete the Content-Type header to let axios/browser set it
    delete config.headers['Content-Type'];
  }

  console.log('📤 Request:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    hasFile: config.data instanceof FormData,
  });

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ Error Response:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  },
);

export default api;
