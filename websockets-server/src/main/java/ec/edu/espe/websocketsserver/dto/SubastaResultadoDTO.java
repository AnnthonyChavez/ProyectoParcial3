package ec.edu.espe.websocketsserver.dto;

import java.time.LocalDateTime;

public class SubastaResultadoDTO {
    private Long subastaId;
    private String estadoSubasta;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private String ganadorEmail;
    private String ganadorNombre;
    private Double montoGanador;
    private Long vehiculoId;
    private String vehiculoMarca;
    private String vehiculoModelo;
    private Integer vehiculoAnio;
    private String vehiculoEstado;
    private Double vehiculoPrecioBase;

    // Constructor vacío
    public SubastaResultadoDTO() {
    }

    // Getters y Setters
    public Long getSubastaId() {
        return subastaId;
    }

    public void setSubastaId(Long subastaId) {
        this.subastaId = subastaId;
    }

    public String getEstadoSubasta() {
        return estadoSubasta;
    }

    public void setEstadoSubasta(String estadoSubasta) {
        this.estadoSubasta = estadoSubasta;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDateTime getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDateTime fechaFin) {
        this.fechaFin = fechaFin;
    }

    public String getGanadorEmail() {
        return ganadorEmail;
    }

    public void setGanadorEmail(String ganadorEmail) {
        this.ganadorEmail = ganadorEmail;
    }

    public String getGanadorNombre() {
        return ganadorNombre;
    }

    public void setGanadorNombre(String ganadorNombre) {
        this.ganadorNombre = ganadorNombre;
    }

    public Double getMontoGanador() {
        return montoGanador;
    }

    public void setMontoGanador(Double montoGanador) {
        this.montoGanador = montoGanador;
    }

    public Long getVehiculoId() {
        return vehiculoId;
    }

    public void setVehiculoId(Long vehiculoId) {
        this.vehiculoId = vehiculoId;
    }

    public String getVehiculoMarca() {
        return vehiculoMarca;
    }

    public void setVehiculoMarca(String vehiculoMarca) {
        this.vehiculoMarca = vehiculoMarca;
    }

    public String getVehiculoModelo() {
        return vehiculoModelo;
    }

    public void setVehiculoModelo(String vehiculoModelo) {
        this.vehiculoModelo = vehiculoModelo;
    }

    public Integer getVehiculoAnio() {
        return vehiculoAnio;
    }

    public void setVehiculoAnio(Integer vehiculoAnio) {
        this.vehiculoAnio = vehiculoAnio;
    }

    public String getVehiculoEstado() {
        return vehiculoEstado;
    }

    public void setVehiculoEstado(String vehiculoEstado) {
        this.vehiculoEstado = vehiculoEstado;
    }

    public Double getVehiculoPrecioBase() {
        return vehiculoPrecioBase;
    }

    public void setVehiculoPrecioBase(Double vehiculoPrecioBase) {
        this.vehiculoPrecioBase = vehiculoPrecioBase;
    }
} 