import React from 'react';
import { Card, Badge, ListGroup, Button } from 'react-bootstrap';

const VehiculoCard = ({ vehiculo, pujaMaxima, onSelect, isSelected }) => {
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
      <div className="text-center p-4 bg-light" style={{ fontSize: '4rem', color: isSelected ? '#28a745' : '#007bff' }}>
        <i className="fas fa-car"></i>
      </div>
    );
  };

  return (
    <Card className={`mb-3 ${isSelected ? 'border-success' : ''}`}>
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
          {pujaMaxima > 0 && (
            <ListGroup.Item className="text-success">
              <strong>Puja Actual:</strong> ${pujaMaxima.toFixed(2)}
            </ListGroup.Item>
          )}
        </ListGroup>
        
        {onSelect && (
          <div className="d-grid gap-2 mt-3">
            <Button 
              variant={isSelected ? "success" : "outline-primary"} 
              onClick={() => onSelect(vehiculo.id)}
            >
              {isSelected ? 'Seleccionado' : 'Seleccionar para Pujar'}
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default VehiculoCard; 