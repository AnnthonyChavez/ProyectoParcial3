package ec.edu.espe.websocketsserver.handler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import ec.edu.espe.websocketsserver.dto.PujaDTO;
import ec.edu.espe.websocketsserver.entity.CompradorEntity;
import ec.edu.espe.websocketsserver.entity.PujaEntity;
import ec.edu.espe.websocketsserver.entity.SubastaEntity;
import ec.edu.espe.websocketsserver.entity.SubastaVehiculoEntity;
import ec.edu.espe.websocketsserver.entity.VehiculoEntity;
import ec.edu.espe.websocketsserver.repository.CompradorRepository;
import ec.edu.espe.websocketsserver.service.PujaService;
import ec.edu.espe.websocketsserver.service.SubastaService;
import ec.edu.espe.websocketsserver.service.SubastaVehiculoService;
import ec.edu.espe.websocketsserver.service.VehiculoService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.Comparator;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.ArrayList;

@Component
public class AppWebSocketHandler extends TextWebSocketHandler {

    private static final CopyOnWriteArraySet<WebSocketSession> SESSIONS = new CopyOnWriteArraySet<>();
    private static final Map<String, PujaDTO> pujas = new ConcurrentHashMap<>();
    private static final ObjectMapper MAPPER = new ObjectMapper()
        .registerModule(new JavaTimeModule());
    
    private final SubastaService subastaService;
    private final SubastaVehiculoService subastaVehiculoService;
    private final PujaService pujaService;
    private final CompradorRepository compradorRepository;
    private final VehiculoService vehiculoService;

    public AppWebSocketHandler(
            SubastaService subastaService, 
            SubastaVehiculoService subastaVehiculoService,
            PujaService pujaService,
            CompradorRepository compradorRepository,
            VehiculoService vehiculoService) {
        this.subastaService = subastaService;
        this.subastaVehiculoService = subastaVehiculoService;
        this.pujaService = pujaService;
        this.compradorRepository = compradorRepository;
        this.vehiculoService = vehiculoService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        System.out.println("Nueva conexión WebSocket establecida");
        String username = getUsernameSession(session);
        System.out.println("Username de la sesión: " + username);
        if (username == null) {
            System.out.println("Username nulo, cerrando conexión");
            session.close();
            return;
        }
        SESSIONS.add(session);
        System.out.println("Sesión agregada al conjunto de sesiones. Total sesiones: " + SESSIONS.size());
        
        // Enviar subastas activas y sus vehículos
        sendSubastasActivas(session);
        // Enviar estado actual de las pujas
        sendPujasUpdate();
    }

    private void sendSubastasActivas(WebSocketSession session) throws IOException {
        try {
            Map<String, Object> data = new HashMap<>();
            data.put("tipo", "subastas_activas");
            data.put("subastas", subastaService.listarSubastas());
            
            String message = MAPPER.writeValueAsString(data);
            session.sendMessage(new TextMessage(message));
        } catch (Exception e) {
            System.out.println("Error enviando subastas activas: " + e.getMessage());
        }
    }

    private String getUsernameSession(WebSocketSession session) {
        String username = (String) session.getAttributes().get("username");
        System.out.println("Obteniendo username de la sesión: " + username);
        return username;
    }

