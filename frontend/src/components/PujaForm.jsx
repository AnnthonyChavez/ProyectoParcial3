import React, { useState } from 'react';
import { Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import subastaService from '../services/subastaService';
import websocketService from '../services/websocketService';

const PujaForm = ({ subastaId, precioBase, pujaMaxima }) => {
  const [monto, setMonto] = useState(pujaMaxima ? (pujaMaxima * 1.05).toFixed(2) : precioBase);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { isAuthenticated } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Debes iniciar sesión para realizar una puja');
      return;
    }
    
    if (!monto || isNaN(monto) || parseFloat(monto) <= 0) {
      setError('Por favor, ingresa un monto válido');
      return;
    }
    
    if (parseFloat(monto) <= pujaMaxima) {
      setError(`Tu puja debe ser mayor que la puja actual (${pujaMaxima.toFixed(2)})`);
      return;
    }
    
    if (parseFloat(monto) < precioBase) {
      setError(`Tu puja debe ser al menos el precio base (${precioBase.toFixed(2)})`);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Intentar primero con WebSocket si está disponible
      if (websocketService.isConnected()) {
        console.log('Enviando puja por WebSocket:', {
          subastaId,
          monto: parseFloat(monto)
        });
        
        websocketService.realizarPuja(subastaId, parseFloat(monto));
        setSuccess('Puja enviada correctamente');
      } else {
        // Fallback a API REST
        const response = await subastaService.realizarPuja(subastaId, parseFloat(monto));
        if (response.success) {
          setSuccess('Puja realizada correctamente');
        } else {
          setError(response.message || 'No se pudo realizar la puja');
        }
      }
      
      // Sugerir un nuevo monto para la próxima puja (5% más)
      setMonto((parseFloat(monto) * 1.05).toFixed(2));
    } catch (error) {
      console.error('Error al realizar puja:', error);
      setError('Error al realizar la puja. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleMontoChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setMonto(value);
    }
  };

  return (
    <div>
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      {success && <Alert variant="success" className="mb-3">{success}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Monto de la Puja</Form.Label>
          <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control
              type="text"
              value={monto}
              onChange={handleMontoChange}
              placeholder="Ingresa el monto de tu puja"
              required
            />
          </InputGroup>
          <Form.Text className="text-muted">
            {pujaMaxima > 0 ? (
              <>La puja actual más alta es de ${pujaMaxima.toFixed(2)}. Tu puja debe ser mayor.</>
            ) : (
              <>El precio base es ${precioBase.toFixed(2)}. Tu puja debe ser al menos este valor.</>
            )}
          </Form.Text>
        </Form.Group>
        
        <div className="d-grid">
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading || !isAuthenticated}
            className="pulse"
          >
            {loading ? 'Enviando...' : 'Realizar Puja'}
          </Button>
        </div>
      </Form>
      
      <div className="mt-3 small">
        <p className="mb-1"><strong>Información importante:</strong></p>
        <ul className="ps-3">
          <li>Las pujas son vinculantes y no pueden ser canceladas.</li>
          <li>Si ganas la subasta, deberás completar la compra del vehículo.</li>
          <li>Recibirás una notificación si tu puja es superada.</li>
        </ul>
      </div>
    </div>
  );
};

export default PujaForm; 