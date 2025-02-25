package ec.edu.espe.websocketsserver.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "GP_ROL")
public class RoleEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ROL_ID")
    private Long id;

    @Column(name = "ROL_NOMBRE", unique = true)
    private String nombre;

    @Column(name = "ROL_STATUS")
    private String status = "ACTIVO"; // Estado lógico por defecto

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
