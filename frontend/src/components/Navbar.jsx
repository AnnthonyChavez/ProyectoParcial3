import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          <i className="fas fa-car me-2"></i>
          Sistema de Subastas
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/">Inicio</Nav.Link>
            
            {isAuthenticated && user?.role === 'VENDEDOR' && (
              <>
                <Nav.Link as={NavLink} to="/vehiculos" className="me-3">
                  <i className="fas fa-car me-1"></i> Mis Vehículos
                </Nav.Link>
                <Nav.Link as={NavLink} to="/subastas" className="me-3">
                  <i className="fas fa-gavel me-1"></i> Mis Subastas
                </Nav.Link>
              </>
            )}
          </Nav>
          
          <Nav>
            {isAuthenticated ? (
              <>
                <Nav.Item className="d-flex align-items-center me-3">
                  <span className="text-light">
                    <i className="fas fa-user me-1"></i>
                    {user?.email}
                    {user?.role && (
                      <span className={`badge ms-2 bg-${
                        user.role === 'ADMIN' ? 'danger' : 
                        user.role === 'VENDEDOR' ? 'info' : 'success'
                      }`}>
                        {user.role}
                      </span>
                    )}
                  </span>
                </Nav.Item>
                <Button variant="outline-light" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-1"></i>
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login" className="me-2">
                  <i className="fas fa-sign-in-alt me-1"></i>
                  Iniciar Sesión
                </Nav.Link>
                <Nav.Link as={NavLink} to="/register">
                  <i className="fas fa-user-plus me-1"></i>
                  Registrarse
                </Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar; 