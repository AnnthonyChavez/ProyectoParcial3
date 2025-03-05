import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer bg-dark text-white py-3 mt-auto">
      <Container className="text-center">
        <p className="mb-0">
          Sistema de Subastas de Vehículos &copy; {currentYear}
        </p>
      </Container>
    </footer>
  );
};

export default Footer; 