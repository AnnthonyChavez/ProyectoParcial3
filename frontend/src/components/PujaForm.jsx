import React, { useState, useEffect } from 'react';
import { Form, Button, InputGroup, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import subastaService from '../services/subastaService';
import websocketService from '../services/websocketService';

const PujaForm = ({ 
  subastaId, 
  precioBase, 
  pujaMaxima, 
  vehiculos = [], 
  selectedVehiculo = '',
  wsError = '',
  onClearError = () => {}
}) => {
  const [monto, setMonto] = useState(pujaMaxima ? (pujaMaxima * 1.05).toFixed(2) : precioBase);
  const [selectedVehiculoState, setSelectedVehiculoState] = useState(selectedVehiculo || (vehiculos.length > 0 ? vehiculos[0].vehiculo.id : ''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { isAuthenticated } = useAuth();

  // Actualizar el vehículo seleccionado cuando cambia la prop
  useEffect(() => {
    if (selectedVehiculo) {
      setSelectedVehiculoState(selectedVehiculo);
      
      // Actualizar el monto sugerido basado en el vehículo seleccionado
      const vehiculo = vehiculos.find(v => v.vehiculo.id === parseInt(selectedVehiculo));
      if (vehiculo) {
        const vehiculoPujaMaxima = getSelectedVehiculoPujaMaxima();
        setMonto((vehiculoPujaMaxima * 1.05).toFixed(2));
      }
    }
  }, [selectedVehiculo, vehiculos]);

  // Manejar errores del WebSocket
  useEffect(() => {
    if (wsError) {
      setError(wsError);
      // Si hay un error, limpiar cualquier mensaje de éxito
      setSuccess('');
      // Limpiar el error después de mostrarlo
      setTimeout(() => {
        setError('');
        onClearError();
      }, 5000);
    }
  }, [wsError, onClearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Limpiar mensajes anteriores
    setError('');
    setSuccess('');
    
    if (!isAuthenticated) {
      setError('Debes iniciar sesión para realizar una puja');
      return;
    }
    
    if (!monto || isNaN(monto) || parseFloat(monto) <= 0) {
      setError('Por favor, ingresa un monto válido');
      return;
    }
    
    if (!selectedVehiculoState) {
      setError('Por favor, selecciona un vehículo para la puja');
      return;
    }
    
    // Obtener el vehículo seleccionado
    const vehiculoSeleccionado = vehiculos.find(v => v.vehiculo.id === parseInt(selectedVehiculoState));
    if (!vehiculoSeleccionado) {
      setError('El vehículo seleccionado no es válido');
      return;
    }
    
    // Verificar que la puja sea mayor que la puja máxima del vehículo seleccionado
    const vehiculoPujaMaxima = vehiculoSeleccionado.pujaMaxima || vehiculoSeleccionado.vehiculo.precioBase;
    if (parseFloat(monto) <= vehiculoPujaMaxima) {
      const vehiculoInfo = `${vehiculoSeleccionado.vehiculo.marca} ${vehiculoSeleccionado.vehiculo.modelo}`;
      setError(`Tu puja para ${vehiculoInfo} debe ser mayor que la puja actual ($${vehiculoPujaMaxima.toFixed(2)})`);
      return;
    }
    
    if (parseFloat(monto) < vehiculoSeleccionado.vehiculo.precioBase) {
      const vehiculoInfo = `${vehiculoSeleccionado.vehiculo.marca} ${vehiculoSeleccionado.vehiculo.modelo}`;
      setError(`Tu puja para ${vehiculoInfo} debe ser al menos el precio base ($${vehiculoSeleccionado.vehiculo.precioBase.toFixed(2)})`);
      return;
    }
    
    try {
      setLoading(true);
      
      // Obtener información del vehículo para mensajes de error más claros
      const vehiculoInfo = vehiculoSeleccionado ? 
        `${vehiculoSeleccionado.vehiculo.marca} ${vehiculoSeleccionado.vehiculo.modelo}` : 
        'vehículo seleccionado';
      
      // Intentar primero con WebSocket si está disponible
      if (websocketService.isConnected()) {
        console.log('Enviando puja por WebSocket:', {
          subastaId,
          vehiculoId: parseInt(selectedVehiculoState),
          monto: parseFloat(monto)
        });
        
        // Mostrar mensaje de espera solo si no hay errores
        if (!error) {
          setSuccess(`Enviando puja para ${vehiculoInfo}...`);
        }
        
        // Enviar la puja
        websocketService.realizarPuja(subastaId, parseFloat(monto), parseInt(selectedVehiculoState));
        
        // Esperar un poco para dar tiempo a que el servidor procese la puja
        setTimeout(() => {
          // Si no hay error después de 2 segundos, asumir que la puja fue exitosa
          if (!error) {
            setSuccess(`Puja para ${vehiculoInfo} enviada correctamente`);
            // Sugerir un nuevo monto para la próxima puja (5% más)
            setMonto((parseFloat(monto) * 1.05).toFixed(2));
          }
          setLoading(false);
        }, 2000);
      } else {
        // Fallback a API REST
        const response = await subastaService.realizarPuja(subastaId, parseFloat(monto), parseInt(selectedVehiculoState));
        if (response.success) {
          // Solo mostrar mensaje de éxito si no hay errores
          if (!error) {
            setSuccess(`Puja para ${vehiculoInfo} realizada correctamente`);
            // Sugerir un nuevo monto para la próxima puja (5% más)
            setMonto((parseFloat(monto) * 1.05).toFixed(2));
          }
        } else {
          setError(response.message || `No se pudo realizar la puja para ${vehiculoInfo}`);
          // Si hay un error, limpiar cualquier mensaje de éxito
          setSuccess('');
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error al realizar puja:', error);
      setError('Error al realizar la puja. Inténtalo de nuevo.');
      // Si hay un error, limpiar cualquier mensaje de éxito
      setSuccess('');
      setLoading(false);
    }
  };

  const handleMontoChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setMonto(value);
    }
  };

  const handleVehiculoChange = (e) => {
    const vehiculoId = e.target.value;
    setSelectedVehiculoState(vehiculoId);
    
    // Actualizar el monto sugerido basado en el vehículo seleccionado
    if (vehiculoId) {
      const vehiculo = vehiculos.find(v => v.vehiculo.id === parseInt(vehiculoId));
      if (vehiculo) {
        const vehiculoPujaMaxima = vehiculo.pujaMaxima || vehiculo.vehiculo.precioBase;
        setMonto((vehiculoPujaMaxima * 1.05).toFixed(2));
      }
    }
  };

  // Obtener la puja máxima para el vehículo seleccionado
  const getSelectedVehiculoPujaMaxima = () => {
    if (!selectedVehiculoState) return 0;
    
    const vehiculo = vehiculos.find(v => v.vehiculo.id === parseInt(selectedVehiculoState));
    if (!vehiculo) return 0;
    
    return vehiculo.pujaMaxima || vehiculo.vehiculo.precioBase;
  };

  // Obtener el precio base para el vehículo seleccionado
  const getSelectedVehiculoPrecioBase = () => {
    if (!selectedVehiculoState) return 0;
    
    const vehiculo = vehiculos.find(v => v.vehiculo.id === parseInt(selectedVehiculoState));
    if (!vehiculo) return 0;
    
    return vehiculo.vehiculo.precioBase;
  };

  const selectedVehiculoPujaMaxima = getSelectedVehiculoPujaMaxima();
  const selectedVehiculoPrecioBase = getSelectedVehiculoPrecioBase();

  return (
    <div>
      {error ? (
        <Alert variant="danger" className="mb-3">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </Alert>
      ) : success ? (
        <Alert variant="success" className="mb-3">
          <i className="fas fa-check-circle me-2"></i>
          {success}
        </Alert>
      ) : null}
      
      <Form onSubmit={handleSubmit}>
        {vehiculos.length > 1 && !selectedVehiculo && (
          <Form.Group className="mb-3">
            <Form.Label>Selecciona un Vehículo</Form.Label>
            <Form.Select 
              value={selectedVehiculoState} 
              onChange={handleVehiculoChange}
              required
            >
              <option value="">Selecciona un vehículo</option>
              {vehiculos.map(item => (
                <option key={item.vehiculo.id} value={item.vehiculo.id}>
                  {item.vehiculo.marca} {item.vehiculo.modelo} ({item.vehiculo.anio}) - Precio Base: ${item.vehiculo.precioBase.toFixed(2)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        )}
        
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
            {selectedVehiculoState && (
              <>
                {(() => {
                  const vehiculo = vehiculos.find(v => v.vehiculo.id === parseInt(selectedVehiculoState))?.vehiculo;
                  if (!vehiculo) return null;
                  
                  const vehiculoInfo = `${vehiculo.marca} ${vehiculo.modelo}`;
                  
                  if (selectedVehiculoPujaMaxima > selectedVehiculoPrecioBase) {
                    return `La puja actual más alta para ${vehiculoInfo} es de $${selectedVehiculoPujaMaxima.toFixed(2)}. Tu puja debe ser mayor.`;
                  } else {
                    return `El precio base para ${vehiculoInfo} es $${selectedVehiculoPrecioBase.toFixed(2)}. Tu puja debe ser al menos este valor.`;
                  }
                })()}
              </>
            )}
          </Form.Text>
        </Form.Group>
        
        <div className="d-grid">
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading || !isAuthenticated || !selectedVehiculoState}
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