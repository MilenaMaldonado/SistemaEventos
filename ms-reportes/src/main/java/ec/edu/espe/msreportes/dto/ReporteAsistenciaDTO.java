package ec.edu.espe.msreportes.dto;


import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteAsistenciaDTO {
    private String message;
    private EventoAsistenciaDTO evento;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class EventoAsistenciaDTO {
    private Long eventoId;
    private String nombre;
    private Integer ticketsVendidos;
    private Integer asistenciasRegistradas;
    private Double porcentajeAsistencia;
}
