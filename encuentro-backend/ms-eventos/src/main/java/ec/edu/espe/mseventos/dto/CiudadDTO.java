package ec.edu.espe.mseventos.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CiudadDTO {
    @NotBlank(message = "El nombre de la ciudad es obligatorio")
    private String nombre;
}
