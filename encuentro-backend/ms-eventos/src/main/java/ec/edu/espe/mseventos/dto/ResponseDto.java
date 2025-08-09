package ec.edu.espe.mseventos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ResponseDto {
    private String mensaje;
    private Object respuesta;
}