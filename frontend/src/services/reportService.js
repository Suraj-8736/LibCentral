import api from './api';

export const getSummaryReport = async () => {
  const response = await api.get('/reports/summary');
  return response.data;
};

export const getMonthlyStatistics = async () => {
  const response = await api.get('/reports/monthly');
  return response.data;
};

export const getTopBorrowedBooks = async () => {
  const response = await api.get('/reports/top-books');
  return response.data;
};

export const getMostActiveStudents = async () => {
  const response = await api.get('/reports/top-students');
  return response.data;
};
