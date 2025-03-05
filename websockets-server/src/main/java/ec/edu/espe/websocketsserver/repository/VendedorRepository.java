package ec.edu.espe.websocketsserver.repository;

import ec.edu.espe.websocketsserver.entity.VendedorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VendedorRepository extends JpaRepository<VendedorEntity, Long> {
    Optional<VendedorEntity> findByUsuarioEmail(String email);
}