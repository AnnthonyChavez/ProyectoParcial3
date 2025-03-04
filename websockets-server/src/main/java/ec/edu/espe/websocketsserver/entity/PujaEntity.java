package ec.edu.espe.websocketsserver.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "GP_PUJAS")
public class PujaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PUJ_ID")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "SUB_ID", referencedColumnName = "SUB_VEH_ID")
    private SubastaVehiculoEntity subastaVehiculo;

    @ManyToOne
    @JoinColumn(name = "COM_ID", referencedColumnName = "COM_ID")
    private CompradorEntity comprador;

    @Column(name = "PUJ_MONTO")
    private double monto;

    @Column(name = "PUJ_FECHA_HORA")
    private LocalDateTime fechaPuja;

    @Column(name = "PUJ_STATUS")
    private String status = "ACTIVO"; // Estado lógico

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SubastaVehiculoEntity getSubastaVehiculo() { return subastaVehiculo; }
    public void setSubastaVehiculo(SubastaVehiculoEntity subastaVehiculo) { this.subastaVehiculo = subastaVehiculo; }

    public CompradorEntity getComprador() { return comprador; }
    public void setComprador(CompradorEntity comprador) { this.comprador = comprador; }

    public double getMonto() { return monto; }
    public void setMonto(double monto) { this.monto = monto; }

    public LocalDateTime getFechaPuja() { return fechaPuja; }
    public void setFechaPuja(LocalDateTime fechaPuja) { this.fechaPuja = fechaPuja; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
