import React from 'react';
import { ListGroup, Badge } from 'react-bootstrap';
import { formatDate } from '../utils/dateUtils';

const PujasList = ({ pujas, subastaFinalizada }) => {
  if (!pujas || pujas.length === 0) {
    return (
      <div className="text-center p-3">
        <p className="text-muted">No hay pujas realizadas todavía</p>
      </div>
    );
  }

  // Función para formatear la fecha de la puja
  const formatearFechaPuja = (fechaPuja) => {
    if (!fechaPuja) return '';
    
    try {
      // Si es un array [año, mes, día, hora, minuto]
      if (Array.isArray(fechaPuja)) {
        return formatDate(new Date(fechaPuja[0], fechaPuja[1]-1, fechaPuja[2], fechaPuja[3], fechaPuja[4]));
      }
      
      // Si es una cadena de fecha
      return formatDate(new Date(fechaPuja));
    } catch (error) {
      console.error('Error al formatear fecha de puja:', error);
      return 'Fecha no disponible';
    }
  };

  // Función para obtener el nombre del comprador
  const getNombreComprador = (puja) => {
    // Si es un objeto comprador con usuario
    if (puja.comprador && puja.comprador.usuario) {
      return puja.comprador.usuario.nombre;
    }
    
    // Si es solo el email del comprador
    if (typeof puja.comprador === 'string') {
      return puja.comprador;
    }
    
    return 'Usuario';
  };

  // Filtrar pujas para mostrar solo la puja más alta de cada usuario
  const pujasFiltradas = pujas.reduce((acc, puja) => {
    const nombreComprador = getNombreComprador(puja);
    
    // Si no existe una puja de este comprador o la puja actual es mayor, la guardamos
    if (!acc[nombreComprador] || puja.monto > acc[nombreComprador].monto) {
      acc[nombreComprador] = puja;
    }
    
    return acc;
  }, {});
  
  // Convertir el objeto a array y ordenar por monto (de mayor a menor)
  const pujasSorted = Object.values(pujasFiltradas).sort((a, b) => b.monto - a.monto);

  return (
    <div className="puja-list">
      <ListGroup variant="flush">
        {pujasSorted.map((puja, index) => (
          <ListGroup.Item 
            key={puja.id || index} 
            className={`puja-item ${puja.isNew ? 'new-bid' : ''}`}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="fw-bold">
                  {getNombreComprador(puja)}
                  {index === 0 && (
                    <Badge bg="success" pill className="ms-2">
                      {subastaFinalizada ? (
                        <><i className="fas fa-crown me-1"></i> Ganador</>
                      ) : (
                        'Mayor puja'
                      )}
                    </Badge>
                  )}
                </div>
                <small className="text-muted">
                  {formatearFechaPuja(puja.fechaPuja)}
                </small>
              </div>
              <span className="puja-monto">
                {index === 0 && subastaFinalizada ? (
                  <span style={{ color: 'gold' }}>
                    <i className="fas fa-crown me-1"></i>
                  </span>
                ) : null}
                ${puja.monto.toFixed(2)}
              </span>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
      
      <div className="text-center mt-3">
        <small className="text-muted">
          Total de usuarios que han pujado: {pujasSorted.length}
        </small>
      </div>
    </div>
  );
};

export default PujasList; 