import React, { useState } from 'react';
import { ListGroup, Badge, Tabs, Tab, Alert } from 'react-bootstrap';
import { formatDate } from '../utils/dateUtils';

const PujasList = ({ pujas, subastaFinalizada, vehiculos }) => {
  const [activeTab, setActiveTab] = useState('todos');

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

  // Función para obtener el ID del vehículo de una puja
  const getVehiculoIdFromPuja = (puja) => {
    // Si la puja tiene directamente el ID del vehículo
    if (puja.vehiculoId) {
      return puja.vehiculoId.toString();
    }
    
    // Si la puja tiene la relación subastaVehiculo con el vehículo
    if (puja.subastaVehiculo && puja.subastaVehiculo.vehiculo && puja.subastaVehiculo.vehiculo.id) {
      return puja.subastaVehiculo.vehiculo.id.toString();
    }
    
    // Si la puja tiene el ID de subastaVehiculo pero no el objeto completo
    if (puja.subastaVehiculo && puja.subastaVehiculo.id) {
      // Intentar encontrar el vehículo correspondiente en la lista de vehículos
      const vehiculoEncontrado = vehiculos.find(v => v.id === puja.subastaVehiculo.id);
      if (vehiculoEncontrado && vehiculoEncontrado.vehiculo) {
        return vehiculoEncontrado.vehiculo.id.toString();
      }
    }
    
    // Si no se puede determinar el vehículo, usar el primer vehículo disponible
    if (vehiculos && vehiculos.length > 0 && vehiculos[0].vehiculo) {
      return vehiculos[0].vehiculo.id.toString();
    }
    
    return 'todos'; // Si no se puede determinar, mostrar en la pestaña "Todos"
  };

  // Agrupar pujas por vehículo
  const pujasPorVehiculo = pujas.reduce((acc, puja) => {
    const vehiculoId = getVehiculoIdFromPuja(puja);
    
    // Inicializar el array para este vehículo si no existe
    if (!acc[vehiculoId]) {
      acc[vehiculoId] = [];
    }
    
    // Añadir la puja al array de este vehículo
    acc[vehiculoId].push(puja);
    
    return acc;
  }, {});

  // Filtrar pujas para mostrar solo la puja más alta de cada usuario por vehículo
  const pujasFiltradas = {};
  
  Object.keys(pujasPorVehiculo).forEach(vehiculoId => {
    pujasFiltradas[vehiculoId] = pujasPorVehiculo[vehiculoId].reduce((acc, puja) => {
      const nombreComprador = getNombreComprador(puja);
      
      // Si no existe una puja de este comprador o la puja actual es mayor, la guardamos
      if (!acc[nombreComprador] || puja.monto > acc[nombreComprador].monto) {
        acc[nombreComprador] = puja;
      }
      
      return acc;
    }, {});
  });
  
  // Convertir los objetos a arrays y ordenar por monto (de mayor a menor)
  const pujasSorted = {};
  Object.keys(pujasFiltradas).forEach(vehiculoId => {
    pujasSorted[vehiculoId] = Object.values(pujasFiltradas[vehiculoId]).sort((a, b) => b.monto - a.monto);
  });

  // Obtener todas las pujas ordenadas (para la pestaña "Todos")
  const todasPujasFiltradas = {};
  
  // Para la pestaña "Todos", queremos mostrar la puja más alta de cada comprador para cada vehículo
  pujas.forEach(puja => {
    const nombreComprador = getNombreComprador(puja);
    const vehiculoId = getVehiculoIdFromPuja(puja);
    
    // Crear una clave única que combine el comprador y el vehículo
    const claveUnica = `${nombreComprador}-${vehiculoId}`;
    
    // Si no existe una puja para esta combinación o la puja actual es mayor, la guardamos
    if (!todasPujasFiltradas[claveUnica] || puja.monto > todasPujasFiltradas[claveUnica].monto) {
      todasPujasFiltradas[claveUnica] = puja;
    }
  });
  
  const todasPujasSorted = Object.values(todasPujasFiltradas).sort((a, b) => b.monto - a.monto);

  // Función para renderizar la lista de pujas
  const renderPujasList = (pujasList, isAllTab = false) => {
    // Si es la pestaña "Todos", agrupar las pujas por vehículo para identificar la más alta de cada uno
    let pujasAltasPorVehiculo = {};
    
    if (isAllTab) {
      // Agrupar pujas por vehículo
      const pujasPorVehiculo = pujasList.reduce((acc, puja) => {
        const vehiculoId = getVehiculoIdFromPuja(puja);
        if (!acc[vehiculoId]) {
          acc[vehiculoId] = [];
        }
        acc[vehiculoId].push(puja);
        return acc;
      }, {});
      
      // Encontrar la puja más alta para cada vehículo
      Object.keys(pujasPorVehiculo).forEach(vehiculoId => {
        const pujasVehiculo = pujasPorVehiculo[vehiculoId];
        if (pujasVehiculo.length > 0) {
          const pujaMaxima = pujasVehiculo.reduce((max, puja) => 
            puja.monto > max.monto ? puja : max, pujasVehiculo[0]);
          pujasAltasPorVehiculo[vehiculoId] = pujaMaxima;
        }
      });
    }
    
    return (
      <ListGroup variant="flush">
        {pujasList.map((puja, index) => {
          const vehiculoId = getVehiculoIdFromPuja(puja);
          const esPujaMasAlta = isAllTab 
            ? pujasAltasPorVehiculo[vehiculoId] && pujasAltasPorVehiculo[vehiculoId].monto === puja.monto
            : index === 0;
            
          return (
            <ListGroup.Item 
              key={puja.id || index} 
              className={`puja-item ${puja.isNew ? 'new-bid' : ''}`}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="fw-bold">
                    {getNombreComprador(puja)}
                    {esPujaMasAlta && (
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
                  {getVehiculoInfo(getVehiculoIdFromPuja(puja)) !== 'Todos' && (
                    <small className="d-block text-info">
                      {getVehiculoInfo(getVehiculoIdFromPuja(puja))}
                    </small>
                  )}
                </div>
                <span className="puja-monto">
                  {esPujaMasAlta && subastaFinalizada ? (
                    <span style={{ color: 'gold' }}>
                      <i className="fas fa-crown me-1"></i>
                    </span>
                  ) : null}
                  ${puja.monto.toFixed(2)}
                </span>
              </div>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    );
  };

  // Obtener información de los vehículos para las pestañas
  const getVehiculoInfo = (vehiculoId) => {
    if (vehiculoId === 'todos') return 'Todos';
    
    // Buscar primero en la lista de vehículos proporcionada
    if (vehiculos && vehiculos.length > 0) {
      const vehiculoEncontrado = vehiculos.find(v => 
        v.vehiculo && v.vehiculo.id.toString() === vehiculoId
      );
      
      if (vehiculoEncontrado && vehiculoEncontrado.vehiculo) {
        return `${vehiculoEncontrado.vehiculo.marca} ${vehiculoEncontrado.vehiculo.modelo}`;
      }
    }
    
    // Si no se encuentra en la lista de vehículos, buscar en las pujas
    const vehiculoEnPuja = pujas.find(puja => 
      puja.subastaVehiculo?.vehiculo?.id.toString() === vehiculoId
    )?.subastaVehiculo?.vehiculo;
    
    if (vehiculoEnPuja) {
      return `${vehiculoEnPuja.marca} ${vehiculoEnPuja.modelo}`;
    }
    
    // Si aún no se encuentra, mostrar un ID genérico
    return `Vehículo #${vehiculoId}`;
  };

  // Eliminar la pestaña "desconocido" si existe y mover esas pujas a "todos"
  if (pujasPorVehiculo['desconocido']) {
    if (!pujasPorVehiculo['todos']) {
      pujasPorVehiculo['todos'] = [];
    }
    pujasPorVehiculo['todos'] = [...pujasPorVehiculo['todos'], ...pujasPorVehiculo['desconocido']];
    delete pujasPorVehiculo['desconocido'];
  }

  // Filtrar las pestañas para mostrar solo las que tienen vehículos válidos
  const tabsVehiculos = Object.keys(pujasPorVehiculo).filter(vehiculoId => 
    vehiculoId !== 'todos' && vehiculoId !== 'desconocido' && getVehiculoInfo(vehiculoId) !== `Vehículo #${vehiculoId}`
  );

  // Si solo hay un vehículo válido, mostrar directamente la lista sin pestañas
  if (tabsVehiculos.length === 0) {
    return (
      <div className="puja-list">
        {renderPujasList(todasPujasSorted, true)}
        
        <div className="text-center mt-3">
          <small className="text-muted">
            Total de usuarios que han pujado: {todasPujasSorted.length}
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className="puja-list">
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="todos" title="Todos">
          {renderPujasList(todasPujasSorted, true)}
          <div className="text-center mt-3">
            <small className="text-muted">
              Total de usuarios que han pujado: {todasPujasSorted.length}
            </small>
          </div>
        </Tab>
        
        {tabsVehiculos.map(vehiculoId => (
          <Tab 
            key={vehiculoId} 
            eventKey={vehiculoId} 
            title={getVehiculoInfo(vehiculoId)}
          >
            {pujasSorted[vehiculoId] && renderPujasList(pujasSorted[vehiculoId])}
            <div className="text-center mt-3">
              <small className="text-muted">
                Total de usuarios que han pujado: {pujasSorted[vehiculoId] ? pujasSorted[vehiculoId].length : 0}
              </small>
            </div>
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default PujasList; 