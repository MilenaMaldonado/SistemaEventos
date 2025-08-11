package com.encuentro.tickets.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "asiento",
        uniqueConstraints = @UniqueConstraint(columnNames = {"id_evento","numero"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Asiento {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "id_evento", referencedColumnName = "idEvento")
    private EventoDisponible evento;

    @Column(nullable = false)
    private Integer numero; // 1..capacidad

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeatStatus estado;

    private Instant holdUntil; // si HOLD, cuándo expira

    @Version
    private long version;
}
