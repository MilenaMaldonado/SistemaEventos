package com.encuentro.tickets.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class EventoDisponibleDTO {
    
    @NotNull(message = "El ID del evento es obligatorio")
    private Long idEvento;
    
    @NotNull(message = "La capacidad es obligatoria")
    @Min(value = 1, message = "La capacidad debe ser mayor a 0")
    @Max(value = 10000, message = "La capacidad no puede exceder 10000")
    private Integer capacidad;
}