    private String getRoleSession(WebSocketSession session) {
        String role = (String) session.getAttributes().get("role");
        System.out.println("Obteniendo role de la sesión: " + role);
        return role;
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        System.out.println("Mensaje recibido: " + message.getPayload());
        String username = getUsernameSession(session);
        String role = getRoleSession(session);
        
        if (username == null) {
            System.out.println("Username nulo, ignorando mensaje");
            return;
        }

        try {
            JsonNode jsonNode = MAPPER.readTree(message.getPayload());

            // Si el mensaje es una solicitud de información de subasta
            if (jsonNode.has("tipo") && "obtener_subasta".equals(jsonNode.get("tipo").asText())) {
                Long subastaId = jsonNode.get("subastaId").asLong();
                sendInfoSubasta(session, subastaId);
                return;
            }

            // Si es una puja
            if (!"COMPRADOR".equals(role)) {
                System.out.println("Intento de puja por usuario no comprador: " + role);
                session.sendMessage(new TextMessage("{\"error\": \"Solo los compradores pueden realizar pujas\"}"));
                return;
            }

            if (jsonNode.has("subastaId") && jsonNode.has("monto")) {
                Long subastaId = jsonNode.get("subastaId").asLong();
                double monto = jsonNode.get("monto").asDouble();
                // Añadir soporte para el ID del vehículo
                Long vehiculoId = jsonNode.has("vehiculoId") ? jsonNode.get("vehiculoId").asLong() : null;
                System.out.println("Nueva puja recibida - SubastaID: " + subastaId + ", VehiculoID: " + vehiculoId + ", Monto: " + monto);

                // Verificar que la subasta esté activa
                Optional<SubastaEntity> subastaOpt = subastaService.listarSubastas().stream()
                        .filter(s -> s.getId().equals(subastaId))
                        .findFirst();
                
                if (!subastaOpt.isPresent()) {
                    session.sendMessage(new TextMessage("{\"error\": \"La subasta no existe\"}"));
                    return;
                }
                
                SubastaEntity subasta = subastaOpt.get();
                if (!"ACTIVA".equals(subasta.getEstado())) {
                    session.sendMessage(new TextMessage("{\"error\": \"La subasta no está activa\"}"));
                    return;
                }
                
                // Verificar que la fecha actual esté dentro del rango de la subasta
                LocalDateTime ahora = LocalDateTime.now();
                if (ahora.isBefore(subasta.getFechaInicio()) || ahora.isAfter(subasta.getFechaFin())) {
                    session.sendMessage(new TextMessage("{\"error\": \"La subasta no está en curso actualmente\"}"));
                    return;
                }

                // Verificar que el comprador no esté pujando por sus propios autos
                if (esVehiculoPropio(subastaId, username)) {
                    System.out.println("Intento de puja por vehículo propio: " + username);
                    session.sendMessage(new TextMessage("{\"error\": \"No puedes pujar por tus propios vehículos\"}"));
                    return;
                }

                // Obtener los vehículos en la subasta
                List<SubastaVehiculoEntity> vehiculosEnSubasta = subastaVehiculoService.listarVehiculosEnSubasta(subastaId);
                if (vehiculosEnSubasta.isEmpty()) {
                    session.sendMessage(new TextMessage("{\"error\": \"No hay vehículos en esta subasta\"}"));
                    return;
                }
                
                // Seleccionar el vehículo específico si se proporcionó un ID, de lo contrario usar el primero
                SubastaVehiculoEntity subastaVehiculo;
                if (vehiculoId != null) {
                    // Buscar el vehículo específico en la lista de vehículos de la subasta
                    Optional<SubastaVehiculoEntity> vehiculoSeleccionado = vehiculosEnSubasta.stream()
                            .filter(sv -> sv.getVehiculo().getId().equals(vehiculoId))
                            .findFirst();
                    
                    if (!vehiculoSeleccionado.isPresent()) {
                        session.sendMessage(new TextMessage("{\"error\": \"El vehículo seleccionado no está en esta subasta\"}"));
                        return;
                    }
                    
                    subastaVehiculo = vehiculoSeleccionado.get();
                } else {
                    // Para compatibilidad con versiones anteriores, si no se especifica vehículo, usar el primero
                    subastaVehiculo = vehiculosEnSubasta.get(0);
                }
                
                // Verificar que la puja sea mayor que el precio base del vehículo
                double precioBase = subastaVehiculo.getVehiculo().getPrecioBase();
                if (monto < precioBase) {
                    String vehiculoInfo = subastaVehiculo.getVehiculo().getMarca() + " " + subastaVehiculo.getVehiculo().getModelo();
                    session.sendMessage(new TextMessage("{\"error\": \"La puja para " + vehiculoInfo + " debe ser mayor o igual al precio base: " + precioBase + "\"}"));
                    return;
                }
                
                // Verificar que la puja sea mayor que la puja más alta actual
                List<PujaEntity> pujasExistentes = pujaService.listarPujas(subastaVehiculo.getId());
                double pujaMaxima = pujasExistentes.stream()
                        .mapToDouble(PujaEntity::getMonto)
                        .max()
                        .orElse(0.0);
                
                if (monto <= pujaMaxima) {
                    String vehiculoInfo = subastaVehiculo.getVehiculo().getMarca() + " " + subastaVehiculo.getVehiculo().getModelo();
                    session.sendMessage(new TextMessage("{\"error\": \"La puja para " + vehiculoInfo + " debe ser mayor que la puja más alta actual: " + pujaMaxima + "\"}"));
                    return;
                }

                // Guardar la puja en memoria para actualizaciones en tiempo real
                PujaDTO nuevaPuja = new PujaDTO(subastaId, username, monto, subastaVehiculo.getId());
                pujas.put(username, nuevaPuja);
                
                // Guardar la puja en la base de datos
                guardarPujaEnBaseDeDatos(username, subastaVehiculo.getId(), monto);
                
                System.out.println("Puja registrada correctamente");
                sendPujasUpdate();
            }
        } catch (Exception e) {
            System.out.println("Error procesando mensaje: " + e.getMessage());
            session.sendMessage(new TextMessage("{\"error\": \"Error al procesar el mensaje: " + e.getMessage() + "\"}"));
        }
    }

