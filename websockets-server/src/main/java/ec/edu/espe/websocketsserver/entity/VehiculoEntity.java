package ec.edu.espe.websocketsserver.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "GP_VEHICULO")
public class VehiculoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "VEH_ID")
    private Long id;

    @Column(name = "VEH_MARCA")
    private String marca;

    @Column(name = "VEH_MODELO")
    private String modelo;

    @Column(name = "VEH_ANO")
    private int anio;

    @Column(name = "VEH_PRECIO_BASE")
    private double precioBase;

    @Column(name = "VEH_ESTADO")
    private String estado = "DISPONIBLE"; // Disponible, Subastado, Vendido

    @Column(name = "VEH_STATUS")
    private String status = "ACTIVO"; // Estado lógico por defecto

    @ManyToOne
    @JoinColumn(name = "VEN_ID", referencedColumnName = "VEN_ID")
    private VendedorEntity vendedor;

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }

    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }

    public int getAnio() { return anio; }
    public void setAnio(int anio) { this.anio = anio; }

    public double getPrecioBase() { return precioBase; }
    public void setPrecioBase(double precioBase) { this.precioBase = precioBase; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public VendedorEntity getVendedor() { return vendedor; }
    public void setVendedor(VendedorEntity vendedor) { this.vendedor = vendedor; }
}