package ec.edu.espe.websocketsserver.service;

import ec.edu.espe.websocketsserver.entity.CompradorEntity;
import ec.edu.espe.websocketsserver.entity.RoleEntity;
import ec.edu.espe.websocketsserver.entity.UsuarioEntity;
import ec.edu.espe.websocketsserver.entity.VendedorEntity;
import ec.edu.espe.websocketsserver.repository.CompradorRepository;
import ec.edu.espe.websocketsserver.repository.RoleEntityRepository;
import ec.edu.espe.websocketsserver.repository.UsuarioRepository;
import ec.edu.espe.websocketsserver.repository.VendedorRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final RoleEntityRepository roleEntityRepository;
    private final PasswordEncoder passwordEncoder;
    private final CompradorRepository compradorRepository;
    private final VendedorRepository vendedorRepository;

    public UsuarioService(
            UsuarioRepository usuarioRepository, 
            RoleEntityRepository roleEntityRepository, 
            PasswordEncoder passwordEncoder,
            CompradorRepository compradorRepository,
            VendedorRepository vendedorRepository) {
        this.usuarioRepository = usuarioRepository;
        this.roleEntityRepository = roleEntityRepository;
        this.passwordEncoder = passwordEncoder;
        this.compradorRepository = compradorRepository;
        this.vendedorRepository = vendedorRepository;
    }

    // Crear usuario con asignación de rol
    @Transactional
    public UsuarioEntity crearUsuario(UsuarioEntity usuario, String rolNombre) {
        RoleEntity rol = roleEntityRepository.findByNombre(rolNombre)
                .orElseThrow(() -> new RuntimeException("Rol no válido"));

        // Encriptar la contraseña antes de guardar
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        usuario.setRol(rol);
        usuario.setStatus("ACTIVO");
        
        // Guardar el usuario
        UsuarioEntity usuarioGuardado = usuarioRepository.save(usuario);
        
        // Crear la entidad correspondiente según el rol
        if ("COMPRADOR".equals(rolNombre)) {
            CompradorEntity comprador = new CompradorEntity();
            comprador.setUsuario(usuarioGuardado);
            comprador.setStatus("ACTIVO");
            compradorRepository.save(comprador);
        } else if ("VENDEDOR".equals(rolNombre)) {
            VendedorEntity vendedor = new VendedorEntity();
            vendedor.setUsuario(usuarioGuardado);
            vendedor.setStatus("ACTIVO");
            vendedorRepository.save(vendedor);
        }
        
        return usuarioGuardado;
    }

    // Listar usuarios
    public List<UsuarioEntity> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    // Editar usuario con posibilidad de cambiar rol
    @Transactional
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
        if (rolNombre != null && !rolNombre.isEmpty() && !rolNombre.equals(usuario.getRol().getNombre())) {
            RoleEntity nuevoRol = roleEntityRepository.findByNombre(rolNombre)
                    .orElseThrow(() -> new RuntimeException("Rol no válido"));
            
            // Si el rol cambia, actualizar las entidades correspondientes
            if ("COMPRADOR".equals(usuario.getRol().getNombre())) {
                // Eliminar comprador si existe
                compradorRepository.findAll().stream()
                    .filter(c -> c.getUsuario() != null && c.getUsuario().getId().equals(id))
                    .findFirst()
                    .ifPresent(c -> {
                        c.setStatus("INACTIVO");
                        compradorRepository.save(c);
                    });
            } else if ("VENDEDOR".equals(usuario.getRol().getNombre())) {
                // Eliminar vendedor si existe
                vendedorRepository.findAll().stream()
                    .filter(v -> v.getUsuario() != null && v.getUsuario().getId().equals(id))
                    .findFirst()
                    .ifPresent(v -> {
                        v.setStatus("INACTIVO");
                        vendedorRepository.save(v);
                    });
            }
            
            // Crear la nueva entidad según el nuevo rol
            if ("COMPRADOR".equals(rolNombre)) {
                CompradorEntity comprador = new CompradorEntity();
                comprador.setUsuario(usuario);
                comprador.setStatus("ACTIVO");
                compradorRepository.save(comprador);
            } else if ("VENDEDOR".equals(rolNombre)) {
                VendedorEntity vendedor = new VendedorEntity();
                vendedor.setUsuario(usuario);
                vendedor.setStatus("ACTIVO");
                vendedorRepository.save(vendedor);
            }
            
            usuario.setRol(nuevoRol);
        }

        return usuarioRepository.save(usuario);
    }

    // Eliminar usuario (Lógica)
    @Transactional
    public void eliminarUsuario(Long id) {
        UsuarioEntity usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Eliminar entidades relacionadas
        if ("COMPRADOR".equals(usuario.getRol().getNombre())) {
            compradorRepository.findAll().stream()
                .filter(c -> c.getUsuario() != null && c.getUsuario().getId().equals(id))
                .findFirst()
                .ifPresent(c -> {
                    c.setStatus("INACTIVO");
                    compradorRepository.save(c);
                });
        } else if ("VENDEDOR".equals(usuario.getRol().getNombre())) {
            vendedorRepository.findAll().stream()
                .filter(v -> v.getUsuario() != null && v.getUsuario().getId().equals(id))
                .findFirst()
                .ifPresent(v -> {
                    v.setStatus("INACTIVO");
                    vendedorRepository.save(v);
                });
        }

        usuario.setStatus("INACTIVO"); // Eliminación lógica
        usuarioRepository.save(usuario);
    }
}