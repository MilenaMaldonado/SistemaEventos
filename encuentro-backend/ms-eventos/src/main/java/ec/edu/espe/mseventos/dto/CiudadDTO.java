package ec.edu.espe.mseventos.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CiudadDTO {
    private Long id;
    
    @NotBlank(message = "El nombre de la ciudad es obligatorio")
    private String nombre;
}
