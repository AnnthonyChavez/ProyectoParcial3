package ec.edu.espe.websocketsserver.controller;

import ec.edu.espe.websocketsserver.entity.PujaEntity;
import ec.edu.espe.websocketsserver.service.PujaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pujas")
public class PujaController {
    private final PujaService pujaService;

    public PujaController(PujaService pujaService) {
        this.pujaService = pujaService;
    }

    @PostMapping("/realizar")
    public ResponseEntity<PujaEntity> realizarPuja(@RequestBody PujaEntity puja) {
        return ResponseEntity.ok(pujaService.realizarPuja(puja));
    }

    @GetMapping("/listar/{subastaId}")
    public ResponseEntity<List<PujaEntity>> listarPujas(@PathVariable Long subastaId) {
        return ResponseEntity.ok(pujaService.listarPujas(subastaId));
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<String> eliminarPuja(@PathVariable Long id) {
        pujaService.eliminarPuja(id);
        return ResponseEntity.ok("Puja eliminada lógicamente.");
    }
}

