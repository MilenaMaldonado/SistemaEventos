package com.encuentro.tickets.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CategoriaTicketDTO {
    
    @NotBlank(message = "El nombre de la categoría es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    private String nombreCategoria;
    
    @NotNull(message = "La capacidad de la categoría es obligatoria")
    @Min(value = 1, message = "La capacidad debe ser mayor a 0")
    @Max(value = 10000, message = "La capacidad no puede exceder 10000")
    private Integer capacidadCategoria;
    
    @NotNull(message = "El ID del evento es obligatorio")
    private Long idEvento;
}