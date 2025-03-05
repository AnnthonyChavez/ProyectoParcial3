import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { formatDate, timeRemaining, isSubastaActive } from '../utils/dateUtils';

const SubastaCard = ({ subasta }) => {
  const esActiva = isSubastaActive(subasta);
  
  // Reemplazamos la función getVehiculoImage por un div con icono
  const renderAuctionIcon = () => {
    return (
      <div className="text-center p-4 bg-light" style={{ fontSize: '4rem', color: esActiva ? '#28a745' : '#6c757d' }}>
        <i className="fas fa-gavel"></i>
      </div>
    );
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    
    console.log('Formateando fecha en SubastaCard:', fecha);
    
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

  // Obtener tiempo restante
  const getTiempoRestante = () => {
    if (!subasta.fechaFin || !esActiva) return null;
    
    const fechaFin = Array.isArray(subasta.fechaFin) 
      ? new Date(subasta.fechaFin[0], subasta.fechaFin[1]-1, subasta.fechaFin[2], subasta.fechaFin[3], subasta.fechaFin[4])
      : new Date(subasta.fechaFin);
    
    return timeRemaining(fechaFin);
  };

  // Obtener información de vehículos
  const getVehiculosInfo = () => {
    if (!subasta.vehiculos || subasta.vehiculos.length === 0) {
      return 'Sin vehículos';
    }
    
    if (subasta.vehiculos.length === 1 && subasta.vehiculos[0].vehiculo) {
      const vehiculo = subasta.vehiculos[0].vehiculo;
      return `${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.anio})`;
    }
    
    return `${subasta.vehiculos.length} vehículos`;
  };

  // Obtener precio actual
  const getPrecioActual = () => {
    if (subasta.pujas && subasta.pujas.length > 0) {
      return Math.max(...subasta.pujas.map(puja => puja.monto));
    }
    
    if (subasta.vehiculos && subasta.vehiculos.length > 0 && subasta.vehiculos[0].vehiculo) {
      return subasta.vehiculos[0].vehiculo.precioBase;
    }
    
    return 0;
  };

  return (
    <Card className={`subasta-card ${esActiva ? 'activa' : 'finalizada'}`}>
      {renderAuctionIcon()}
      <Card.Body>
        <Card.Title>Subasta #{subasta.id}</Card.Title>
        
        <Card.Text>
          <strong>Vehículo:</strong> {getVehiculosInfo()}
        </Card.Text>
        
        <Card.Text>
          <strong>Vendedor:</strong> {subasta.vendedor?.usuario?.nombre || 'No disponible'}
        </Card.Text>
        
        <Card.Text>
          <strong>Precio actual:</strong> ${getPrecioActual().toFixed(2)}
        </Card.Text>
        
        <Card.Text>
          <strong>Finaliza:</strong> {formatearFecha(subasta.fechaFin)}
        </Card.Text>
        
        {esActiva && (
          <div className="timer mb-3">
            <small>Tiempo restante:</small>
            <div className="pulse">{getTiempoRestante()}</div>
          </div>
        )}
        
        <div className="d-grid">
          <Link to={`/subastas/${subasta.id}`} className="btn btn-primary">
            {esActiva ? 'Participar' : 'Ver Detalles'}
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SubastaCard; 