package ec.edu.espe.msreportes.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketVentaDTO {
    private Long reporteId;           // id del reporte que quieres actualizar (opcional, o algún identificador)
    private Double montoVenta;        // total venta de este ticket o grupo
    private Integer cantidadTickets;  // cantidad de tickets vendidos
    private LocalDate fechaEvento;    // fecha del evento al que pertenece
}

