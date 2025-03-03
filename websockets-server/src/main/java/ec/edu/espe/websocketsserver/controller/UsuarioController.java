package ec.edu.espe.websocketsserver.controller;

import ec.edu.espe.websocketsserver.entity.UsuarioEntity;
import ec.edu.espe.websocketsserver.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/crear")
    public ResponseEntity<UsuarioEntity> crearUsuario(@RequestBody UsuarioEntity usuario, @RequestParam String rolNombre) {
        return ResponseEntity.ok(usuarioService.crearUsuario(usuario, rolNombre));
    }


    @GetMapping("/listar")
    public ResponseEntity<List<UsuarioEntity>> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.listarUsuarios());
    }

    @PutMapping("/editar/{id}")
    public ResponseEntity<UsuarioEntity> editarUsuario(@PathVariable Long id, @RequestBody UsuarioEntity usuario, @RequestParam String rolNombre) {
        return ResponseEntity.ok(usuarioService.editarUsuario(id, usuario, rolNombre));
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<String> eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.ok("Usuario eliminado lógicamente.");
    }
}