/**
 * Formatea una fecha en formato legible
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDate = (date) => {
  if (!date) return 'Fecha no disponible';
  
  try {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Fecha inválida';
  }
};

/**
 * Calcula el tiempo restante hasta una fecha
 * @param {Date} endDate - Fecha final
 * @returns {string} Tiempo restante formateado
 */
export const timeRemaining = (endDate) => {
  if (!endDate) return 'No disponible';
  
  try {
    const now = new Date();
    const end = new Date(endDate);
    
    if (end <= now) {
      return 'Finalizada';
    }
    
    const diffMs = end - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ${diffSeconds}s`;
    } else {
      return `${diffSeconds}s`;
    }
  } catch (error) {
    console.error('Error al calcular tiempo restante:', error);
    return 'No disponible';
  }
};

/**
 * Verifica si una subasta está activa
 * @param {Object} subasta - Objeto de subasta
 * @returns {boolean} True si la subasta está activa
 */
export const isSubastaActive = (subasta) => {
  if (!subasta) return false;
  
  try {
    const now = new Date();
    
    // Convertir fechas de array a objetos Date si es necesario
    const fechaInicio = Array.isArray(subasta.fechaInicio) 
      ? new Date(subasta.fechaInicio[0], subasta.fechaInicio[1]-1, subasta.fechaInicio[2], subasta.fechaInicio[3], subasta.fechaInicio[4])
      : new Date(subasta.fechaInicio);
      
    const fechaFin = Array.isArray(subasta.fechaFin)
      ? new Date(subasta.fechaFin[0], subasta.fechaFin[1]-1, subasta.fechaFin[2], subasta.fechaFin[3], subasta.fechaFin[4])
      : new Date(subasta.fechaFin);
    
    return subasta.estado === 'ACTIVA' && now >= fechaInicio && now <= fechaFin;
  } catch (error) {
    console.error('Error al verificar si la subasta está activa:', error);
    return false;
  }
}; 