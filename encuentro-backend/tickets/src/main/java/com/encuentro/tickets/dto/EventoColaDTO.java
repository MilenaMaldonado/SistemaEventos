package com.encuentro.tickets.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventoColaDTO {
    private Long idEvento;
    private Integer capacidad;
    private String operacion;
    private BigDecimal precio;
}