package ec.edu.espe.websocketsserver.controller;

import ec.edu.espe.websocketsserver.entity.VehiculoEntity;
import ec.edu.espe.websocketsserver.service.VehiculoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehiculos")
public class VehiculoController {
    private final VehiculoService vehiculoService;

    public VehiculoController(VehiculoService vehiculoService) {
        this.vehiculoService = vehiculoService;
    }

    @PostMapping("/crear")
    public ResponseEntity<VehiculoEntity> crearVehiculo(@RequestBody VehiculoEntity vehiculo) {
        return ResponseEntity.ok(vehiculoService.crearVehiculo(vehiculo));
    }

    @GetMapping("/listar")
    public ResponseEntity<List<VehiculoEntity>> listarVehiculos() {
        return ResponseEntity.ok(vehiculoService.listarVehiculos());
    }

    @PutMapping("/editar/{id}")
    public ResponseEntity<VehiculoEntity> editarVehiculo(@PathVariable Long id, @RequestBody VehiculoEntity vehiculo) {
        return ResponseEntity.ok(vehiculoService.editarVehiculo(id, vehiculo));
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<String> eliminarVehiculo(@PathVariable Long id) {
        vehiculoService.eliminarVehiculo(id);
        return ResponseEntity.ok("Vehículo eliminado lógicamente.");
    }
}