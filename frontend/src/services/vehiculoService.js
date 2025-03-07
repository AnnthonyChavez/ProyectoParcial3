import axios from 'axios';
import config from '../config';

// Asegurarnos de que la URL base es correcta
const API_URL = config.vehiculosUrl();
console.log('API URL Vehículos:', API_URL);

// Configurar interceptor para incluir el token en todas las peticiones
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const listarVehiculos = async () => {
  try {
    console.log('Solicitando lista de vehículos al backend...');
    const response = await axios.get(`${API_URL}/listar`);
    console.log('Respuesta del backend (vehículos):', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al listar vehículos:', error.response || error);
    throw error;
  }
};

const obtenerVehiculo = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener vehículo ${id}:`, error.response || error);
    throw error;
  }
};

const crearVehiculo = async (vehiculoData) => {
  const response = await axios.post(`${API_URL}/crear`, vehiculoData);
  return response.data;
};

const editarVehiculo = async (id, vehiculoData) => {
  const response = await axios.put(`${API_URL}/editar/${id}`, vehiculoData);
  return response.data;
};

const eliminarVehiculo = async (id) => {
  const response = await axios.delete(`${API_URL}/eliminar/${id}`);
  return response.data;
};

const vehiculoService = {
  listarVehiculos,
  obtenerVehiculo,
  crearVehiculo,
  editarVehiculo,
  eliminarVehiculo
};

export default vehiculoService; 