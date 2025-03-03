package ec.edu.espe.websocketsserver.repository;

import ec.edu.espe.websocketsserver.entity.VehiculoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehiculoRepository extends JpaRepository<VehiculoEntity, Long> {
    List<VehiculoEntity> findByEstado(String estado);
}