package ec.edu.espe.websocketsserver.controller;

import ec.edu.espe.websocketsserver.entity.CompradorEntity;
import ec.edu.espe.websocketsserver.service.CompradorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/compradores")
public class CompradorController {
    private final CompradorService compradorService;

    public CompradorController(CompradorService compradorService) {
        this.compradorService = compradorService;
    }

    @PostMapping("/registrar")
    public ResponseEntity<CompradorEntity> registrarComprador(@RequestBody CompradorEntity comprador) {
        return ResponseEntity.ok(compradorService.registrarComprador(comprador));
    }

    @GetMapping("/listar")
    public ResponseEntity<List<CompradorEntity>> listarCompradores() {
        return ResponseEntity.ok(compradorService.listarCompradores());
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<String> eliminarComprador(@PathVariable Long id) {
        compradorService.eliminarComprador(id);
        return ResponseEntity.ok("Comprador eliminado lógicamente.");
    }
}