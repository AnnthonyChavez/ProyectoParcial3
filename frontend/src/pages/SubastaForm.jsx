import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import subastaService from '../services/subastaService';
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';

const SubastaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [horaActual, setHoraActual] = useState(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
  
  const [subastaData, setSubastaData] = useState({
    fechaInicio: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Mañana
    fechaFin: new Date(new Date().getTime() + 48 * 60 * 60 * 1000),    // Pasado mañana
    vendedor: {
      id: user?.vendedorId || 0
    }
  });

  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      const fetchSubasta = async () => {
        try {
          setLoadingData(true);
          const data = await subastaService.obtenerSubasta(id);
          console.log('Subasta obtenida:', data);
          
          // Convertir fechas de string o array a objeto Date
          let fechaInicio = new Date();
          let fechaFin = new Date();
          
          if (Array.isArray(data.fechaInicio)) {
            // Si es un array [año, mes, día, hora, minuto]
            console.log('Fecha inicio (array):', data.fechaInicio);
            fechaInicio = new Date(
              data.fechaInicio[0], 
              data.fechaInicio[1] - 1, // Mes en JavaScript es 0-indexed
              data.fechaInicio[2], 
              data.fechaInicio[3], 
              data.fechaInicio[4]
            );
          } else if (typeof data.fechaInicio === 'string') {
            // Si es un string en formato ISO
            console.log('Fecha inicio (string):', data.fechaInicio);
            // Extraer componentes de la fecha manualmente para evitar problemas de zona horaria
            const match = data.fechaInicio.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
            if (match) {
              const [_, año, mes, dia, hora, minutos] = match;
              fechaInicio = new Date(
                parseInt(año),
                parseInt(mes) - 1, // Mes en JavaScript es 0-indexed
                parseInt(dia),
                parseInt(hora),
                parseInt(minutos)
              );
            } else {
              fechaInicio = new Date(data.fechaInicio);
            }
          }
          
          if (Array.isArray(data.fechaFin)) {
            // Si es un array [año, mes, día, hora, minuto]
            console.log('Fecha fin (array):', data.fechaFin);
            fechaFin = new Date(
              data.fechaFin[0], 
              data.fechaFin[1] - 1, // Mes en JavaScript es 0-indexed
              data.fechaFin[2], 
              data.fechaFin[3], 
              data.fechaFin[4]
            );
          } else if (typeof data.fechaFin === 'string') {
            // Si es un string en formato ISO
            console.log('Fecha fin (string):', data.fechaFin);
            // Extraer componentes de la fecha manualmente para evitar problemas de zona horaria
            const match = data.fechaFin.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
            if (match) {
              const [_, año, mes, dia, hora, minutos] = match;
              fechaFin = new Date(
                parseInt(año),
                parseInt(mes) - 1, // Mes en JavaScript es 0-indexed
                parseInt(dia),
                parseInt(hora),
                parseInt(minutos)
              );
            } else {
              fechaFin = new Date(data.fechaFin);
            }
          }
          
          console.log('Fecha inicio procesada:', fechaInicio);
          console.log('Fecha fin procesada:', fechaFin);
          
          setSubastaData({
            ...data,
            fechaInicio,
            fechaFin
          });
        } catch (error) {
          console.error('Error al obtener subasta:', error);
          setError('No se pudo cargar la información de la subasta.');
        } finally {
          setLoadingData(false);
        }
      };
      
      fetchSubasta();
    }
  }, [id, isEditing]);

  // Actualizar la hora actual cada minuto
  useEffect(() => {
    const intervalo = setInterval(() => {
      setHoraActual(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
    }, 60000); // 60000 ms = 1 minuto
    
    return () => clearInterval(intervalo);
  }, []);

  const handleFechaInicioChange = (value) => {
    setSubastaData(prev => ({
      ...prev,
      fechaInicio: value
    }));
  };

  const handleFechaFinChange = (value) => {
    setSubastaData(prev => ({
      ...prev,
      fechaFin: value
    }));
  };

  const validateForm = () => {
    if (!subastaData.fechaInicio || !subastaData.fechaFin) {
      setError('Ambas fechas son obligatorias');
      return false;
    }

    if (subastaData.fechaInicio >= subastaData.fechaFin) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      return false;
    }

    const ahora = new Date();
    if (subastaData.fechaInicio < ahora && !isEditing) {
      setError(`La hora de inicio debe ser posterior a la hora actual (${horaActual})`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Ajustar las fechas para manejar correctamente la zona horaria
      const ajustarFechaParaBackend = (fecha) => {
        // Crear un objeto de fecha con los componentes locales
        const fechaLocal = new Date(
          fecha.getFullYear(),
          fecha.getMonth(),
          fecha.getDate(),
          fecha.getHours(),
          fecha.getMinutes()
        );
        
        // Formatear la fecha manualmente para evitar problemas de zona horaria
        const año = fechaLocal.getFullYear();
        const mes = String(fechaLocal.getMonth() + 1).padStart(2, '0');
        const dia = String(fechaLocal.getDate()).padStart(2, '0');
        const hora = String(fechaLocal.getHours()).padStart(2, '0');
        const minutos = String(fechaLocal.getMinutes()).padStart(2, '0');
        
        return `${año}-${mes}-${dia}T${hora}:${minutos}:00`;
      };
      
      // Formatear fechas para el backend (formato ISO string con ajuste de zona horaria)
      const formattedData = {
        ...subastaData,
        fechaInicio: ajustarFechaParaBackend(subastaData.fechaInicio),
        fechaFin: ajustarFechaParaBackend(subastaData.fechaFin)
      };
      
      console.log('Datos a enviar al backend:', formattedData);
      
      if (isEditing) {
        await subastaService.editarSubasta(id, formattedData);
        setSuccess('Subasta actualizada correctamente');
      } else {
        await subastaService.crearSubasta(formattedData);
        setSuccess('Subasta creada correctamente');
      }
      
      // Redirigir después de un breve retraso para mostrar el mensaje de éxito
      setTimeout(() => {
        navigate('/subastas');
      }, 2000);
    } catch (error) {
      console.error('Error al guardar subasta:', error);
      setError(error.response?.data?.mensaje || 'Error al guardar la subasta');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-2">Cargando información de la subasta...</p>
      </div>
    );
  }

  return (
    <Container className="my-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header as="h4" className="bg-primary text-white">
              {isEditing ? 'Editar Subasta' : 'Crear Nueva Subasta'}
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha y Hora de Inicio</Form.Label>
                  <div>
                    <DateTimePicker
                      onChange={handleFechaInicioChange}
                      value={subastaData.fechaInicio}
                      format="dd/MM/yyyy HH:mm"
                      className="form-control"
                      minDate={new Date()}
                      required
                    />
                  </div>
                  <Form.Text className="text-muted">
                    {!isEditing && `La hora de inicio debe ser posterior a la hora actual: ${horaActual}`}
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Fecha y Hora de Fin</Form.Label>
                  <div>
                    <DateTimePicker
                      onChange={handleFechaFinChange}
                      value={subastaData.fechaFin}
                      format="dd/MM/yyyy HH:mm"
                      className="form-control"
                      minDate={subastaData.fechaInicio}
                      required
                    />
                  </div>
                </Form.Group>
                
                <div className="d-flex justify-content-between mt-4">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/subastas')}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
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
                      isEditing ? 'Actualizar Subasta' : 'Crear Subasta'
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

export default SubastaForm; 