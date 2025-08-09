package ec.edu.espe.msreportes.Listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import ec.edu.espe.msreportes.dto.TicketVentaDTO;
import ec.edu.espe.msreportes.model.ReporteVentas;
import ec.edu.espe.msreportes.repository.ReporteVentasRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class TicketsListener {

    private final ObjectMapper objectMapper;
    private final ReporteVentasRepository reporteVentasRepository;

    @RabbitListener(queues = "tickets.cola")
    public void recibirTicketVenta(String mensajeJson) {
        try {
            TicketVentaDTO ticketDTO = objectMapper.readValue(mensajeJson, TicketVentaDTO.class);

            // Por ejemplo, buscar el reporte por fecha del evento
            Optional<ReporteVentas> reporteOptional = reporteVentasRepository.findByFechaEvento(ticketDTO.getFechaEvento());

            if (reporteOptional.isPresent()) {
                ReporteVentas reporte = reporteOptional.get();

                // Actualizar totales, sumando o asignando directamente (ajusta según lógica)
                Double totalVentasActual = reporte.getTotalVentas() != null ? reporte.getTotalVentas() : 0.0;
                Integer ticketsVendidosActual = reporte.getTicketsVendidos() != null ? reporte.getTicketsVendidos() : 0;

                reporte.setTotalVentas(totalVentasActual + ticketDTO.getMontoVenta());
                reporte.setTicketsVendidos(ticketsVendidosActual + ticketDTO.getCantidadTickets());

                reporteVentasRepository.save(reporte);

                System.out.println("Reporte actualizado con nueva venta: " + ticketDTO.getMontoVenta());
            } else {
                // Si no existe reporte, crea uno nuevo con datos mínimos
                ReporteVentas nuevoReporte = new ReporteVentas();
                nuevoReporte.setFechaEvento(ticketDTO.getFechaEvento());
                nuevoReporte.setTotalVentas(ticketDTO.getMontoVenta());
                nuevoReporte.setTicketsVendidos(ticketDTO.getCantidadTickets());
                // Inicializa lista eventos si es necesario
                reporteVentasRepository.save(nuevoReporte);

                System.out.println("Nuevo reporte creado para fecha: " + ticketDTO.getFechaEvento());
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
