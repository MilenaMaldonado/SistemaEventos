package ec.edu.espe.msreportes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventoColaDTO {
    private Long idEvento;
    private String nombre;
    private String ciudad;
    private String establecimiento;
    private LocalDate fecha;
    private LocalTime hora;
    private Integer capacidad;
    private String operacion;  // Ejemplo: "CREAR", "EDITAR", "ELIMINAR"
}
