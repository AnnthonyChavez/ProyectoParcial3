import axios from 'axios';
import config from '../config';

const API_URL = config.authUrl();
console.log('API URL Auth:', API_URL);

const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data;
};

const register = async (userData) => {
  const { rolNombre = 'COMPRADOR', ...userDataWithoutRole } = userData;
  
  const response = await axios.post('/api/usuarios/crear', userDataWithoutRole, {
    params: {
      rolNombre: rolNombre
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