package com.encuentro.tickets.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompraResponse {
    private UUID facturaId;
    private Long idEvento;
    private String nombre;
    private String apellido;
    private String cedula;
    private List<TicketInfo> tickets;
    private BigDecimal subtotal;
    private BigDecimal iva;
    private BigDecimal total;
    private Instant fechaCompra;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketInfo {
        private UUID ticketId;
        private Integer numeroAsiento;
        private BigDecimal precioUnitario;
    }
}