    private void guardarPujaEnBaseDeDatos(String email, Long subastaVehiculoId, double monto) {
        try {
            // Buscar el comprador por email usando el nuevo método del repositorio
            Optional<CompradorEntity> compradorOpt = compradorRepository.findByUsuarioEmail(email);
            
            if (!compradorOpt.isPresent()) {
                System.out.println("No se encontró el comprador con email: " + email);
                return;
            }
            
            // Buscar la subasta-vehículo
            Optional<SubastaVehiculoEntity> subastaVehiculoOpt = subastaVehiculoService.listarVehiculosEnSubasta(null).stream()
                    .filter(sv -> sv.getId().equals(subastaVehiculoId))
                    .findFirst();
            
            if (!subastaVehiculoOpt.isPresent()) {
                System.out.println("No se encontró la relación subasta-vehículo con ID: " + subastaVehiculoId);
                return;
            }
            
            // Crear y guardar la puja
            PujaEntity puja = new PujaEntity();
            puja.setComprador(compradorOpt.get());
            puja.setSubastaVehiculo(subastaVehiculoOpt.get());
            puja.setMonto(monto);
            puja.setFechaPuja(LocalDateTime.now());
            
            pujaService.realizarPuja(puja);
            System.out.println("Puja guardada en la base de datos");
        } catch (Exception e) {
            System.out.println("Error guardando puja en base de datos: " + e.getMessage());
        }
    }

    private boolean esVehiculoPropio(Long subastaId, String email) {
        try {
            // Obtener la subasta
            Optional<SubastaEntity> subastaOpt = subastaService.listarSubastas().stream()
                    .filter(s -> s.getId().equals(subastaId))
                    .findFirst();
            
            if (!subastaOpt.isPresent()) {
                return false;
            }
            
            // Obtener los vehículos de la subasta
            List<SubastaVehiculoEntity> vehiculosEnSubasta = subastaVehiculoService.listarVehiculosEnSubasta(subastaId);
            
            // Verificar si alguno de los vehículos pertenece al usuario
            for (SubastaVehiculoEntity subastaVehiculo : vehiculosEnSubasta) {
                VehiculoEntity vehiculo = subastaVehiculo.getVehiculo();
                if (vehiculo.getVendedor() != null && 
                    vehiculo.getVendedor().getUsuario() != null && 
                    email.equals(vehiculo.getVendedor().getUsuario().getEmail())) {
                    return true;
                }
            }
            
            return false;
        } catch (Exception e) {
            System.out.println("Error verificando si el vehículo es propio: " + e.getMessage());
            return false; // En caso de error, permitimos la puja
        }
    }

    private void sendInfoSubasta(WebSocketSession session, Long subastaId) throws IOException {
        try {
            Map<String, Object> data = new HashMap<>();
            data.put("tipo", "info_subasta");
            data.put("subasta", subastaService.listarSubastas().stream()
                    .filter(s -> s.getId().equals(subastaId))
                    .findFirst()
                    .orElse(null));
            
            List<SubastaVehiculoEntity> vehiculosEnSubasta = subastaVehiculoService.listarVehiculosEnSubasta(subastaId);
            data.put("vehiculos", vehiculosEnSubasta);
            
            // Añadir información de pujas para todos los vehículos de esta subasta
            if (!vehiculosEnSubasta.isEmpty()) {
                List<PujaEntity> todasLasPujas = new ArrayList<>();
                
                // Obtener las pujas de cada vehículo en la subasta
                for (SubastaVehiculoEntity subastaVehiculo : vehiculosEnSubasta) {
                    List<PujaEntity> pujasVehiculo = pujaService.listarPujas(subastaVehiculo.getId());
                    todasLasPujas.addAll(pujasVehiculo);
                }
                
                data.put("pujas", todasLasPujas);
            } else {
                data.put("pujas", List.of());
            }
            
            String message = MAPPER.writeValueAsString(data);
            session.sendMessage(new TextMessage(message));
        } catch (Exception e) {
            System.out.println("Error enviando información de subasta: " + e.getMessage());
            session.sendMessage(new TextMessage("{\"error\": \"Error al obtener información de la subasta\"}"));
        }
    }

