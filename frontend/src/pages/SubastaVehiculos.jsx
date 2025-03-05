import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Alert, Form, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import subastaService from '../services/subastaService';
import vehiculoService from '../services/vehiculoService';
import subastaVehiculoService from '../services/subastaVehiculoService';
import { formatDate } from '../utils/dateUtils';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const SubastaVehiculos = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [subasta, setSubasta] = useState(null);
  const [vehiculosEnSubasta, setVehiculosEnSubasta] = useState([]);
  const [vehiculosDisponibles, setVehiculosDisponibles] = useState([]);
  const [selectedVehiculo, setSelectedVehiculo] = useState('');
  const [todasLasSubastas, setTodasLasSubastas] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estado para el modal
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData();
    } else {
      setError('ID de subasta no proporcionado');
      setLoading(false);
    }
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Obteniendo datos para la subasta ID:', id);
      
      // Obtener vehículos asociados a la subasta
      const vehiculosSubastaData = await subastaVehiculoService.listarVehiculosEnSubasta(id);
      console.log('Vehículos en la subasta:', vehiculosSubastaData);
      setVehiculosEnSubasta(vehiculosSubastaData);
      
      // Extraer información de la subasta
      let subastaInfo = null;
      
      if (vehiculosSubastaData.length > 0 && vehiculosSubastaData[0].subasta) {
        // Si hay vehículos, tomar la información de la subasta del primer vehículo
        subastaInfo = vehiculosSubastaData[0].subasta;
      } else {
        // Si no hay vehículos, intentar obtener la subasta directamente
        try {
          subastaInfo = await subastaService.obtenerSubasta(id);
        } catch (error) {
          console.error('Error al obtener la subasta:', error);
          // Crear un objeto mínimo con el ID
          subastaInfo = { id: id, estado: 'DESCONOCIDO' };
        }
      }
      
      console.log('Información de la subasta:', subastaInfo);
      setSubasta(subastaInfo);
      
      // Obtener todas las subastas para verificar vehículos en subastas activas
      const todasSubastasData = await subastaService.listarSubastas();
      console.log('Todas las subastas:', todasSubastasData);
      setTodasLasSubastas(todasSubastasData);
      
      // Obtener todos los vehículos-subasta para identificar vehículos en subastas activas
      const promesasVehiculosSubastas = todasSubastasData
        .filter(s => s.estado === 'ACTIVA' && s.id !== parseInt(id))
        .map(s => subastaVehiculoService.listarVehiculosEnSubasta(s.id));
      
      const resultadosVehiculosSubastas = await Promise.all(promesasVehiculosSubastas);
      
      // Aplanar el array de arrays
      const vehiculosEnSubastasActivas = resultadosVehiculosSubastas.flat();
      console.log('Vehículos en otras subastas activas:', vehiculosEnSubastasActivas);
      
      // IDs de vehículos que están en subastas activas
      const idsVehiculosEnSubastasActivas = vehiculosEnSubastasActivas.map(item => item.vehiculo.id);
      
      // Obtener vehículos disponibles del vendedor
      const vehiculosData = await vehiculoService.listarVehiculos();
      console.log('Todos los vehículos:', vehiculosData);
      
      // Filtrar vehículos que no están en la subasta actual
      const vehiculosIds = vehiculosSubastaData.map(item => item.vehiculo.id);
      
      // Filtrar vehículos disponibles:
      // 1. No deben estar en la subasta actual
      // 2. No deben estar en otras subastas activas
      // 3. Deben tener estado DISPONIBLE
      const vehiculosDisponiblesData = vehiculosData.filter(vehiculo => 
        !vehiculosIds.includes(vehiculo.id) && 
        !idsVehiculosEnSubastasActivas.includes(vehiculo.id) &&
        vehiculo.estado === 'DISPONIBLE'
      );
      
      console.log('Vehículos disponibles:', vehiculosDisponiblesData);
      setVehiculosDisponibles(vehiculosDisponiblesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setSelectedVehiculo('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleAgregarVehiculo = async () => {
    if (!selectedVehiculo) {
      toast.warning('Por favor, selecciona un vehículo');
      return;
    }
    
    setLoadingAction(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Asociando vehículo ID:', selectedVehiculo, 'a subasta ID:', id);
      await subastaVehiculoService.asociarVehiculoASubasta(id, selectedVehiculo);
      setSuccess('Vehículo agregado correctamente a la subasta');
      toast.success('Vehículo agregado correctamente a la subasta');
      handleCloseModal();
      fetchData(); // Recargar datos
    } catch (error) {
      console.error('Error al agregar vehículo:', error);
      setError('Error al agregar el vehículo. Por favor, intenta de nuevo.');
      toast.error('Error al agregar el vehículo');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRemoverVehiculo = async (asociacionId) => {
    if (!window.confirm('¿Estás seguro de que deseas remover este vehículo de la subasta?')) {
      return;
    }
    
    setLoadingAction(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Eliminando asociación ID:', asociacionId);
      await subastaVehiculoService.eliminarAsociacion(asociacionId);
      setSuccess('Vehículo removido correctamente de la subasta');
      toast.success('Vehículo removido correctamente de la subasta');
      fetchData(); // Recargar datos
    } catch (error) {
      console.error('Error al remover vehículo:', error);
      setError('Error al remover el vehículo. Por favor, intenta de nuevo.');
      toast.error('Error al remover el vehículo');
    } finally {
      setLoadingAction(false);
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    
    console.log('Formateando fecha:', fecha);
    
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

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="mb-4">
        <Card.Header as="h4" className="d-flex justify-content-between align-items-center">
          <span>Gestión de Vehículos en Subasta #{id}</span>
          <Button variant="secondary" onClick={() => navigate('/subastas')}>
            Volver a Subastas
          </Button>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {subasta && (
            <Row className="mb-4">
              <Col md={6}>
                <h5>Detalles de la Subasta</h5>
                <p><strong>ID:</strong> {subasta.id}</p>
                {subasta.fechaInicio && (
                  <p><strong>Fecha de Inicio:</strong> {formatearFecha(subasta.fechaInicio)}</p>
                )}
                {subasta.fechaFin && (
                  <p><strong>Fecha de Fin:</strong> {formatearFecha(subasta.fechaFin)}</p>
                )}
                <p>
                  <strong>Estado:</strong>{' '}
                  <Badge bg={
                    subasta.estado === 'ACTIVA' ? 'success' : 
                    subasta.estado === 'PENDIENTE' ? 'warning' : 
                    subasta.estado === 'FINALIZADA' ? 'danger' : 'secondary'
                  }>
                    {subasta.estado}
                  </Badge>
                </p>
              </Col>
              <Col md={6} className="text-md-end">
                <Button 
                  variant="primary" 
                  onClick={handleOpenModal}
                  disabled={vehiculosDisponibles.length === 0 || subasta.estado === 'FINALIZADA'}
                >
                  <i className="fas fa-plus me-2"></i>
                  Agregar Vehículo
                </Button>
                {vehiculosDisponibles.length === 0 && (
                  <p className="text-muted mt-2">
                    <small>No tienes vehículos disponibles para agregar</small>
                  </p>
                )}
                {subasta.estado === 'FINALIZADA' && (
                  <p className="text-muted mt-2">
                    <small>No se pueden agregar vehículos a subastas finalizadas</small>
                  </p>
                )}
              </Col>
            </Row>
          )}

          <h5 className="mb-3">Vehículos en esta Subasta</h5>
          
          {vehiculosEnSubasta.length === 0 ? (
            <Alert variant="info">
              No hay vehículos asociados a esta subasta. Agrega vehículos para que los compradores puedan pujar por ellos.
            </Alert>
          ) : (
            <Table responsive striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Año</th>
                  <th>Precio Base</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vehiculosEnSubasta.map((item) => (
                  <tr key={item.id}>
                    <td>{item.vehiculo.id}</td>
                    <td>{item.vehiculo.marca}</td>
                    <td>{item.vehiculo.modelo}</td>
                    <td>{item.vehiculo.anio}</td>
                    <td>${item.vehiculo.precioBase.toLocaleString('es-ES')}</td>
                    <td>
                      <Badge bg={
                        item.vehiculo.estado === 'DISPONIBLE' ? 'success' : 
                        item.vehiculo.estado === 'VENDIDO' ? 'info' : 'secondary'
                      }>
                        {item.vehiculo.estado}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoverVehiculo(item.id)}
                        disabled={subasta && subasta.estado === 'FINALIZADA' || loadingAction}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal para agregar vehículo */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Vehículo a la Subasta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {vehiculosDisponibles.length === 0 ? (
            <Alert variant="info">
              No tienes vehículos disponibles para agregar a esta subasta. 
              <br />
              <Link to="/vehiculos/crear" className="alert-link">Crea un nuevo vehículo</Link> o libera alguno de otra subasta.
            </Alert>
          ) : (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Selecciona un Vehículo</Form.Label>
                <Form.Select
                  value={selectedVehiculo}
                  onChange={(e) => setSelectedVehiculo(e.target.value)}
                >
                  <option value="">-- Selecciona un vehículo --</option>
                  {vehiculosDisponibles.map((vehiculo) => (
                    <option key={vehiculo.id} value={vehiculo.id}>
                      {vehiculo.marca} {vehiculo.modelo} ({vehiculo.anio}) - ${vehiculo.precioBase.toLocaleString('es-ES')}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAgregarVehiculo}
            disabled={!selectedVehiculo || loadingAction}
          >
            {loadingAction ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Agregando...</span>
              </>
            ) : (
              'Agregar Vehículo'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SubastaVehiculos; 