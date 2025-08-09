package com.encuentro.tickets.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventoColaDTO {
    private Long idEvento;
    private Integer capacidad;
}