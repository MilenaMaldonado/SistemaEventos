package com.encuentro.tickets.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketCategoriaDTO {
    
    @NotNull(message = "El ID del ticket cliente es obligatorio")
    private Long idTicketCliente;
    
    @NotNull(message = "El ID de la categoría es obligatorio")
    private Long idCategoria;
    
    @NotBlank(message = "El asiento es obligatorio")
    private String asiento;
}