package ec.edu.espe.websocketsserver.repository;

import ec.edu.espe.websocketsserver.entity.CompradorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompradorRepository extends JpaRepository<CompradorEntity, Long> {
    
    @Query("SELECT c FROM CompradorEntity c JOIN c.usuario u WHERE u.email = :email")
    Optional<CompradorEntity> findByUsuarioEmail(@Param("email") String email);
}
