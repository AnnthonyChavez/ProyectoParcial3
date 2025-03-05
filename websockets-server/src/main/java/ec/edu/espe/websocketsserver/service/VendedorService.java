package ec.edu.espe.websocketsserver.service;

import ec.edu.espe.websocketsserver.entity.VendedorEntity;
import ec.edu.espe.websocketsserver.repository.VendedorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VendedorService {
    private final VendedorRepository vendedorRepository;

    public VendedorService(VendedorRepository vendedorRepository) {
        this.vendedorRepository = vendedorRepository;
    }

    public VendedorEntity registrarVendedor(VendedorEntity vendedor) {
        return vendedorRepository.save(vendedor);
    }

    public List<VendedorEntity> listarVendedores() {
        return vendedorRepository.findAll();
    }

    public void eliminarVendedor(Long id) {
        VendedorEntity vendedor = vendedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendedor no encontrado"));
        vendedor.setStatus("INACTIVO"); // Eliminación lógica
        vendedorRepository.save(vendedor);
    }
}