    private void sendPujasUpdate() throws IOException {
        Map<String, Object> data = new HashMap<>();
        data.put("tipo", "actualizacion_pujas");
        
        // Convertir las pujas en memoria a entidades completas con relaciones
        List<PujaEntity> pujasCompletas = new ArrayList<>();
        for (PujaDTO pujaDTO : pujas.values()) {
            // Buscar la relación subasta-vehículo
            Optional<SubastaVehiculoEntity> subastaVehiculoOpt = subastaVehiculoService.listarVehiculosEnSubasta(null).stream()
                    .filter(sv -> sv.getId().equals(pujaDTO.getVehiculoId()))
                    .findFirst();
            
            if (subastaVehiculoOpt.isPresent()) {
                // Buscar el comprador
                Optional<CompradorEntity> compradorOpt = compradorRepository.findByUsuarioEmail(pujaDTO.getComprador());
                
                if (compradorOpt.isPresent()) {
                    // Crear una entidad de puja completa
                    PujaEntity puja = new PujaEntity();
                    puja.setMonto(pujaDTO.getMonto());
                    puja.setSubastaVehiculo(subastaVehiculoOpt.get());
                    puja.setComprador(compradorOpt.get());
                    puja.setFechaPuja(LocalDateTime.now());
                    
                    pujasCompletas.add(puja);
                }
            }
        }
        
        data.put("pujas", pujasCompletas);
        
        String updateMessage = MAPPER.writeValueAsString(data);
        System.out.println("Enviando actualización de pujas a " + SESSIONS.size() + " sesiones");
        for (WebSocketSession session : SESSIONS) {
            session.sendMessage(new TextMessage(updateMessage));
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        System.out.println("Error de transporte WebSocket: " + exception.getMessage());
        session.close();
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        System.out.println("Conexión WebSocket cerrada con status: " + status);
        String username = getUsernameSession(session);
        if (username != null) {
            pujas.remove(username);
            System.out.println("Pujas del usuario " + username + " eliminadas");
        }
        SESSIONS.remove(session);
        System.out.println("Sesión removida. Total sesiones restantes: " + SESSIONS.size());
        sendPujasUpdate();
    }
    
    // Tarea programada para verificar subastas finalizadas cada minuto
    @Scheduled(fixedRate = 60000)
    public void verificarSubastasFinalizadas() {
        System.out.println("Verificando subastas finalizadas...");
        LocalDateTime ahora = LocalDateTime.now();
        
        List<SubastaEntity> subastas = subastaService.listarSubastas();
        for (SubastaEntity subasta : subastas) {
            // Si la subasta está activa y ha pasado su fecha de fin
            if ("ACTIVA".equals(subasta.getEstado()) && ahora.isAfter(subasta.getFechaFin())) {
                finalizarSubasta(subasta);
            }
        }
    }
    
    private void finalizarSubasta(SubastaEntity subasta) {
        try {
            System.out.println("Finalizando subasta ID: " + subasta.getId());
            
            // Cambiar estado de la subasta a FINALIZADA
            subasta.setEstado("FINALIZADA");
            subastaService.editarSubasta(subasta.getId(), subasta);
            
            // Obtener los vehículos en la subasta
            List<SubastaVehiculoEntity> vehiculosEnSubasta = subastaVehiculoService.listarVehiculosEnSubasta(subasta.getId());
            if (vehiculosEnSubasta.isEmpty()) {
                System.out.println("No hay vehículos en la subasta ID: " + subasta.getId());
                return;
            }
            
            // Lista para almacenar los ganadores de cada vehículo
            List<Map<String, Object>> ganadoresPorVehiculo = new ArrayList<>();
            boolean hayGanadores = false;
            
            // Iterar sobre cada vehículo en la subasta
            for (SubastaVehiculoEntity subastaVehiculo : vehiculosEnSubasta) {
                // Determinar ganador (puja más alta) para este vehículo
                List<PujaEntity> pujasVehiculo = pujaService.listarPujas(subastaVehiculo.getId());
                Optional<PujaEntity> pujaGanadora = pujasVehiculo.stream()
                        .max(Comparator.comparing(PujaEntity::getMonto));
                
                if (pujaGanadora.isPresent()) {
                    PujaEntity puja = pujaGanadora.get();
                    System.out.println("Puja ganadora para vehículo ID " + subastaVehiculo.getVehiculo().getId() + 
                                      ": " + puja.getMonto() + " por " + puja.getComprador().getUsuario().getEmail());
                    
                    // Cambiar estado del vehículo a VENDIDO
                    VehiculoEntity vehiculo = subastaVehiculo.getVehiculo();
                    vehiculoService.actualizarEstadoVehiculo(vehiculo.getId(), "VENDIDO");
                    
                    // Agregar información del ganador a la lista
                    Map<String, Object> ganadorInfo = new HashMap<>();
                    ganadorInfo.put("vehiculoId", vehiculo.getId());
                    ganadorInfo.put("marca", vehiculo.getMarca());
                    ganadorInfo.put("modelo", vehiculo.getModelo());
                    ganadorInfo.put("anio", vehiculo.getAnio());
                    ganadorInfo.put("comprador", puja.getComprador().getUsuario().getEmail());
                    ganadorInfo.put("monto", puja.getMonto());
                    ganadoresPorVehiculo.add(ganadorInfo);
                    
                    hayGanadores = true;
                } else {
                    System.out.println("No hubo pujas para el vehículo ID: " + subastaVehiculo.getVehiculo().getId());
                    
                    // Cambiar estado del vehículo a DISPONIBLE para que pueda ser subastado nuevamente
                    VehiculoEntity vehiculo = subastaVehiculo.getVehiculo();
                    vehiculoService.actualizarEstadoVehiculo(vehiculo.getId(), "DISPONIBLE");
                    
                    // Agregar información del vehículo sin ganador
                    Map<String, Object> vehiculoSinGanador = new HashMap<>();
                    vehiculoSinGanador.put("vehiculoId", vehiculo.getId());
                    vehiculoSinGanador.put("marca", vehiculo.getMarca());
                    vehiculoSinGanador.put("modelo", vehiculo.getModelo());
                    vehiculoSinGanador.put("anio", vehiculo.getAnio());
                    vehiculoSinGanador.put("sinPujas", true);
                    ganadoresPorVehiculo.add(vehiculoSinGanador);
                }
            }
            
            // Notificar a todos los clientes conectados
            if (hayGanadores) {
                notificarFinalizacionSubasta(subasta, ganadoresPorVehiculo);
            } else {
                notificarFinalizacionSubastaSinPujas(subasta);
            }
        } catch (Exception e) {
            System.out.println("Error finalizando subasta: " + e.getMessage());
        }
    }
    
    private void notificarFinalizacionSubasta(SubastaEntity subasta, List<Map<String, Object>> ganadoresPorVehiculo) throws IOException {
        Map<String, Object> data = new HashMap<>();
        data.put("tipo", "subasta_finalizada");
        data.put("subastaId", subasta.getId());
        data.put("mensaje", "La subasta ha finalizado");
        data.put("ganadores", ganadoresPorVehiculo);
        
        String message = MAPPER.writeValueAsString(data);
        for (WebSocketSession session : SESSIONS) {
            session.sendMessage(new TextMessage(message));
        }
    }
    
    private void notificarFinalizacionSubastaSinPujas(SubastaEntity subasta) throws IOException {
        Map<String, Object> data = new HashMap<>();
        data.put("tipo", "subasta_finalizada_sin_pujas");
        data.put("subastaId", subasta.getId());
        data.put("mensaje", "La subasta ha finalizado sin pujas. Los vehículos pueden ser subastados nuevamente.");
        
        String message = MAPPER.writeValueAsString(data);
        for (WebSocketSession session : SESSIONS) {
            session.sendMessage(new TextMessage(message));
        }
    }
}