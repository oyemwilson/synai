import axios from 'axios';

// Backend is on port 4000, frontend on port 3000
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:4000/api'  // Backend port 4000
  : '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    console.log('🔐 API Request Interceptor - Token present:', !!token);
    console.log('🔐 API Request Interceptor - Making request to:', config.url);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header added to request');
    } else {
      console.warn('⚠️ No token found for API request to:', config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with better debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response success:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      headers: error.config?.headers
    });
    
    if (error.response?.status === 401) {
      console.log('🔄 401 Unauthorized - Clearing auth data');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Don't redirect here to avoid loops during login
    }
    
    return Promise.reject(error);
  }
);

// ... rest of your API exports remain the same

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  resendOTP: (email) => api.post('/auth/resend-otp', { email }),
  getProfile: () => api.get('/auth/profile'),
  onboarding: (data) => api.post('/auth/onboarding', data),
  generateFinancialPlan: () => api.post('/auth/generate-financial-plan'),
};

// Portfolio API calls
export const portfolioAPI = {
  getOverview: () => api.get('/portfolio/overview'),
  addInvestment: (data) => api.post('/portfolio/investments', data),
  removeInvestment: (investmentId) => api.delete(`/portfolio/investments/${investmentId}`),
  runSimulation: (data) => api.post('/portfolio/simulation', data),
  getPerformance: (period) => api.get(`/portfolio/performance?period=${period}`),
};

// Market API calls
export const marketAPI = {
  getQuotes: (symbols) => api.get(`/market/quotes?symbols=${symbols}`),
  getHistoricalData: (symbol, period = 'daily') => 
    api.get(`/market/historical/${symbol}?period=${period}`),
  searchStocks: (query) => api.get(`/market/search?query=${query}`),
  getMarketOverview: () => api.get('/market/overview'),
  getCompanyProfile: (symbol) => api.get(`/market/profile/${symbol}`),
  testFMP: () => api.get('/market/test-fmp'),
};

// Analytics API calls
export const analyticsAPI = {
  getPortfolioAnalytics: () => api.get('/analytics/analytics'),
  runMonteCarlo: (data) => api.post('/analytics/monte-carlo', data),
  getEfficientFrontier: () => api.get('/analytics/efficient-frontier'),
};

export { api };