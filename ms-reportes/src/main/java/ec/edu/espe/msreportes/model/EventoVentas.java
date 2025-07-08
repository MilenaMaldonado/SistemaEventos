package ec.edu.espe.msreportes.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Objects;

@Entity
@Table(name = "evento_ventas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventoVentas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long eventoId;

    private String nombre;

    private String ciudad;

    private String establecimiento;

    private LocalDate fecha;

    private LocalTime hora;

    private Integer capacidad;

    private Double ventas; // si lo necesitas, opcional
}
