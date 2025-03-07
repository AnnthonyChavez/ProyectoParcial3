import axios from 'axios';
import config from '../config';

// Asegurarnos de que la URL base es correcta
const API_URL = config.subastasUrl();
console.log('API URL Subastas:', API_URL);

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

const listarSubastas = async () => {
  try {
    console.log('Solicitando lista de subastas al backend...');
    const response = await axios.get(`${API_URL}/listar`);
    console.log('Respuesta del backend (subastas):', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al listar subastas:', error.response || error);
    throw error;
  }
};

const obtenerSubasta = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener subasta ${id}:`, error.response || error);
    throw error;
  }
};

const crearSubasta = async (subastaData) => {
  try {
    const response = await axios.post(`${API_URL}/crear`, subastaData);
    return response.data;
  } catch (error) {
    console.error('Error al crear subasta:', error.response || error);
    throw error;
  }
};

const editarSubasta = async (id, subastaData) => {
  try {
    const response = await axios.put(`${API_URL}/editar/${id}`, subastaData);
    return response.data;
  } catch (error) {
    console.error(`Error al editar subasta ${id}:`, error.response || error);
    throw error;
  }
};

const eliminarSubasta = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/eliminar/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar subasta ${id}:`, error.response || error);
    throw error;
  }
};

const buscarSubastasPorFecha = async (inicio, fin) => {
  try {
    const response = await axios.get(`${API_URL}/buscar-por-fecha?inicio=${inicio}&fin=${fin}`);
    return response.data;
  } catch (error) {
    console.error('Error al buscar subastas por fecha:', error.response || error);
    throw error;
  }
};

const agregarVehiculoASubasta = async (subastaId, vehiculoId) => {
  try {
    const response = await axios.post(`${API_URL}/${subastaId}/agregar-vehiculo/${vehiculoId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al agregar vehículo ${vehiculoId} a subasta ${subastaId}:`, error.response || error);
    throw error;
  }
};

const removerVehiculoDeSubasta = async (subastaId, vehiculoId) => {
  try {
    const response = await axios.delete(`${API_URL}/${subastaId}/remover-vehiculo/${vehiculoId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al remover vehículo ${vehiculoId} de subasta ${subastaId}:`, error.response || error);
    throw error;
  }
};

const realizarPuja = async (subastaId, monto, vehiculoId = null) => {
  try {
    const pujaData = {
      subastaId: subastaId,
      monto: monto
    };
    
    // Añadir el ID del vehículo si se proporciona
    if (vehiculoId !== null) {
      pujaData.vehiculoId = vehiculoId;
    }
    
    const response = await axios.post(`${API_URL}/${subastaId}/pujar`, pujaData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error al realizar puja en subasta ${subastaId}:`, error.response || error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Error al realizar la puja' 
    };
  }
};

const subastaService = {
  listarSubastas,
  obtenerSubasta,
  crearSubasta,
  editarSubasta,
  eliminarSubasta,
  buscarSubastasPorFecha,
  agregarVehiculoASubasta,
  removerVehiculoDeSubasta,
  realizarPuja
};

export default subastaService; 