package com.encuentro.tickets.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ticket_categoria")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(TicketCategoriaId.class)
public class TicketCategoria {

    @Id
    private Long idTicketCliente;

    @Id
    private Long idCategoria;

    private String asiento;
}
