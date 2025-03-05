import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import vehiculoService from '../services/vehiculoService';

const VehiculoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [vehiculo, setVehiculo] = useState({
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    precioBase: 0,
    vendedor: {
      id: user?.vendedorId || 0
    }
  });

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEditing) {
      const fetchVehiculo = async () => {
        try {
          const data = await vehiculoService.obtenerVehiculo(id);
          setVehiculo({
            marca: data.marca,
            modelo: data.modelo,
            anio: data.anio,
            precioBase: data.precioBase,
            vendedor: {
              id: data.vendedor?.id || user?.vendedorId || 0
            }
          });
        } catch (error) {
          console.error('Error al cargar vehículo:', error);
          setError('No se pudo cargar la información del vehículo.');
        } finally {
          setLoading(false);
        }
      };

      fetchVehiculo();
    }
  }, [id, isEditing, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'precioBase' || name === 'anio') {
      setVehiculo({
        ...vehiculo,
        [name]: parseFloat(value) || 0
      });
    } else {
      setVehiculo({
        ...vehiculo,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!vehiculo.marca || !vehiculo.modelo || !vehiculo.anio || !vehiculo.precioBase) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (vehiculo.precioBase <= 0) {
      setError('El precio base debe ser mayor que cero.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      if (isEditing) {
        await vehiculoService.editarVehiculo(id, vehiculo);
        setSuccess('Vehículo actualizado correctamente.');
      } else {
        await vehiculoService.crearVehiculo(vehiculo);
        setSuccess('Vehículo creado correctamente.');
        // Limpiar formulario después de crear
        setVehiculo({
          marca: '',
          modelo: '',
          anio: new Date().getFullYear(),
          precioBase: 0,
          vendedor: {
            id: user?.vendedorId || 0
          }
        });
      }
      
      // Redirigir después de un breve retraso
      setTimeout(() => {
        navigate('/vehiculos');
      }, 1500);
    } catch (error) {
      console.error('Error al guardar vehículo:', error);
      setError('No se pudo guardar el vehículo. Inténtalo de nuevo más tarde.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-2">Cargando información del vehículo...</p>
      </div>
    );
  }

  return (
    <Container className="my-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header as="h5">
              {isEditing ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo'}
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Marca</Form.Label>
                  <Form.Control
                    type="text"
                    name="marca"
                    value={vehiculo.marca}
                    onChange={handleChange}
                    placeholder="Ej: Toyota"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Modelo</Form.Label>
                  <Form.Control
                    type="text"
                    name="modelo"
                    value={vehiculo.modelo}
                    onChange={handleChange}
                    placeholder="Ej: Corolla"
                    required
                  />
                </Form.Group>
                
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Año</Form.Label>
                      <Form.Control
                        type="number"
                        name="anio"
                        value={vehiculo.anio}
                        onChange={handleChange}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Precio Base ($)</Form.Label>
                      <Form.Control
                        type="number"
                        name="precioBase"
                        value={vehiculo.precioBase}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="d-flex justify-content-between mt-4">
                  <Link to="/vehiculos" className="btn btn-outline-secondary">
                    Cancelar
                  </Link>
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Guardando...
                      </>
                    ) : (
                      isEditing ? 'Actualizar Vehículo' : 'Crear Vehículo'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VehiculoForm; 