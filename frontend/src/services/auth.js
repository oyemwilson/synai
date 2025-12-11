import { authAPI } from './api';

export const authService = {
  // Store auth data in localStorage
  setAuthData: (token, user) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Get stored auth data
  getAuthData: () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return {
      token,
      user: user ? JSON.parse(user) : null
    };
  },

  // Clear auth data
  clearAuthData: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // Sign up user
  signup: async (userData) => {
    const response = await authAPI.signup(userData);
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    const response = await authAPI.verifyOTP(email, otp);
    return response.data;
  },

// Login
login: async (email, password) => {
  try {
    console.log('🔐 Attempting login for:', email);
    const response = await authAPI.login(email, password);
    console.log('📨 Login response:', response.data);
    
    // Handle different response formats
    let token, user;
    
    if (response.data.token && response.data.user) {
      // Format 1: { token, user }
      token = response.data.token;
      user = response.data.user;
    } else if (response.data.accessToken) {
      // Format 2: { accessToken, user }
      token = response.data.accessToken;
      user = response.data.user;
    } else if (response.data.data && response.data.data.token) {
      // Format 3: { data: { token, user } }
      token = response.data.data.token;
      user = response.data.data.user;
    } else {
      // Fallback: use whatever is in response.data
      token = response.data.token || response.data.accessToken;
      user = response.data.user || response.data;
    }
    
    if (!token) {
      throw new Error('No token received from server');
    }
    
    console.log('✅ Token received:', token ? 'Yes' : 'No');
    console.log('✅ User data received:', user ? 'Yes' : 'No');
    
    // **CRITICAL FIX: Store token IMMEDIATELY before any other API calls**
    console.log('💾 Storing token in localStorage immediately...');
    localStorage.setItem('authToken', token);
    
    // If we don't have complete user data, fetch profile WITH THE TOKEN
    if (!user || !user._id) {
      console.log('🔄 Fetching user profile with stored token...');
      try {
        const userResponse = await authAPI.getProfile();
        user = userResponse.data;
        console.log('✅ User profile fetched successfully');
      } catch (profileError) {
        console.error('❌ Profile fetch failed:', profileError);
        // Even if profile fails, we still have the token and basic user info
        console.log('⚠️ Continuing with basic user info from login');
      }
    }
    
    // Store complete user data
    localStorage.setItem('user', JSON.stringify(user));
    console.log('💾 User data stored in localStorage');
    
    return { token, user };
  } catch (error) {
    console.error('❌ Login error:', error);
    // Clear any partial auth data on error
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    throw error;
  }
},

  // Logout
  logout: () => {
    authService.clearAuthData();
    window.location.href = '/login';
  },

  // Get user profile
  getProfile: async () => {
    const response = await authAPI.getProfile();
    return response.data;
  },

  // Complete onboarding
  onboarding: async (data) => {
    const response = await authAPI.onboarding(data);
    return response.data;
  },

  // Generate financial plan
  generateFinancialPlan: async () => {
    const response = await authAPI.generateFinancialPlan();
    return response.data;
  }
};