package ec.edu.espe.websocketsserver.service;

import ec.edu.espe.websocketsserver.dto.SubastaResultadoDTO;
import ec.edu.espe.websocketsserver.entity.PujaEntity;
import ec.edu.espe.websocketsserver.entity.SubastaEntity;
import ec.edu.espe.websocketsserver.entity.SubastaVehiculoEntity;
import ec.edu.espe.websocketsserver.entity.VendedorEntity;
import ec.edu.espe.websocketsserver.exception.SubastaNotFoundException;
import ec.edu.espe.websocketsserver.exception.SubastaNoFinalizadaException;
import ec.edu.espe.websocketsserver.exception.VendedorNotFoundException;
import ec.edu.espe.websocketsserver.repository.PujaRepository;
import ec.edu.espe.websocketsserver.repository.SubastaRepository;
import ec.edu.espe.websocketsserver.repository.SubastaVehiculoRepository;
import ec.edu.espe.websocketsserver.repository.VendedorRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class SubastaService {
    private final SubastaRepository subastaRepository;
    private final VendedorRepository vendedorRepository;
    private final SubastaVehiculoRepository subastaVehiculoRepository;
    private final PujaRepository pujaRepository;

    public SubastaService(SubastaRepository subastaRepository, 
                         VendedorRepository vendedorRepository,
                         SubastaVehiculoRepository subastaVehiculoRepository,
                         PujaRepository pujaRepository) {
        this.subastaRepository = subastaRepository;
        this.vendedorRepository = vendedorRepository;
        this.subastaVehiculoRepository = subastaVehiculoRepository;
        this.pujaRepository = pujaRepository;
    }

    public SubastaEntity crearSubasta(SubastaEntity subasta) {
        // Obtener el email del usuario autenticado
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Buscar el vendedor asociado con ese email
        VendedorEntity vendedor = vendedorRepository.findByUsuarioEmail(email)
                .orElseThrow(() -> new VendedorNotFoundException("Vendedor no encontrado para el email: " + email));
        
        // Asignar el vendedor a la subasta
        subasta.setVendedor(vendedor);
        
        return subastaRepository.save(subasta);
    }

    public List<SubastaEntity> listarSubastas() {
        return subastaRepository.findAll();
    }

    public SubastaEntity editarSubasta(Long id, SubastaEntity subastaActualizada) {
        SubastaEntity subasta = subastaRepository.findById(id)
                .orElseThrow(() -> new SubastaNotFoundException("Subasta no encontrada con ID: " + id));
        subasta.setFechaInicio(subastaActualizada.getFechaInicio());
        subasta.setFechaFin(subastaActualizada.getFechaFin());
        subasta.setEstado(subastaActualizada.getEstado());
        return subastaRepository.save(subasta);
    }

    public void eliminarSubasta(Long id) {
        SubastaEntity subasta = subastaRepository.findById(id)
                .orElseThrow(() -> new SubastaNotFoundException("Subasta no encontrada con ID: " + id));
        subasta.setStatus("INACTIVO"); // Eliminación lógica
        subastaRepository.save(subasta);
    }

    public List<SubastaEntity> buscarSubastasPorFecha(LocalDateTime inicio, LocalDateTime fin) {
        return subastaRepository.findByFechaInicioBetween(inicio, fin);
    }
    
    public SubastaResultadoDTO obtenerResultadoSubasta(Long subastaId) {
        // Buscar la subasta
        SubastaEntity subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new SubastaNotFoundException("Subasta no encontrada con ID: " + subastaId));
        
        // Verificar que la subasta esté finalizada
        if (!"FINALIZADA".equals(subasta.getEstado())) {
            throw new SubastaNoFinalizadaException("La subasta con ID " + subastaId + " aún no ha finalizado");
        }
        
        // Crear el DTO de resultado
        SubastaResultadoDTO resultado = new SubastaResultadoDTO();
        resultado.setSubastaId(subasta.getId());
        resultado.setEstadoSubasta(subasta.getEstado());
        resultado.setFechaInicio(subasta.getFechaInicio());
        resultado.setFechaFin(subasta.getFechaFin());
        
        // Buscar los vehículos de la subasta
        List<SubastaVehiculoEntity> vehiculosEnSubasta = subastaVehiculoRepository.findBySubastaId(subastaId);
        if (vehiculosEnSubasta.isEmpty()) {
            throw new SubastaNotFoundException("No se encontraron vehículos para la subasta con ID: " + subastaId);
        }
        
        // Para simplificar, tomamos el primer vehículo de la subasta
        SubastaVehiculoEntity subastaVehiculo = vehiculosEnSubasta.get(0);
        
        // Establecer información del vehículo
        resultado.setVehiculoId(subastaVehiculo.getVehiculo().getId());
        resultado.setVehiculoMarca(subastaVehiculo.getVehiculo().getMarca());
        resultado.setVehiculoModelo(subastaVehiculo.getVehiculo().getModelo());
        resultado.setVehiculoAnio(subastaVehiculo.getVehiculo().getAnio());
        resultado.setVehiculoEstado(subastaVehiculo.getVehiculo().getEstado());
        resultado.setVehiculoPrecioBase(subastaVehiculo.getVehiculo().getPrecioBase());
        
        // Buscar la puja ganadora (la de mayor monto)
        List<PujaEntity> pujas = pujaRepository.findBySubastaVehiculoId(subastaVehiculo.getId());
        Optional<PujaEntity> pujaGanadora = pujas.stream()
                .max(Comparator.comparing(PujaEntity::getMonto));
        
        // Si hay una puja ganadora, establecer la información del ganador
        if (pujaGanadora.isPresent()) {
            PujaEntity puja = pujaGanadora.get();
            resultado.setGanadorEmail(puja.getComprador().getUsuario().getEmail());
            resultado.setGanadorNombre(puja.getComprador().getUsuario().getNombre());
            resultado.setMontoGanador(puja.getMonto());
        }
        
        return resultado;
    }
    
    public List<SubastaResultadoDTO> listarSubastasFinalizadas() {
        List<SubastaResultadoDTO> resultados = new ArrayList<>();
        
        // Buscar todas las subastas finalizadas
        List<SubastaEntity> subastasFinalizadas = subastaRepository.findByEstado("FINALIZADA");
        
        for (SubastaEntity subasta : subastasFinalizadas) {
            try {
                SubastaResultadoDTO resultado = obtenerResultadoSubasta(subasta.getId());
                resultados.add(resultado);
            } catch (Exception e) {
                // Si hay algún error al obtener el resultado de una subasta, continuamos con la siguiente
                System.out.println("Error al obtener resultado de subasta ID " + subasta.getId() + ": " + e.getMessage());
            }
        }
        
        return resultados;
    }
}