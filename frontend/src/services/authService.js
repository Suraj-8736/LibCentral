import api from './api';

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.put('/auth/change-password', passwordData);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const verifyOtp = async (email, otp) => {
  const response = await api.post('/auth/verify-otp', { email, otp });
  return response.data;
};

export const resetPasswordWithOtp = async (email, otp, newPassword) => {
  const response = await api.post('/auth/reset-password', { email, otp, newPassword });
  return response.data;
};

export const sendLoginOtp = async (email) => {
  const response = await api.post('/auth/send-login-otp', { email });
  return response.data;
};

export const loginWithOtp = async (email, otp) => {
  const response = await api.post('/auth/login-with-otp', { email, otp });
  return response.data;
};

export const logoutUser = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error) {
    return { success: false };
  }
};

export const sendHeartbeat = async () => {
  try {
    const response = await api.post('/auth/heartbeat');
    return response.data;
  } catch (error) {
    return { success: false };
  }
};

export const getStaffStatus = async (role = 'librarian') => {
  const response = await api.get(`/auth/staff-status?role=${role}`);
  return response.data;
};
