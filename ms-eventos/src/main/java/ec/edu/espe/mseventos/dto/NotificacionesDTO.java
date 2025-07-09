package ec.edu.espe.mseventos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificacionesDTO {
    private String mensaje;
    private String tipo;
}
