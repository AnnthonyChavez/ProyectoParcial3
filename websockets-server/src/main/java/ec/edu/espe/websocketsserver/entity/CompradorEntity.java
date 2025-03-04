package ec.edu.espe.websocketsserver.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "GP_COMPRADOR")
public class CompradorEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "COM_ID")
    private Long id;

    @OneToOne
    @JoinColumn(name = "USU_ID", referencedColumnName = "USU_ID")
    private UsuarioEntity usuario;

    @Column(name = "COM_STATUS")
    private String status = "ACTIVO"; // Estado lógico

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UsuarioEntity getUsuario() { return usuario; }
    public void setUsuario(UsuarioEntity usuario) { this.usuario = usuario; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
