package ec.edu.espe.websocketsserver.service;

import ec.edu.espe.websocketsserver.entity.VehiculoEntity;
import ec.edu.espe.websocketsserver.entity.VendedorEntity;
import ec.edu.espe.websocketsserver.exception.PermisoDenegadoException;
import ec.edu.espe.websocketsserver.exception.VehiculoNotFoundException;
import ec.edu.espe.websocketsserver.exception.VendedorNotFoundException;
import ec.edu.espe.websocketsserver.repository.VehiculoRepository;
import ec.edu.espe.websocketsserver.repository.VendedorRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehiculoService {
    private final VehiculoRepository vehiculoRepository;
    private final VendedorRepository vendedorRepository;

    public VehiculoService(VehiculoRepository vehiculoRepository, VendedorRepository vendedorRepository) {
        this.vehiculoRepository = vehiculoRepository;
        this.vendedorRepository = vendedorRepository;
    }

    // Crear vehículo
    public VehiculoEntity crearVehiculo(VehiculoEntity vehiculo) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        VendedorEntity vendedor = vendedorRepository.findByUsuarioEmail(email)
                .orElseThrow(() -> new VendedorNotFoundException("Vendedor no encontrado para el email: " + email));
        
        vehiculo.setVendedor(vendedor);
        return vehiculoRepository.save(vehiculo);
    }

    // Listar vehículos
    public List<VehiculoEntity> listarVehiculos() {
        return vehiculoRepository.findAll();
    }

    // Editar vehículo
    public VehiculoEntity editarVehiculo(Long id, VehiculoEntity vehiculoActualizado) {
        VehiculoEntity vehiculo = vehiculoRepository.findById(id)
                .orElseThrow(() -> new VehiculoNotFoundException("Vehículo no encontrado con ID: " + id));

        // Verificar que el vendedor actual sea el dueño del vehículo
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        VendedorEntity vendedorActual = vendedorRepository.findByUsuarioEmail(email)
                .orElseThrow(() -> new VendedorNotFoundException("Vendedor no encontrado para el email: " + email));

        if (!vehiculo.getVendedor().getId().equals(vendedorActual.getId())) {
            throw new PermisoDenegadoException("No tienes permiso para editar este vehículo");
        }

        vehiculo.setMarca(vehiculoActualizado.getMarca());
        vehiculo.setModelo(vehiculoActualizado.getModelo());
        vehiculo.setAnio(vehiculoActualizado.getAnio());
        vehiculo.setPrecioBase(vehiculoActualizado.getPrecioBase());
        vehiculo.setEstado(vehiculoActualizado.getEstado());

        return vehiculoRepository.save(vehiculo);
    }

    // Eliminar vehículo (Lógica)
    public void eliminarVehiculo(Long id) {
        VehiculoEntity vehiculo = vehiculoRepository.findById(id)
                .orElseThrow(() -> new VehiculoNotFoundException("Vehículo no encontrado con ID: " + id));

        // Verificar que el vendedor actual sea el dueño del vehículo
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        VendedorEntity vendedorActual = vendedorRepository.findByUsuarioEmail(email)
                .orElseThrow(() -> new VendedorNotFoundException("Vendedor no encontrado para el email: " + email));

        if (!vehiculo.getVendedor().getId().equals(vendedorActual.getId())) {
            throw new PermisoDenegadoException("No tienes permiso para eliminar este vehículo");
        }

        vehiculo.setStatus("INACTIVO"); // Eliminación lógica
        vehiculoRepository.save(vehiculo);
    }
    
    // Actualizar estado del vehículo (para uso interno del sistema)
    public VehiculoEntity actualizarEstadoVehiculo(Long id, String nuevoEstado) {
        VehiculoEntity vehiculo = vehiculoRepository.findById(id)
                .orElseThrow(() -> new VehiculoNotFoundException("Vehículo no encontrado con ID: " + id));
        
        vehiculo.setEstado(nuevoEstado);
        return vehiculoRepository.save(vehiculo);
    }
}