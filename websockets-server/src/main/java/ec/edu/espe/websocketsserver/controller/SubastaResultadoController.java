package ec.edu.espe.websocketsserver.controller;

import ec.edu.espe.websocketsserver.dto.SubastaResultadoDTO;
import ec.edu.espe.websocketsserver.exception.SubastaNotFoundException;
import ec.edu.espe.websocketsserver.exception.SubastaNoFinalizadaException;
import ec.edu.espe.websocketsserver.service.SubastaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subastas-resultados")
public class SubastaResultadoController {
    
    private final SubastaService subastaService;
    
    public SubastaResultadoController(SubastaService subastaService) {
        this.subastaService = subastaService;
    }
    
    @GetMapping("/finalizada/{subastaId}")
    public ResponseEntity<?> obtenerResultadoSubasta(@PathVariable Long subastaId) {
        try {
            SubastaResultadoDTO resultado = subastaService.obtenerResultadoSubasta(subastaId);
            return ResponseEntity.ok(resultado);
        } catch (SubastaNotFoundException | SubastaNoFinalizadaException e) {
            // Estas excepciones serán manejadas por el GlobalExceptionHandler
            throw e;
        } catch (Exception e) {
            // Otras excepciones no esperadas
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener el resultado de la subasta: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    @GetMapping("/finalizadas")
    public ResponseEntity<?> listarSubastasFinalizadas() {
        try {
            List<SubastaResultadoDTO> resultados = subastaService.listarSubastasFinalizadas();
            return ResponseEntity.ok(resultados);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al listar las subastas finalizadas: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
} 