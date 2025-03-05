package ec.edu.espe.websocketsserver.service;

import ec.edu.espe.websocketsserver.entity.SubastaEntity;
import ec.edu.espe.websocketsserver.entity.SubastaVehiculoEntity;
import ec.edu.espe.websocketsserver.entity.VehiculoEntity;
import ec.edu.espe.websocketsserver.entity.VendedorEntity;
import ec.edu.espe.websocketsserver.exception.PermisoDenegadoException;
import ec.edu.espe.websocketsserver.exception.SubastaNotFoundException;
import ec.edu.espe.websocketsserver.exception.VehiculoNotFoundException;
import ec.edu.espe.websocketsserver.exception.VendedorNotFoundException;
import ec.edu.espe.websocketsserver.repository.SubastaRepository;
import ec.edu.espe.websocketsserver.repository.SubastaVehiculoRepository;
import ec.edu.espe.websocketsserver.repository.VehiculoRepository;
import ec.edu.espe.websocketsserver.repository.VendedorRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubastaVehiculoService {
    private final SubastaVehiculoRepository subastaVehiculoRepository;
    private final SubastaRepository subastaRepository;
    private final VehiculoRepository vehiculoRepository;
    private final VendedorRepository vendedorRepository;

    public SubastaVehiculoService(
            SubastaVehiculoRepository subastaVehiculoRepository,
            SubastaRepository subastaRepository,
            VehiculoRepository vehiculoRepository,
            VendedorRepository vendedorRepository) {
        this.subastaVehiculoRepository = subastaVehiculoRepository;
        this.subastaRepository = subastaRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.vendedorRepository = vendedorRepository;
    }

    public SubastaVehiculoEntity asociarVehiculoASubasta(SubastaVehiculoEntity subastaVehiculo) {
        // Obtener el email del usuario autenticado
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Buscar el vendedor asociado con ese email
        VendedorEntity vendedor = vendedorRepository.findByUsuarioEmail(email)
                .orElseThrow(() -> new VendedorNotFoundException("Vendedor no encontrado para el email: " + email));
        
        // Verificar que la subasta existe
        SubastaEntity subasta = subastaRepository.findById(subastaVehiculo.getSubasta().getId())
                .orElseThrow(() -> new SubastaNotFoundException("Subasta no encontrada con ID: " + subastaVehiculo.getSubasta().getId()));
        
        // Verificar que el vehículo existe
        VehiculoEntity vehiculo = vehiculoRepository.findById(subastaVehiculo.getVehiculo().getId())
                .orElseThrow(() -> new VehiculoNotFoundException("Vehículo no encontrado con ID: " + subastaVehiculo.getVehiculo().getId()));
        
        // Verificar que la subasta pertenece al vendedor autenticado
        if (!subasta.getVendedor().getId().equals(vendedor.getId())) {
            throw new PermisoDenegadoException("No tienes permiso para asociar vehículos a esta subasta");
        }
        
        // Verificar que el vehículo pertenece al vendedor autenticado
        if (!vehiculo.getVendedor().getId().equals(vendedor.getId())) {
            throw new PermisoDenegadoException("No tienes permiso para asociar este vehículo");
        }
        
        // Establecer la subasta y el vehículo completos
        subastaVehiculo.setSubasta(subasta);
        subastaVehiculo.setVehiculo(vehiculo);
        
        // Guardar la asociación
        return subastaVehiculoRepository.save(subastaVehiculo);
    }

    public List<SubastaVehiculoEntity> listarVehiculosEnSubasta(Long subastaId) {
        if (subastaId == null) {
            return subastaVehiculoRepository.findAll();
        }
        return subastaVehiculoRepository.findBySubastaId(subastaId);
    }

    public void eliminarAsociacion(Long id) {
        SubastaVehiculoEntity subastaVehiculo = subastaVehiculoRepository.findById(id)
                .orElseThrow(() -> new SubastaNotFoundException("Asociación subasta-vehículo no encontrada con ID: " + id));
        subastaVehiculo.setStatus("INACTIVO"); // Eliminación lógica
        subastaVehiculoRepository.save(subastaVehiculo);
    }
}