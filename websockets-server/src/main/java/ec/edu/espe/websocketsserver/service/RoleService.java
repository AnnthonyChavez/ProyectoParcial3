package ec.edu.espe.websocketsserver.service;

import ec.edu.espe.websocketsserver.entity.RoleEntity;
import ec.edu.espe.websocketsserver.repository.RoleEntityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleService {
    private final RoleEntityRepository roleEntityRepository;

    public RoleService(RoleEntityRepository roleEntityRepository) {
        this.roleEntityRepository = roleEntityRepository;
    }

    // Crear un rol
    public RoleEntity crearRol(RoleEntity rol) {
        return roleEntityRepository.save(rol);
    }

    // Listar roles
    public List<RoleEntity> listarRoles() {
        return roleEntityRepository.findAll();
    }

    // Editar un rol
    public RoleEntity editarRol(Long id, RoleEntity rolActualizado) {
        RoleEntity rol = roleEntityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        rol.setNombre(rolActualizado.getNombre());
        return roleEntityRepository.save(rol);
    }

    // Eliminar un rol (Lógica)
    public void eliminarRol(Long id) {
        RoleEntity rol = roleEntityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        rol.setStatus("INACTIVO"); // Eliminación lógica
        roleEntityRepository.save(rol);
    }
}