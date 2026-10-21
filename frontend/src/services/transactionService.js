import api from './api';

export const getTransactions = async (params = {}) => {
  const response = await api.get('/transactions', { params });
  return response.data;
};

export const issueBook = async (issueData) => {
  const response = await api.post('/transactions/issue', issueData);
  return response.data;
};

export const returnBook = async (returnData) => {
  const response = await api.post('/transactions/return', returnData);
  return response.data;
};

export const getMyTransactions = async (params = {}) => {
  const response = await api.get('/transactions/my', { params });
  return response.data;
};

export const getOverdueTransactions = async () => {
  const response = await api.get('/transactions/overdue');
  return response.data;
};
