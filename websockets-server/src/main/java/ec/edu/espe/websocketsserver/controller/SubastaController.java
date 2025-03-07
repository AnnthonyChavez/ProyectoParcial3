package ec.edu.espe.websocketsserver.controller;

import ec.edu.espe.websocketsserver.entity.CompradorEntity;
import ec.edu.espe.websocketsserver.entity.PujaEntity;
import ec.edu.espe.websocketsserver.entity.SubastaEntity;
import ec.edu.espe.websocketsserver.entity.SubastaVehiculoEntity;
import ec.edu.espe.websocketsserver.repository.CompradorRepository;
import ec.edu.espe.websocketsserver.service.PujaService;
import ec.edu.espe.websocketsserver.service.SubastaService;
import ec.edu.espe.websocketsserver.service.SubastaVehiculoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/subastas")
public class SubastaController {
    private final SubastaService subastaService;
    private final SubastaVehiculoService subastaVehiculoService;
    private final PujaService pujaService;
    private final CompradorRepository compradorRepository;

    public SubastaController(
            SubastaService subastaService,
            SubastaVehiculoService subastaVehiculoService,
            PujaService pujaService,
            CompradorRepository compradorRepository) {
        this.subastaService = subastaService;
        this.subastaVehiculoService = subastaVehiculoService;
        this.pujaService = pujaService;
        this.compradorRepository = compradorRepository;
    }

    @PostMapping("/crear")
    public ResponseEntity<SubastaEntity> crearSubasta(@RequestBody SubastaEntity subasta) {
        return ResponseEntity.ok(subastaService.crearSubasta(subasta));
    }

    @GetMapping("/listar")
    public ResponseEntity<List<SubastaEntity>> listarSubastas() {
        return ResponseEntity.ok(subastaService.listarSubastas());
    }

    @PutMapping("/editar/{id}")
    public ResponseEntity<SubastaEntity> editarSubasta(@PathVariable Long id, @RequestBody SubastaEntity subasta) {
        return ResponseEntity.ok(subastaService.editarSubasta(id, subasta));
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<String> eliminarSubasta(@PathVariable Long id) {
        subastaService.eliminarSubasta(id);
        return ResponseEntity.ok("Subasta eliminada lógicamente.");
    }

    @GetMapping("/buscar-por-fecha")
    public ResponseEntity<List<SubastaEntity>> buscarSubastasPorFecha(@RequestParam LocalDateTime inicio, @RequestParam LocalDateTime fin) {
        return ResponseEntity.ok(subastaService.buscarSubastasPorFecha(inicio, fin));
    }

    @PostMapping("/{subastaId}/pujar")
    public ResponseEntity<?> realizarPuja(
            @PathVariable Long subastaId,
            @RequestBody Map<String, Object> pujaData) {
        
        try {
            // Extraer datos de la puja
            double monto = Double.parseDouble(pujaData.get("monto").toString());
            Long vehiculoId = pujaData.containsKey("vehiculoId") ? 
                    Long.parseLong(pujaData.get("vehiculoId").toString()) : null;
            
            // Verificar que la subasta exista y esté activa
            Optional<SubastaEntity> subastaOpt = subastaService.listarSubastas().stream()
                    .filter(s -> s.getId().equals(subastaId))
                    .findFirst();
            
            if (!subastaOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "La subasta no existe"));
            }
            
            SubastaEntity subasta = subastaOpt.get();
            if (!"ACTIVA".equals(subasta.getEstado())) {
                return ResponseEntity.badRequest().body(Map.of("error", "La subasta no está activa"));
            }
            
            // Verificar que la fecha actual esté dentro del rango de la subasta
            LocalDateTime ahora = LocalDateTime.now();
            if (ahora.isBefore(subasta.getFechaInicio()) || ahora.isAfter(subasta.getFechaFin())) {
                return ResponseEntity.badRequest().body(Map.of("error", "La subasta no está en curso actualmente"));
            }
            
            // Obtener los vehículos en la subasta
            List<SubastaVehiculoEntity> vehiculosEnSubasta = subastaVehiculoService.listarVehiculosEnSubasta(subastaId);
            if (vehiculosEnSubasta.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No hay vehículos en esta subasta"));
            }
            
            // Seleccionar el vehículo específico si se proporcionó un ID, de lo contrario usar el primero
            SubastaVehiculoEntity subastaVehiculo;
            if (vehiculoId != null) {
                // Buscar el vehículo específico en la lista de vehículos de la subasta
                Optional<SubastaVehiculoEntity> vehiculoSeleccionado = vehiculosEnSubasta.stream()
                        .filter(sv -> sv.getVehiculo().getId().equals(vehiculoId))
                        .findFirst();
                
                if (!vehiculoSeleccionado.isPresent()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "El vehículo seleccionado no está en esta subasta"));
                }
                
                subastaVehiculo = vehiculoSeleccionado.get();
            } else {
                // Para compatibilidad con versiones anteriores, si no se especifica vehículo, usar el primero
                subastaVehiculo = vehiculosEnSubasta.get(0);
            }
            
            // Verificar que la puja sea mayor que el precio base del vehículo
            double precioBase = subastaVehiculo.getVehiculo().getPrecioBase();
            if (monto < precioBase) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "La puja debe ser mayor o igual al precio base: " + precioBase
                ));
            }
            
            // Verificar que la puja sea mayor que la puja más alta actual
            List<PujaEntity> pujasExistentes = pujaService.listarPujas(subastaVehiculo.getId());
            double pujaMaxima = pujasExistentes.stream()
                    .mapToDouble(PujaEntity::getMonto)
                    .max()
                    .orElse(0.0);
            
            if (monto <= pujaMaxima) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "La puja debe ser mayor que la puja más alta actual: " + pujaMaxima
                ));
            }
            
            // Obtener el comprador
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<CompradorEntity> compradorOpt = compradorRepository.findByUsuarioEmail(email);
            
            if (!compradorOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Comprador no encontrado para el email: " + email
                ));
            }
            
            CompradorEntity comprador = compradorOpt.get();
            
            // Crear y guardar la puja
            PujaEntity puja = new PujaEntity();
            puja.setSubastaVehiculo(subastaVehiculo);
            puja.setComprador(comprador);
            puja.setMonto(monto);
            puja.setFechaPuja(LocalDateTime.now());
            
            PujaEntity pujaGuardada = pujaService.realizarPuja(puja);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Puja realizada correctamente");
            response.put("puja", pujaGuardada);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Error al realizar la puja: " + e.getMessage()
            ));
        }
    }
}
