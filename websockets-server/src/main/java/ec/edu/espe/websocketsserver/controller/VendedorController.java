package ec.edu.espe.websocketsserver.controller;

import ec.edu.espe.websocketsserver.entity.VendedorEntity;
import ec.edu.espe.websocketsserver.service.VendedorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendedores")
public class VendedorController {
    private final VendedorService vendedorService;

    public VendedorController(VendedorService vendedorService) {
        this.vendedorService = vendedorService;
    }

    @PostMapping("/registrar")
    public ResponseEntity<VendedorEntity> registrarVendedor(@RequestBody VendedorEntity vendedor) {
        return ResponseEntity.ok(vendedorService.registrarVendedor(vendedor));
    }

    @GetMapping("/listar")
    public ResponseEntity<List<VendedorEntity>> listarVendedores() {
        return ResponseEntity.ok(vendedorService.listarVendedores());
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<String> eliminarVendedor(@PathVariable Long id) {
        vendedorService.eliminarVendedor(id);
        return ResponseEntity.ok("Vendedor eliminado lógicamente.");
    }
}