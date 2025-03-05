package ec.edu.espe.websocketsserver.controller;

import ec.edu.espe.websocketsserver.entity.SubastaEntity;
import ec.edu.espe.websocketsserver.service.SubastaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/subastas")
public class SubastaController {
    private final SubastaService subastaService;

    public SubastaController(SubastaService subastaService) {
        this.subastaService = subastaService;
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
}
