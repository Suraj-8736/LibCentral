import api from './api';

export const getFines = async (params = {}) => {
  const response = await api.get('/fines', { params });
  return response.data;
};

export const getMyFines = async () => {
  const response = await api.get('/fines/my');
  return response.data;
};

export const payFine = async (id, paymentData = {}) => {
  const response = await api.patch(`/fines/${id}/pay`, paymentData);
  return response.data;
};

export const waiveFine = async (id, waiverData = {}) => {
  const response = await api.patch(`/fines/${id}/waive`, waiverData);
  return response.data;
};
