package ec.edu.espe.msreportes.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "reporte_ventas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteVentas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double totalVentas;

    private Integer ticketsVendidos;

    @Column(name = "fecha_evento")
    private LocalDate fechaEvento;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "reporte_ventas_id")
    private List<EventoVentas> eventosDestacados;
}
