import api from './api';

export const createRequest = async (requestData) => {
  const response = await api.post('/requests', requestData);
  return response.data;
};

export const getRequests = async (params = {}) => {
  const response = await api.get('/requests', { params });
  return response.data;
};

export const getMyRequests = async () => {
  const response = await api.get('/requests/my');
  return response.data;
};

export const updateRequestStatus = async (id, statusData) => {
  const response = await api.patch(`/requests/${id}/status`, statusData);
  return response.data;
};

export const deleteRequest = async (id) => {
  const response = await api.delete(`/requests/${id}`);
  return response.data;
};
