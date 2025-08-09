package ec.edu.espe.msreportes.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventoVentasDTO {
    private Long eventoId;
    private String nombre;
    private Double ventas;
}
