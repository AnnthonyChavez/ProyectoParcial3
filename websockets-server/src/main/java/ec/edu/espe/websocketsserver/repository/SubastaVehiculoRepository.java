package ec.edu.espe.websocketsserver.repository;

import ec.edu.espe.websocketsserver.entity.SubastaVehiculoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubastaVehiculoRepository extends JpaRepository<SubastaVehiculoEntity, Long> {
    List<SubastaVehiculoEntity> findBySubastaId(Long subastaId);
}