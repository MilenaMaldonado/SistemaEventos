package ec.edu.espe.mseventos.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class EventoDTO {
    @NotBlank(message = "El nombre del evento es obligatorio")
    private String nombre;
    
    @NotNull(message = "El ID de la ciudad es obligatorio")
    private Long idCiudad;
    
    @NotBlank(message = "El establecimiento es obligatorio")
    private String establecimiento;
    
    @NotNull(message = "La fecha del evento es obligatoria")
    @Future(message = "La fecha del evento debe ser futura")
    private LocalDate fecha;
    
    @NotNull(message = "La hora del evento es obligatoria")
    private LocalTime hora;
    
    @NotNull(message = "La capacidad es obligatoria")
    @Min(value = 1, message = "La capacidad debe ser mayor a 0")
    @Max(value = 10000, message = "La capacidad no puede exceder 10000")
    private Integer capacidad;
    
    @NotBlank(message = "La URL de la imagen es obligatoria")
    private String imagenUrl;
}
