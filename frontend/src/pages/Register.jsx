import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [userData, setUserData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rolNombre: 'COMPRADOR' // Por defecto, COMPRADOR
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (userData.password !== userData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    
    if (userData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
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
      setError('');
      setLoading(true);
      
      // Eliminar confirmPassword antes de enviar
      const { confirmPassword, ...registerData } = userData;
      
      const success = await register(registerData);
      if (success) {
        navigate('/login');
      } else {
        setError('No se pudo completar el registro. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      setError('Error al registrarse. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Registro</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="nombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={userData.nombre}
                onChange={handleChange}
                required
                placeholder="Ingresa tu nombre"
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                required
                placeholder="Ingresa tu correo electrónico"
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={userData.password}
                onChange={handleChange}
                required
                placeholder="Ingresa tu contraseña"
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label>Confirmar Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={userData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirma tu contraseña"
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="rolNombre">
              <Form.Label>Tipo de Usuario</Form.Label>
              <Form.Select
                name="rolNombre"
                value={userData.rolNombre}
                onChange={handleChange}
                required
              >
                <option value="COMPRADOR">Comprador</option>
                <option value="VENDEDOR">Vendedor</option>
              </Form.Select>
              <Form.Text className="text-muted">
                {userData.rolNombre === 'COMPRADOR' ? 
                  'Como comprador, podrás participar en subastas y realizar pujas.' : 
                  'Como vendedor, podrás crear subastas y añadir vehículos.'}
              </Form.Text>
            </Form.Group>
            
            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 mt-3"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </Form>
          
          <div className="text-center mt-3">
            <p>
              ¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión</Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Register; 