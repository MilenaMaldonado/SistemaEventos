package ec.edu.espe.msreportes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ResponseDto {
    private String mensaje;
    private Object respuesta;
}