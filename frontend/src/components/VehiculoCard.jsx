import React from 'react';
import { Card, Badge, ListGroup } from 'react-bootstrap';

const VehiculoCard = ({ vehiculo }) => {
  if (!vehiculo) {
    return (
      <Card className="mb-3">
        <Card.Body className="text-center">
          <p className="text-muted">Información del vehículo no disponible</p>
        </Card.Body>
      </Card>
    );
  }
  
  // Reemplazamos la función getCarImage por un div con icono
  const renderVehicleIcon = () => {
    return (
      <div className="text-center p-4 bg-light" style={{ fontSize: '4rem', color: '#007bff' }}>
        <i className="fas fa-car"></i>
      </div>
    );
  };

  return (
    <Card className="mb-3">
      {renderVehicleIcon()}
      <Card.Body>
        <Card.Title>{vehiculo.marca} {vehiculo.modelo}</Card.Title>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>Año:</strong> {vehiculo.anio}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Estado:</strong> <Badge bg={vehiculo.estado === 'DISPONIBLE' ? 'success' : 'secondary'}>{vehiculo.estado}</Badge>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Precio Base:</strong> ${vehiculo.precioBase?.toFixed(2) || '0.00'}
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default VehiculoCard; 