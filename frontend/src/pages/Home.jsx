import React, { useState, useEffect } from 'react';
import { Row, Col, Alert, Spinner, Form, InputGroup, Badge } from 'react-bootstrap';
import SubastaExpandible from '../components/SubastaExpandible';
import websocketService from '../services/websocketService';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [subastas, setSubastas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const { isAuthenticated, user } = useAuth();
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    // Solo conectar al WebSocket si el usuario está autenticado
    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      
      // Conectar al WebSocket
      websocketService.connect(token)
        .then(() => {
          setWsConnected(true);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error al conectar WebSocket:', error);
          setError('No se pudo establecer la conexión en tiempo real. Inténtalo de nuevo más tarde.');
          setLoading(false);
        });
      
      // Manejar mensajes recibidos
      const handleMessage = (data) => {
        if (data.tipo === 'subastas_activas') {
          setSubastas(data.subastas || []);
          setLoading(false);
        }
      };
      
      // Registrar manejador de mensajes
      const removeHandler = websocketService.addMessageHandler(handleMessage);
      
      // Limpiar al desmontar
      return () => {
        removeHandler();
        websocketService.disconnect();
        setWsConnected(false);
      };
    } else {
      // Si no está autenticado, mostrar mensaje
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Filtrar subastas según los criterios
  const filteredSubastas = subastas.filter(subasta => {
    // Filtrar por término de búsqueda
    const matchesSearch = searchTerm === '' || 
      subasta.id.toString().includes(searchTerm) ||
      (subasta.vendedor?.usuario?.nombre && 
        subasta.vendedor.usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtrar por estado
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && subasta.estado === 'ACTIVA') ||
      (filter === 'finished' && subasta.estado === 'FINALIZADA');
    
    return matchesSearch && matchesFilter;
  });

  // Ordenar subastas: primero las activas, luego las finalizadas
  const sortedSubastas = [...filteredSubastas].sort((a, b) => {
    // Si una está activa y la otra no, la activa va primero
    if (a.estado === 'ACTIVA' && b.estado !== 'ACTIVA') return -1;
    if (a.estado !== 'ACTIVA' && b.estado === 'ACTIVA') return 1;
    
    // Si ambas tienen el mismo estado, ordenar por ID (más reciente primero)
    return b.id - a.id;
  });

  return (
    <div>
      <h1 className="mb-4">Subastas de Vehículos</h1>
      
      {!isAuthenticated ? (
        <Alert variant="info" className="mb-4">
          <Alert.Heading>¡Bienvenido al Sistema de Subastas!</Alert.Heading>
          <p>
            Para participar en las subastas, necesitas iniciar sesión o registrarte.
            Una vez autenticado, podrás ver los detalles de las subastas y realizar pujas.
          </p>
        </Alert>
      ) : (
        <>
          {wsConnected ? (
            <Badge bg="success" className="mb-3">
              <i className="fas fa-wifi me-1"></i> Conectado en tiempo real
            </Badge>
          ) : (
            <Badge bg="danger" className="mb-3">
              <i className="fas fa-exclamation-triangle me-1"></i> Sin conexión en tiempo real
            </Badge>
          )}
          
          <Row className="mb-4">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="fas fa-search"></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por ID o vendedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <Form.Select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Todas las subastas</option>
                <option value="active">Subastas activas</option>
                <option value="finished">Subastas finalizadas</option>
              </Form.Select>
            </Col>
          </Row>
        </>
      )}
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-2">Cargando subastas...</p>
        </div>
      ) : !isAuthenticated ? (
        <Alert variant="warning">
          Inicia sesión para ver las subastas disponibles.
        </Alert>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : sortedSubastas.length === 0 ? (
        <Alert variant="warning">
          No se encontraron subastas que coincidan con los criterios de búsqueda.
        </Alert>
      ) : (
        <Row>
          {sortedSubastas.map(subasta => (
            <Col key={subasta.id} md={12} className="mb-4">
              <SubastaExpandible subasta={subasta} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Home; 