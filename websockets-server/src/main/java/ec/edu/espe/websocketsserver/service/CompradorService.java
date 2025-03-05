package ec.edu.espe.websocketsserver.service;

import ec.edu.espe.websocketsserver.entity.CompradorEntity;
import ec.edu.espe.websocketsserver.repository.CompradorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompradorService {
    private final CompradorRepository compradorRepository;

    public CompradorService(CompradorRepository compradorRepository) {
        this.compradorRepository = compradorRepository;
    }

    public CompradorEntity registrarComprador(CompradorEntity comprador) {
        return compradorRepository.save(comprador);
    }

    public List<CompradorEntity> listarCompradores() {
        return compradorRepository.findAll();
    }

    public void eliminarComprador(Long id) {
        CompradorEntity comprador = compradorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comprador no encontrado"));
        comprador.setStatus("INACTIVO"); // Eliminación lógica
        compradorRepository.save(comprador);
    }
}