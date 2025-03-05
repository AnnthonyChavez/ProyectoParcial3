import axios from 'axios';

const API_URL = '/api/auth';

const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data;
};

const register = async (userData) => {
  const response = await axios.post('/api/usuarios/crear', userData, {
    params: {
      rolNombre: 'COMPRADOR'
    }
  });
  return response.data;
};

const testToken = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/test-token`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export default {
  login,
  register,
  testToken
}; 