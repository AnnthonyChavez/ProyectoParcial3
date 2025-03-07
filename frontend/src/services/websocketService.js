import config from '../config';

let socket = null;
let messageHandlers = [];

const connect = (token) => {
  return new Promise((resolve, reject) => {
    try {
      // Cerrar la conexión existente si la hay
      if (socket && socket.readyState !== WebSocket.CLOSED) {
        socket.close();
      }

      // Crear nueva conexión usando la configuración centralizada
      const wsUrl = config.wsSubastasUrl(token);
      console.log('Intentando conectar a WebSocket en:', wsUrl);
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('Conexión WebSocket establecida');
        resolve(socket);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Notificar a todos los manejadores registrados
          messageHandlers.forEach(handler => handler(data));
        } catch (error) {
          console.error('Error al procesar mensaje WebSocket:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('Error en la conexión WebSocket:', error);
        reject(error);
      };

      socket.onclose = (event) => {
        console.log('Conexión WebSocket cerrada:', event.code, event.reason);
        // Intentar reconectar si no fue un cierre intencional
        if (event.code !== 1000) {
          setTimeout(() => {
            connect(token);
          }, 5000);
        }
      };
    } catch (error) {
      console.error('Error al conectar WebSocket:', error);
      reject(error);
    }
  });
};

const disconnect = () => {
  if (socket && socket.readyState !== WebSocket.CLOSED) {
    socket.close(1000, 'Cierre intencional');
  }
};

const sendMessage = (message) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  } else {
    console.error('WebSocket no está conectado');
  }
};

const addMessageHandler = (handler) => {
  messageHandlers.push(handler);
  return () => {
    messageHandlers = messageHandlers.filter(h => h !== handler);
  };
};

const requestSubastaInfo = (subastaId) => {
  sendMessage({
    tipo: 'obtener_subasta',
    subastaId
  });
};

const requestActiveSubastas = () => {
  // Al conectarse, el servidor envía automáticamente las subastas activas
  // Esta función es solo para solicitar explícitamente las subastas activas si es necesario
  sendMessage({
    tipo: 'obtener_subastas_activas'
  });
};

const realizarPuja = (subastaId, monto, vehiculoId = null) => {
  // Asegurarse de que los tipos de datos sean correctos
  const mensaje = {
    subastaId: parseInt(subastaId),
    monto: parseFloat(monto)
  };
  
  // Añadir el ID del vehículo si se proporciona
  if (vehiculoId !== null) {
    mensaje.vehiculoId = parseInt(vehiculoId);
  }
  
  console.log('Enviando mensaje de puja:', mensaje);
  sendMessage(mensaje);
};

const isConnected = () => {
  return socket && socket.readyState === WebSocket.OPEN;
};

export default {
  connect,
  disconnect,
  sendMessage,
  addMessageHandler,
  requestSubastaInfo,
  requestActiveSubastas,
  realizarPuja,
  isConnected
}; 