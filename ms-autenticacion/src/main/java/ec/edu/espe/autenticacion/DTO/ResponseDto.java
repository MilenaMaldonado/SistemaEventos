package ec.edu.espe.autenticacion.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor

public class ResponseDto {
    private String mensaje;
    private Object dato;
}
