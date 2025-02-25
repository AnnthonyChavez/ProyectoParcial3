package ec.edu.espe.websocketsserver.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "GP_USUARIO")
public class UsuarioEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USU_ID")
    private Long id;

    @Column(name = "USU_NOMBRE")
    private String nombre;

    @Column(name = "USU_EMAIL", unique = true)
    private String email;

    @Column(name = "USU_PASSWORD")
    private String password;

    @Column(name = "USU_STATUS")
    private String status = "ACTIVO"; // Por defecto activo

    @ManyToOne
    @JoinColumn(name = "ROL_ID", referencedColumnName = "ROL_ID")
    private RoleEntity rol;

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public RoleEntity getRol() { return rol; }
    public void setRol(RoleEntity rol) { this.rol = rol; }
}
