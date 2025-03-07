import axios from 'axios';
import config from '../config';

// Asegurarnos de que la URL base es correcta
const API_URL = config.subastaVehiculoUrl();
console.log('API URL Subasta-Vehículo:', API_URL);

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

/**
 * Listar vehículos asociados a una subasta
 * @param {number} subastaId - ID de la subasta
 * @returns {Promise} - Promesa con la respuesta
 */
const listarVehiculosEnSubasta = async (subastaId) => {
  try {
    const response = await axios.get(`${API_URL}/listar/${subastaId}`);
    return response.data;
  } catch (error) {
    console.error('Error al listar vehículos en subasta:', error);
    throw error;
  }
};

/**
 * Asociar un vehículo a una subasta
 * @param {number} subastaId - ID de la subasta
 * @param {number} vehiculoId - ID del vehículo
 * @returns {Promise} - Promesa con la respuesta
 */
const asociarVehiculoASubasta = async (subastaId, vehiculoId) => {
  try {
    const response = await axios.post(`${API_URL}/asociar`, {
      subasta: {
        id: subastaId
      },
      vehiculo: {
        id: vehiculoId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al asociar vehículo a subasta:', error);
    throw error;
  }
};

/**
 * Eliminar asociación de vehículo a subasta
 * @param {number} id - ID de la asociación
 * @returns {Promise} - Promesa con la respuesta
 */
const eliminarAsociacion = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/eliminar/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar asociación:', error);
    throw error;
  }
};

const subastaVehiculoService = {
  listarVehiculosEnSubasta,
  asociarVehiculoASubasta,
  eliminarAsociacion
};

export default subastaVehiculoService; 