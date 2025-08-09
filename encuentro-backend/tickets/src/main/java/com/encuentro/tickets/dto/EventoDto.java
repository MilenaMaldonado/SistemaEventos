package com.encuentro.tickets.dto;

import lombok.Data;
@Data
public class EventoDto {
        private Long idEvento;
        private String nombre;
        private String ciudad;
        private String direccion;
        private String fecha;
        private int capacidad;
}
