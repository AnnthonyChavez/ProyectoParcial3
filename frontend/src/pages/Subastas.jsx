import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import subastaService from '../services/subastaService';
import { formatDate } from '../utils/dateUtils';

const Subastas = () => {
  const [subastas, setSubastas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchSubastas = async () => {
      try {
        setLoading(true);
        const data = await subastaService.listarSubastas();
        console.log('Subastas recibidas:', data);
        console.log('Usuario actual:', user);
        
        // Mostrar todas las subastas sin filtrar por ahora
        setSubastas(data);
      } catch (error) {
        console.error('Error al cargar subastas:', error);
        setError('No se pudieron cargar las subastas. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubastas();
  }, [user]);

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta subasta?')) {
      try {
        await subastaService.eliminarSubasta(id);
        setSubastas(subastas.filter(s => s.id !== id));
      } catch (error) {
        console.error('Error al eliminar subasta:', error);
        setError('No se pudo eliminar la subasta. Inténtalo de nuevo más tarde.');
      }
    }
  };

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

  const getEstadoBadge = (estado) => {
    let variant = 'secondary';
    
    switch (estado) {
      case 'ACTIVA':
        variant = 'success';
        break;
      case 'PENDIENTE':
        variant = 'warning';
        break;
      case 'FINALIZADA':
        variant = 'danger';
        break;
      default:
        variant = 'secondary';
    }
    
    return <Badge bg={variant}>{estado}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-2">Cargando subastas...</p>
      </div>
    );
  }

  return (
    <Container className="my-4">
      <Row className="mb-4">
        <Col>
          <h1>Mis Subastas</h1>
          <p className="text-muted">Gestiona tus subastas de vehículos</p>
        </Col>
        <Col xs="auto">
          <Link to="/subastas/crear" className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>
            Nueva Subasta
          </Link>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {subastas.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <i className="fas fa-gavel fa-3x mb-3 text-muted"></i>
            <Card.Title>No tienes subastas registradas</Card.Title>
            <Card.Text>
              Comienza a crear subastas para tus vehículos.
            </Card.Text>
            <Link to="/subastas/crear" className="btn btn-primary">
              Crear mi primera subasta
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {subastas.map(subasta => (
              <tr key={subasta.id}>
                <td>{subasta.id}</td>
                <td>{formatearFecha(subasta.fechaInicio)}</td>
                <td>{formatearFecha(subasta.fechaFin)}</td>
                <td>{getEstadoBadge(subasta.estado)}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="info"
                      size="sm"
                      as={Link}
                      to={`/subastas/vehiculos/${subasta.id}`}
                      title="Gestionar vehículos"
                    >
                      <i className="fas fa-car"></i>
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      as={Link}
                      to={`/subastas/editar/${subasta.id}`}
                      disabled={subasta.estado === 'FINALIZADA'}
                      title="Editar subasta"
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleEliminar(subasta.id)}
                      disabled={subasta.estado === 'FINALIZADA'}
                      title="Eliminar subasta"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Subastas; 