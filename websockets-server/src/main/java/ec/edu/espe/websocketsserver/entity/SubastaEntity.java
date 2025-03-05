package ec.edu.espe.websocketsserver.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "GP_SUBASTA")
public class SubastaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SUB_ID")
    private Long id;

    @Column(name = "SUB_FECHA_INICIO")
    private LocalDateTime fechaInicio;

    @Column(name = "SUB_FECHA_FIN")
    private LocalDateTime fechaFin;

    @Column(name = "SUB_ESTADO")
    private String estado = "ACTIVA"; // Activa, Finalizada, Cancelada

    @Column(name = "SUB_STATUS")
    private String status = "ACTIVO"; // Estado lógico

    @ManyToOne
    @JoinColumn(name = "VEN_ID", referencedColumnName = "VEN_ID")
    private VendedorEntity vendedor;

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDateTime fechaInicio) { this.fechaInicio = fechaInicio; }

    public LocalDateTime getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDateTime fechaFin) { this.fechaFin = fechaFin; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public VendedorEntity getVendedor() { return vendedor; }
    public void setVendedor(VendedorEntity vendedor) { this.vendedor = vendedor; }
}
