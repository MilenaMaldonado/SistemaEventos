package com.encuentro.tickets.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MetricasDTO {
    private Long totalTickets;
    private Long totalFacturas;
    private BigDecimal totalIngresos;
    private String periodo;
}