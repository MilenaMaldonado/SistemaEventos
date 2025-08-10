package ec.edu.espe.mseventos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventoColaDTO {
    private Long idEvento;
    private Integer capacidad;
    private String operacion;
}
