package com.encuentro.tickets.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categoria_ticket")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCategoria;

    private String nombreCategoria;

    private int capacidadCategoria;

    private Long idEvento;
}
