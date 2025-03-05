package ec.edu.espe.websocketsserver.controller;

import ec.edu.espe.websocketsserver.entity.SubastaVehiculoEntity;
import ec.edu.espe.websocketsserver.service.SubastaVehiculoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/subasta-vehiculo")
public class SubastaVehiculoController {
    private final SubastaVehiculoService subastaVehiculoService;

    public SubastaVehiculoController(SubastaVehiculoService subastaVehiculoService) {
        this.subastaVehiculoService = subastaVehiculoService;
    }

    @PostMapping("/asociar")
    public ResponseEntity<?> asociarVehiculoASubasta(@RequestBody SubastaVehiculoEntity subastaVehiculo) {
        try {
            SubastaVehiculoEntity resultado = subastaVehiculoService.asociarVehiculoASubasta(subastaVehiculo);
            
            // Crear un mapa simplificado para la respuesta
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("id", resultado.getId());
            respuesta.put("subastaId", resultado.getSubasta().getId());
            respuesta.put("vehiculoId", resultado.getVehiculo().getId());
            respuesta.put("status", resultado.getStatus());
            respuesta.put("mensaje", "Vehículo asociado correctamente a la subasta");
            
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/listar/{subastaId}")
    public ResponseEntity<?> listarVehiculosEnSubasta(@PathVariable Long subastaId) {
        try {
            List<SubastaVehiculoEntity> vehiculos = subastaVehiculoService.listarVehiculosEnSubasta(subastaId);
            return ResponseEntity.ok(vehiculos);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarAsociacion(@PathVariable Long id) {
        try {
            subastaVehiculoService.eliminarAsociacion(id);
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Asociación eliminada lógicamente.");
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
