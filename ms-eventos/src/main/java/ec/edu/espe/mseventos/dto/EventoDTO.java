package ec.edu.espe.mseventos.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class EventoDTO {
    private String nombre;
    private Long idCiudad;         // Solo el ID de la ciudad
    private String establecimiento;
    private LocalDate fecha;
    private LocalTime hora;
    private Integer capacidad;
    private String imagenUrl;
}
