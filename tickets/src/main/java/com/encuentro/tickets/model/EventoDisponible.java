package com.encuentro.tickets.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "evento_disponible")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventoDisponible {

    @Id
    private Long idEvento;

    private int capacidad;
}
