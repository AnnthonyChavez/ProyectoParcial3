import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="text-center py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="mb-4">
            <i className="fas fa-exclamation-triangle fa-5x text-warning"></i>
          </div>
          <h1 className="display-4 mb-4">404</h1>
          <h2 className="mb-4">Página no encontrada</h2>
          <p className="lead mb-5">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
          <Link to="/">
            <Button variant="primary" size="lg">
              <i className="fas fa-home me-2"></i>
              Volver al inicio
            </Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound; 