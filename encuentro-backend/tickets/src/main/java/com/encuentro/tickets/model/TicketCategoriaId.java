package com.encuentro.tickets.model;

import lombok.*;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketCategoriaId implements Serializable {
    private Long idTicketCliente;
    private Long idCategoria;
}
