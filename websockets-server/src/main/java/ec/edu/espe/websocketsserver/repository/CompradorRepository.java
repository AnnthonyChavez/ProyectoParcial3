package ec.edu.espe.websocketsserver.repository;

import ec.edu.espe.websocketsserver.entity.CompradorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompradorRepository extends JpaRepository<CompradorEntity, Long> {
}
