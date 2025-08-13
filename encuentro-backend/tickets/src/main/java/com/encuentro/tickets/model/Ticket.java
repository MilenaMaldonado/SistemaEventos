package com.encuentro.tickets.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ticket")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ticket {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "id_evento", referencedColumnName = "idEvento")
    private EventoDisponible evento;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    private Asiento asiento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_factura")
    private Factura factura;

    @Column(nullable = false)
    private Instant purchasedAt;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precioUnitario;
}
