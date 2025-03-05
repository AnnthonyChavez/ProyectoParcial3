import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useAuth } from './context/AuthContext';

// Componentes
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import DetalleSubasta from './pages/DetalleSubasta';
import Vehiculos from './pages/Vehiculos';
import VehiculoForm from './pages/VehiculoForm';
import Subastas from './pages/Subastas';
import SubastaForm from './pages/SubastaForm';
import SubastaVehiculos from './pages/SubastaVehiculos';

// Protección de rutas
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <Container className="flex-grow-1 py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/subastas/:id" 
            element={
              <ProtectedRoute>
                <DetalleSubasta />
              </ProtectedRoute>
            } 
          />
          
          {/* Rutas para gestión de vehículos (solo VENDEDOR) */}
          <Route 
            path="/vehiculos" 
            element={
              <ProtectedRoute roles={['VENDEDOR']}>
                <Vehiculos />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/vehiculos/crear" 
            element={
              <ProtectedRoute roles={['VENDEDOR']}>
                <VehiculoForm />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/vehiculos/editar/:id" 
            element={
              <ProtectedRoute roles={['VENDEDOR']}>
                <VehiculoForm />
              </ProtectedRoute>
            } 
          />
          
          {/* Rutas de subastas */}
          <Route 
            path="/subastas" 
            element={
              <ProtectedRoute roles={['VENDEDOR', 'ADMIN']}>
                <Subastas />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/subastas/crear" 
            element={
              <ProtectedRoute roles={['VENDEDOR', 'ADMIN']}>
                <SubastaForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/subastas/editar/:id" 
            element={
              <ProtectedRoute roles={['VENDEDOR', 'ADMIN']}>
                <SubastaForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/subastas/vehiculos/:id" 
            element={
              <ProtectedRoute roles={['VENDEDOR', 'ADMIN']}>
                <SubastaVehiculos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/subasta/:id" 
            element={<DetalleSubasta />} 
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
      <Footer />
    </div>
  );
}

export default App; 