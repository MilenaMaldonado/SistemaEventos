package ec.edu.espe.msreportes.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteVentasDTO {
    private Double totalVentas;
    private Integer ticketsVendidos;
    private LocalDate fechaEvento;
    private List<EventoVentasDTO> eventosDestacados;
}
