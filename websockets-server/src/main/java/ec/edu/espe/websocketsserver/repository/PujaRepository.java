package ec.edu.espe.websocketsserver.repository;

import ec.edu.espe.websocketsserver.entity.PujaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PujaRepository extends JpaRepository<PujaEntity, Long> {
    List<PujaEntity> findBySubastaVehiculoId(Long subastaVehiculoId);
}
