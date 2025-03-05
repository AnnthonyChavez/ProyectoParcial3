import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Row, Col, Collapse } from 'react-bootstrap';
import { formatDate, timeRemaining, isSubastaActive } from '../utils/dateUtils';
import PujaForm from './PujaForm';
import PujasList from './PujasList';
import VehiculoCard from './VehiculoCard';
import websocketService from '../services/websocketService';
import { useAuth } from '../context/AuthContext';

const SubastaExpandible = ({ subasta: subastaInicial }) => {
  const [subasta, setSubasta] = useState(subastaInicial);
  const [vehiculos, setVehiculos] = useState(subastaInicial.vehiculos || []);
  const [pujas, setPujas] = useState(subastaInicial.pujas || []);
  const [expanded, setExpanded] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const { isAuthenticated, user } = useAuth();
  
  const esActiva = isSubastaActive(subasta);
  
  // Solicitar información detallada de la subasta cuando se expande
  useEffect(() => {
    if (expanded && isAuthenticated) {
      websocketService.requestSubastaInfo(subasta.id);
      
      // Manejar mensajes recibidos
      const handleMessage = (data) => {
        console.log('Mensaje recibido en SubastaExpandible:', data);
        
        if (data.tipo === 'info_subasta' && data.subasta.id === subasta.id) {
          console.log('Recibida info de subasta:', data);
          setSubasta(data.subasta);
          setVehiculos(data.vehiculos || []);
          setPujas(data.pujas || []);
        } 
        else if (data.tipo === 'actualizacion_pujas') {
          const nuevasPujas = data.pujas.filter(p => p.subastaId === subasta.id);
          if (nuevasPujas.length > 0) {
            // Actualizar pujas con las nuevas
            setPujas(prevPujas => {
              const pujasActualizadas = [...prevPujas];
              nuevasPujas.forEach(nuevaPuja => {
                // Añadir clase para animación
                nuevaPuja.isNew = true;
                pujasActualizadas.push(nuevaPuja);
              });
              return pujasActualizadas.sort((a, b) => b.monto - a.monto);
            });
          }
        }
        else if (data.tipo === 'subasta_finalizada' && data.subastaId === subasta.id) {
          setSubasta(prev => ({
            ...prev,
            estado: 'FINALIZADA'
          }));
        }
      };
      
      // Registrar manejador de mensajes
      const removeHandler = websocketService.addMessageHandler(handleMessage);
      
      // Limpiar al desmontar
      return () => {
        removeHandler();
      };
    }
  }, [expanded, isAuthenticated, subasta.id]);
  
  // Actualizar tiempo restante
  useEffect(() => {
    if (!subasta || subasta.estado !== 'ACTIVA') return;
    
    const updateTimeLeft = () => {
      if (subasta.fechaFin) {
        const fechaFin = Array.isArray(subasta.fechaFin) 
          ? new Date(subasta.fechaFin[0], subasta.fechaFin[1]-1, subasta.fechaFin[2], subasta.fechaFin[3], subasta.fechaFin[4])
          : new Date(subasta.fechaFin);
        
        setTimeLeft(timeRemaining(fechaFin));
      }
    };
    
    updateTimeLeft();
    // Actualizar cada segundo para mostrar el cambio en tiempo real
    const interval = setInterval(updateTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, [subasta]);
  
  // Reemplazamos la función getVehiculoImage por un div con icono
  const renderAuctionIcon = () => {
    return (
      <div className="text-center p-4 bg-light" style={{ fontSize: '4rem', color: esActiva ? '#28a745' : '#6c757d' }}>
        <i className="fas fa-gavel"></i>
      </div>
    );
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    
    console.log('Formateando fecha en SubastaExpandible:', fecha);
    
    if (Array.isArray(fecha)) {
      // Si es un array [año, mes, día, hora, minuto]
      console.log('Fecha es array:', fecha);
      try {
        // Mes en JavaScript es 0-indexed
        const fechaObj = new Date(fecha[0], fecha[1]-1, fecha[2], fecha[3], fecha[4]);
        console.log('Fecha convertida:', fechaObj);
        return formatDate(fechaObj);
      } catch (error) {
        console.error('Error al formatear fecha array:', error);
        return 'Error en formato de fecha';
      }
    } else if (typeof fecha === 'string') {
      // Si es un string en formato ISO
      console.log('Fecha es string:', fecha);
      try {
        // Extraer componentes de la fecha manualmente para evitar problemas de zona horaria
        const match = fecha.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
        if (match) {
          const [_, año, mes, dia, hora, minutos] = match;
          const fechaObj = new Date(
            parseInt(año),
            parseInt(mes) - 1, // Mes en JavaScript es 0-indexed
            parseInt(dia),
            parseInt(hora),
            parseInt(minutos)
          );
          console.log('Fecha extraída manualmente:', fechaObj);
          return formatDate(fechaObj);
        } else {
          const fechaObj = new Date(fecha);
          console.log('Fecha parseada directamente:', fechaObj);
          return formatDate(fechaObj);
        }
      } catch (error) {
        console.error('Error al formatear fecha string:', error);
        return 'Error en formato de fecha';
      }
    } else {
      console.log('Formato de fecha desconocido:', typeof fecha);
      return 'Formato de fecha desconocido';
    }
  };

  // Obtener información de vehículos
  const getVehiculosInfo = () => {
    if (!vehiculos || vehiculos.length === 0) {
      return 'Sin vehículos';
    }
    
    // Verificar la estructura del vehículo
    const vehiculoItem = vehiculos[0];
    const vehiculo = vehiculoItem.vehiculo;
    
    if (vehiculo) {
      return `${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.anio})`;
    }
    
    return `${vehiculos.length} vehículos`;
  };

  // Obtener precio base y puja máxima
  const getPrecioBase = () => {
    if (vehiculos.length > 0 && vehiculos[0].vehiculo) {
      return vehiculos[0].vehiculo.precioBase;
    }
    return 0;
  };

  const getPujaMaxima = () => {
    if (pujas.length > 0) {
      return Math.max(...pujas.map(puja => puja.monto));
    }
    return getPrecioBase();
  };

  // Verificar si el usuario es el vendedor
  const isVendedor = () => {
    if (!user || !subasta || !subasta.vendedor) return false;
    return user.email === subasta.vendedor.usuario?.email;
  };

  return (
    <Card className={`subasta-card ${subasta.estado.toLowerCase()}`}>
      {renderAuctionIcon()}
      <Card.Body>
        <Card.Title>Subasta #{subasta.id}</Card.Title>
        
        <Card.Text>
          <strong>Vehículo:</strong> {getVehiculosInfo()}
        </Card.Text>
        
        <Card.Text>
          <strong>Vendedor:</strong> {subasta.vendedor?.usuario?.nombre || 'No disponible'}
        </Card.Text>
        
        <Card.Text>
          <strong>Precio actual:</strong> ${getPujaMaxima().toFixed(2)}
        </Card.Text>
        
        <Card.Text>
          <strong>Finaliza:</strong> {formatearFecha(subasta.fechaFin)}
        </Card.Text>
        
        {esActiva && (
          <div className="timer mb-3">
            <small>Tiempo restante:</small>
            <div className="pulse" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#dc3545' }}>
              <i className="fas fa-clock me-2"></i>
              {timeLeft}
            </div>
          </div>
        )}
        
        <div className="d-grid">
          <Button 
            variant={expanded ? "outline-primary" : "primary"}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Ocultar detalles' : (esActiva ? 'Participar en la subasta' : 'Ver detalles')}
          </Button>
        </div>
        
        <Collapse in={expanded}>
          <div className="mt-4">
            <Row>
              <Col md={6}>
                <h5>Vehículos en Subasta</h5>
                {vehiculos.length === 0 ? (
                  <p className="text-muted">No hay vehículos en esta subasta.</p>
                ) : (
                  vehiculos.map(item => (
                    <VehiculoCard key={item.id} vehiculo={item.vehiculo} />
                  ))
                )}
              </Col>
              
              <Col md={6}>
                <h5>Historial de Pujas</h5>
                <PujasList 
                  pujas={pujas} 
                  subastaFinalizada={subasta.estado === 'FINALIZADA'}
                />
              </Col>
            </Row>
            
            {isAuthenticated && esActiva && !isVendedor() && (
              <Card className="mt-4">
                <Card.Header>
                  <h5>Realizar Puja</h5>
                </Card.Header>
                <Card.Body>
                  <PujaForm 
                    subastaId={subasta.id} 
                    precioBase={getPrecioBase()} 
                    pujaMaxima={getPujaMaxima()} 
                  />
                </Card.Body>
              </Card>
            )}
          </div>
        </Collapse>
      </Card.Body>
    </Card>
  );
};

export default SubastaExpandible; 