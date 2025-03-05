package ec.edu.espe.websocketsserver.service;

import ec.edu.espe.websocketsserver.entity.PujaEntity;
import ec.edu.espe.websocketsserver.repository.PujaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PujaService {
    private final PujaRepository pujaRepository;

    public PujaService(PujaRepository pujaRepository) {
        this.pujaRepository = pujaRepository;
    }

    public PujaEntity realizarPuja(PujaEntity puja) {
        return pujaRepository.save(puja);
    }

    public List<PujaEntity> listarPujas(Long subastaVehiculoId) {
        return pujaRepository.findBySubastaVehiculoId(subastaVehiculoId);
    }

    public void eliminarPuja(Long id) {
        PujaEntity puja = pujaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Puja no encontrada"));
        puja.setStatus("INACTIVO"); // Eliminación lógica
        pujaRepository.save(puja);
    }
}
