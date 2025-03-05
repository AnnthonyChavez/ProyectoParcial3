import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Alert, Spinner, Button } from 'react-bootstrap';
import PujaForm from '../components/PujaForm';
import PujasList from '../components/PujasList';
import VehiculoCard from '../components/VehiculoCard';
import ParticipantesList from '../components/ParticipantesList';
import { formatDate, timeRemaining, isSubastaActive } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';
import websocketService from '../services/websocketService';
import subastaService from '../services/subastaService';

const DetalleSubasta = () => {
  const { id } = useParams();
  const [subasta, setSubasta] = useState(null);
  const [vehiculos, setVehiculos] = useState([]);
  const [pujas, setPujas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Cargar datos iniciales
  useEffect(() => {
    const fetchSubastaDetails = async () => {
      try {
        setLoading(true);
        const subastaData = await subastaService.obtenerSubasta(id);
        setSubasta(subastaData);
        
        const vehiculosData = await subastaService.listarVehiculosEnSubasta(id);
        setVehiculos(vehiculosData);
        
        const pujasData = await subastaService.listarPujas(id);
        setPujas(pujasData);
      } catch (error) {
        console.error('Error al cargar detalles de la subasta:', error);
        setError('No se pudieron cargar los detalles de la subasta. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubastaDetails();
  }, [id]);

  // Conectar WebSocket
  useEffect(() => {
    if (isAuthenticated && subasta) {
      const token = localStorage.getItem('token');
      
      // Conectar al WebSocket
      websocketService.connect(token);
      setWsConnected(true);
      
      // Solicitar información específica de esta subasta
      websocketService.requestSubastaInfo(id);
      
      // Manejar mensajes recibidos
      const handleMessage = (data) => {
        if (data.tipo === 'info_subasta' && data.subasta.id === parseInt(id)) {
          setSubasta(data.subasta);
          setVehiculos(data.vehiculos || []);
          setPujas(data.pujas || []);
        } 
        else if (data.tipo === 'actualizacion_pujas') {
          const nuevasPujas = data.pujas.filter(p => p.subastaId === parseInt(id));
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
        else if (data.tipo === 'subasta_finalizada' && data.subastaId === parseInt(id)) {
          setSubasta(prev => ({
            ...prev,
            estado: 'FINALIZADA'
          }));
          setError(`La subasta ha finalizado. Ganador: ${data.ganador} con una puja de $${data.monto.toFixed(2)}`);
        }
        else if (data.tipo === 'subasta_finalizada_sin_pujas' && data.subastaId === parseInt(id)) {
          setSubasta(prev => ({
            ...prev,
            estado: 'FINALIZADA'
          }));
          setError('La subasta ha finalizado sin pujas. Los vehículos pueden ser subastados nuevamente.');
        }
      };
      
      websocketService.addMessageHandler(handleMessage);
      
      // Limpiar al desmontar
      return () => {
        websocketService.disconnect();
        setWsConnected(false);
      };
    }
  }, [isAuthenticated, id, subasta]);

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

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-2">Cargando detalles de la subasta...</p>
      </div>
    );
  }

  if (!subasta) {
    return (
      <Alert variant="danger">
        No se encontró la subasta solicitada o {error}
      </Alert>
    );
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    
    if (Array.isArray(fecha)) {
      return formatDate(new Date(fecha[0], fecha[1]-1, fecha[2], fecha[3], fecha[4]));
    }
    
    return formatDate(new Date(fecha));
  };

  const esSubastaActiva = isSubastaActive(subasta);

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Detalle de Subasta #{id}</h1>
        <Link to="/" className="btn btn-outline-secondary">
          <i className="fas fa-arrow-left me-2"></i>
          Volver
        </Link>
      </div>
      
      {error && <Alert variant="warning">{error}</Alert>}
      
      {!isAuthenticated && (
        <Alert variant="info" className="mb-4">
          <Alert.Heading>¡Necesitas iniciar sesión!</Alert.Heading>
          <p>
            Para participar en esta subasta, necesitas <Link to="/login">iniciar sesión</Link> o <Link to="/register">registrarte</Link>.
          </p>
        </Alert>
      )}
      
      {wsConnected ? (
        <Badge bg="success" className="mb-3">
          <i className="fas fa-wifi me-1"></i> Conectado en tiempo real
        </Badge>
      ) : (
        <Badge bg="danger" className="mb-3">
          <i className="fas fa-exclamation-triangle me-1"></i> Sin conexión en tiempo real
        </Badge>
      )}
      
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between">
              <h5>Información de la Subasta</h5>
              <Badge bg={subasta.estado === 'ACTIVA' ? 'success' : 'secondary'}>
                {subasta.estado}
              </Badge>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Vendedor:</strong> {subasta.vendedor?.usuario?.nombre || 'No disponible'}</p>
                  <p><strong>Fecha de inicio:</strong> {formatearFecha(subasta.fechaInicio)}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Estado:</strong> {subasta.estado}</p>
                  <p><strong>Fecha de fin:</strong> {formatearFecha(subasta.fechaFin)}</p>
                </Col>
              </Row>
              
              {esSubastaActiva && (
                <div className="timer text-center mt-3">
                  <h4>Tiempo restante</h4>
                  <div className="pulse" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                    <i className="fas fa-clock me-2"></i>
                    {timeLeft}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
          
          <h3 className="mb-3">Vehículos en Subasta</h3>
          {vehiculos.length === 0 ? (
            <Alert variant="warning">No hay vehículos en esta subasta.</Alert>
          ) : (
            <Row>
              {vehiculos.map(item => (
                <Col key={item.id} md={6} className="mb-3">
                  <VehiculoCard vehiculo={item.vehiculo} />
                </Col>
              ))}
            </Row>
          )}
          
          {isAuthenticated && esSubastaActiva && !isVendedor() && (
            <Card className="mt-4">
              <Card.Header>
                <h5>Realizar Puja</h5>
              </Card.Header>
              <Card.Body>
                <PujaForm 
                  subastaId={parseInt(id)} 
                  precioBase={getPrecioBase()} 
                  pujaMaxima={getPujaMaxima()} 
                />
              </Card.Body>
            </Card>
          )}
        </Col>
        
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Historial de Pujas</h5>
            </Card.Header>
            <Card.Body>
              <PujasList 
                pujas={pujas} 
                subastaFinalizada={subasta.estado === 'FINALIZADA'}
              />
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header>
              <h5>Participantes</h5>
            </Card.Header>
            <Card.Body>
              <ParticipantesList pujas={pujas} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DetalleSubasta; 