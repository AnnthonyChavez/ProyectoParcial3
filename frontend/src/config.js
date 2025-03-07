// Configuración centralizada para la aplicación

// Obtener el hostname actual para que funcione en red local
const hostname = window.location.hostname;
const port = '8081'; // Puerto del backend

// URLs base para los diferentes servicios
const config = {
  apiUrl: `http://${hostname}:${port}/api`,
  wsUrl: `ws://${hostname}:${port}/ws`,
  
  // URLs específicas para cada servicio
  authUrl: function() { return `${this.apiUrl}/auth`; },
  subastasUrl: function() { return `${this.apiUrl}/subastas`; },
  vehiculosUrl: function() { return `${this.apiUrl}/vehiculos`; },
  subastaVehiculoUrl: function() { return `${this.apiUrl}/subasta-vehiculo`; },
  pujasUrl: function() { return `${this.apiUrl}/pujas`; },
  
  // URL para WebSocket
  wsSubastasUrl: function(token) { return `${this.wsUrl}/subastas?token=${token}`; }
};

export default config; 