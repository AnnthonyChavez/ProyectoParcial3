import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            // Token expirado
            logout();
          } else {
            // Token válido
            setUser({
              email: decoded.sub,
              role: decoded.role,
              id: decoded.id,
              vendedorId: decoded.vendedorId
            });
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Error al decodificar el token:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      const { token, email, role } = response;
      
      localStorage.setItem('token', token);
      
      // Decodificar el token para obtener información adicional
      const decoded = jwtDecode(token);
      
      setUser({
        email: email,
        role: role,
        id: decoded.id,
        vendedorId: decoded.vendedorId
      });
      setIsAuthenticated(true);
      toast.success('Inicio de sesión exitoso');
      return true;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      toast.error(error.response?.data?.mensaje || 'Error al iniciar sesión');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      await authService.register(userData);
      toast.success('Registro exitoso. Ahora puedes iniciar sesión.');
      return true;
    } catch (error) {
      console.error('Error al registrarse:', error);
      toast.error(error.response?.data?.mensaje || 'Error al registrarse');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Has cerrado sesión');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 