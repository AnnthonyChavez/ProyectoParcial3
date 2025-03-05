package ec.edu.espe.websocketsserver.dto;

public class PujaDTO {
    private Long subastaId;
    private String comprador;
    private double monto;

    public PujaDTO(Long subastaId, String comprador, double monto) {
        this.subastaId = subastaId;
        this.comprador = comprador;
        this.monto = monto;
    }

    public Long getSubastaId() { return subastaId; }
    public void setSubastaId(Long subastaId) { this.subastaId = subastaId; }

    public String getComprador() { return comprador; }
    public void setComprador(String comprador) { this.comprador = comprador; }

    public double getMonto() { return monto; }
    public void setMonto(double monto) { this.monto = monto; }
}