package ec.edu.espe.websocketsserver.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "GP_SUBASTA_VEHICULO")
public class SubastaVehiculoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SUB_VEH_ID")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "SUB_ID", referencedColumnName = "SUB_ID", nullable = false)
    private SubastaEntity subasta;

    @ManyToOne
    @JoinColumn(name = "VEH_ID", referencedColumnName = "VEH_ID", nullable = false)
    private VehiculoEntity vehiculo;

    @Column(name = "SUB_VEH_STATUS", nullable = false)
    private String status = "ACTIVO"; // Estado lógico

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SubastaEntity getSubasta() { return subasta; }
    public void setSubasta(SubastaEntity subasta) { this.subasta = subasta; }

    public VehiculoEntity getVehiculo() { return vehiculo; }
    public void setVehiculo(VehiculoEntity vehiculo) { this.vehiculo = vehiculo; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
