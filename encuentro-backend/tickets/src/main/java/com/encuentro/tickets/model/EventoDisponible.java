package com.encuentro.tickets.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

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
