import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import vehiculoService from '../services/vehiculoService';

const Vehiculos = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchVehiculos = async () => {
      try {
        setLoading(true);
        const data = await vehiculoService.listarVehiculos();
        console.log('Vehículos recibidos:', data);
        console.log('Usuario actual:', user);
        
        // Mostrar todos los vehículos sin filtrar por ahora
        setVehiculos(data);
        
        /* Comentamos el filtro que está causando problemas
        if (user && user.role === 'VENDEDOR') {
          setVehiculos(data.filter(v => v.vendedor && v.vendedor.id === user.vendedorId));
        } else {
          setVehiculos(data);
        }
        */
      } catch (error) {
        console.error('Error al cargar vehículos:', error);
        setError('No se pudieron cargar los vehículos. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehiculos();
  }, [user]);

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este vehículo?')) {
      try {
        await vehiculoService.eliminarVehiculo(id);
        setVehiculos(vehiculos.filter(v => v.id !== id));
      } catch (error) {
        console.error('Error al eliminar vehículo:', error);
        setError('No se pudo eliminar el vehículo. Inténtalo de nuevo más tarde.');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-2">Cargando vehículos...</p>
      </div>
    );
  }

  return (
    <Container className="my-4">
      <Row className="mb-4">
        <Col>
          <h1>Mis Vehículos</h1>
          <p className="text-muted">Gestiona tus vehículos para subastas</p>
        </Col>
        <Col xs="auto">
          <Link to="/vehiculos/crear" className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>
            Nuevo Vehículo
          </Link>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {vehiculos.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <i className="fas fa-car fa-3x mb-3 text-muted"></i>
            <Card.Title>No tienes vehículos registrados</Card.Title>
            <Card.Text>
              Comienza a registrar tus vehículos para ponerlos en subasta.
            </Card.Text>
            <Link to="/vehiculos/crear" className="btn btn-primary">
              Registrar mi primer vehículo
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <Table responsive striped hover>
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
            {vehiculos.map(vehiculo => (
              <tr key={vehiculo.id}>
                <td>{vehiculo.id}</td>
                <td>{vehiculo.marca}</td>
                <td>{vehiculo.modelo}</td>
                <td>{vehiculo.anio}</td>
                <td>${typeof vehiculo.precioBase === 'number' ? vehiculo.precioBase.toFixed(2) : vehiculo.precioBase}</td>
                <td>
                  <Badge bg={vehiculo.estado === 'DISPONIBLE' ? 'success' : vehiculo.estado === 'VENDIDO' ? 'danger' : 'secondary'}>
                    {vehiculo.estado}
                  </Badge>
                </td>
                <td>
                  <Link to={`/vehiculos/editar/${vehiculo.id}`} className="btn btn-sm btn-outline-primary me-2">
                    <i className="fas fa-edit"></i>
                  </Link>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleEliminar(vehiculo.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Vehiculos; 