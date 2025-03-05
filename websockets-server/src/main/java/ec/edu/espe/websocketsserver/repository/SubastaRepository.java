package ec.edu.espe.websocketsserver.repository;

import ec.edu.espe.websocketsserver.entity.SubastaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SubastaRepository extends JpaRepository<SubastaEntity, Long> {
    List<SubastaEntity> findByFechaInicioBetween(LocalDateTime inicio, LocalDateTime fin);
    List<SubastaEntity> findByEstado(String estado);
}