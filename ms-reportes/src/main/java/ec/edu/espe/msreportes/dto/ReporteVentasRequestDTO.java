package ec.edu.espe.msreportes.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ReporteVentasRequestDTO {
    
    @NotNull(message = "El total de ventas es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El total de ventas debe ser mayor a 0")
    private Double totalVentas;
    
    @NotNull(message = "Los tickets vendidos son obligatorios")
    @Min(value = 0, message = "Los tickets vendidos no pueden ser negativos")
    private Integer ticketsVendidos;
    
    @NotNull(message = "La fecha del evento es obligatoria")
    private LocalDate fechaEvento;
}