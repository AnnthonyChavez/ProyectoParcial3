package ec.edu.espe.websocketsserver.controller;

import ec.edu.espe.websocketsserver.entity.RoleEntity;
import ec.edu.espe.websocketsserver.service.RoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {
    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @PostMapping("/crear")
    public ResponseEntity<RoleEntity> crearRol(@RequestBody RoleEntity rol) {
        return ResponseEntity.ok(roleService.crearRol(rol));
    }

    @GetMapping("/listar")
    public ResponseEntity<List<RoleEntity>> listarRoles() {
        return ResponseEntity.ok(roleService.listarRoles());
    }

    @PutMapping("/editar/{id}")
    public ResponseEntity<RoleEntity> editarRol(@PathVariable Long id, @RequestBody RoleEntity rol) {
        return ResponseEntity.ok(roleService.editarRol(id, rol));
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<String> eliminarRol(@PathVariable Long id) {
        roleService.eliminarRol(id);
        return ResponseEntity.ok("Rol eliminado lógicamente.");
    }
}
