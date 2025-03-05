package ec.edu.espe.websocketsserver.service;

import ec.edu.espe.websocketsserver.entity.RoleEntity;
import ec.edu.espe.websocketsserver.entity.UsuarioEntity;
import ec.edu.espe.websocketsserver.repository.RoleEntityRepository;
import ec.edu.espe.websocketsserver.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final RoleEntityRepository roleEntityRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, RoleEntityRepository roleEntityRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.roleEntityRepository = roleEntityRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Crear usuario con asignación de rol
    public UsuarioEntity crearUsuario(UsuarioEntity usuario, String rolNombre) {
        RoleEntity rol = roleEntityRepository.findByNombre(rolNombre)
                .orElseThrow(() -> new RuntimeException("Rol no válido"));

        // Encriptar la contraseña antes de guardar
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        usuario.setRol(rol);
        usuario.setStatus("ACTIVO");
        return usuarioRepository.save(usuario);
    }

    // Listar usuarios
    public List<UsuarioEntity> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    // Editar usuario con posibilidad de cambiar rol
    public UsuarioEntity editarUsuario(Long id, UsuarioEntity usuarioActualizado, String rolNombre) {
        UsuarioEntity usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setNombre(usuarioActualizado.getNombre());
        usuario.setEmail(usuarioActualizado.getEmail());

        // Solo actualizar la contraseña si se proporciona una nueva
        if (usuarioActualizado.getPassword() != null && !usuarioActualizado.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(usuarioActualizado.getPassword()));
        }

        // Cambiar rol si se proporciona un nuevo rol
        if (rolNombre != null && !rolNombre.isEmpty()) {
            RoleEntity nuevoRol = roleEntityRepository.findByNombre(rolNombre)
                    .orElseThrow(() -> new RuntimeException("Rol no válido"));
            usuario.setRol(nuevoRol);
        }

        return usuarioRepository.save(usuario);
    }

    // Eliminar usuario (Lógica)
    public void eliminarUsuario(Long id) {
        UsuarioEntity usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setStatus("INACTIVO"); // Eliminación lógica
        usuarioRepository.save(usuario);
    }
}