import React from 'react';
import { ListGroup, Badge } from 'react-bootstrap';

const ParticipantesList = ({ pujas }) => {
  // Extraer participantes únicos de las pujas
  const participantes = pujas.reduce((acc, puja) => {
    const email = puja.comprador?.usuario?.email || puja.comprador;
    if (!acc.some(p => p.email === email)) {
      acc.push({
        email,
        nombre: puja.comprador?.usuario?.nombre || 'Usuario',
        pujasCount: 1,
        montoMaximo: puja.monto
      });
    } else {
      const participante = acc.find(p => p.email === email);
      participante.pujasCount += 1;
      participante.montoMaximo = Math.max(participante.montoMaximo, puja.monto);
    }
    return acc;
  }, []);

  // Ordenar por monto máximo (de mayor a menor)
  participantes.sort((a, b) => b.montoMaximo - a.montoMaximo);

  if (participantes.length === 0) {
    return (
      <div className="text-center p-3">
        <p className="text-muted">No hay participantes en esta subasta</p>
      </div>
    );
  }

  return (
    <div>
      <ListGroup variant="flush">
        {participantes.map((participante, index) => (
          <ListGroup.Item key={participante.email} className="d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-bold">
                {participante.nombre}
                {index === 0 && (
                  <Badge bg="warning" text="dark" pill className="ms-2">
                    Líder
                  </Badge>
                )}
              </div>
              <small className="text-muted">
                {participante.pujasCount} {participante.pujasCount === 1 ? 'puja' : 'pujas'}
              </small>
            </div>
            <Badge bg="primary" pill>
              ${participante.montoMaximo.toFixed(2)}
            </Badge>
          </ListGroup.Item>
        ))}
      </ListGroup>
      
      <div className="text-center mt-3">
        <small className="text-muted">
          Total de participantes: {participantes.length}
        </small>
      </div>
    </div>
  );
};

export default ParticipantesList; 