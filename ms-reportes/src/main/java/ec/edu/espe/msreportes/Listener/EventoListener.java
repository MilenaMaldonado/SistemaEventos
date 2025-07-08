package ec.edu.espe.msreportes.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import ec.edu.espe.msreportes.dto.EventoColaDTO;
import ec.edu.espe.msreportes.model.EventoVentas;
import ec.edu.espe.msreportes.model.ReporteVentas;
import ec.edu.espe.msreportes.repository.ReporteVentasRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class EventoListener {

    private final ObjectMapper objectMapper;
    private final ReporteVentasRepository reporteVentasRepository;

    @RabbitListener(queues = "eventos.cola")
    public void recibirEvento(String mensajeJson) {
        try {
            EventoColaDTO eventoDTO = objectMapper.readValue(mensajeJson, EventoColaDTO.class);

            switch (eventoDTO.getOperacion().toUpperCase()) {
                case "CREAR":
                    manejarCrear(eventoDTO);
                    break;
                case "EDITAR":
                    manejarEditar(eventoDTO);
                    break;
                case "ELIMINAR":
                    manejarEliminar(eventoDTO.getIdEvento());
                    break;
                default:
                    System.out.println("Operación desconocida: " + eventoDTO.getOperacion());
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void manejarCrear(EventoColaDTO dto) {
        EventoVentas evento = mapToEventoVentas(dto);

        ReporteVentas reporte = new ReporteVentas();
        reporte.setTotalVentas(0.0);
        reporte.setTicketsVendidos(0);
        reporte.setFechaEvento(dto.getFecha());
        reporte.setEventosDestacados(List.of(evento));

        reporteVentasRepository.save(reporte);
        System.out.println("Evento creado en reporte: " + dto.getNombre());
    }

    private void manejarEditar(EventoColaDTO dto) {
        Optional<ReporteVentas> optionalReporte = reporteVentasRepository.findByFechaEvento(dto.getFecha());
        if (optionalReporte.isPresent()) {
            ReporteVentas reporte = optionalReporte.get();
            List<EventoVentas> eventos = reporte.getEventosDestacados();

            boolean encontrado = false;
            for (EventoVentas e : eventos) {
                if (e.getEventoId().equals(dto.getIdEvento())) {
                    e.setNombre(dto.getNombre());
                    e.setCapacidad(dto.getCapacidad());
                    e.setCiudad(dto.getCiudad());
                    e.setEstablecimiento(dto.getEstablecimiento());
                    e.setFecha(dto.getFecha());
                    e.setHora(dto.getHora());
                    encontrado = true;
                    break;
                }
            }
            if (!encontrado) {
                eventos.add(mapToEventoVentas(dto));
            }
            reporteVentasRepository.save(reporte);
            System.out.println("Evento editado en reporte: " + dto.getNombre());
        } else {
            manejarCrear(dto);
        }
    }

    private void manejarEliminar(Long idEvento) {
        List<ReporteVentas> reportes = reporteVentasRepository.findAll();

        for (ReporteVentas reporte : reportes) {
            List<EventoVentas> eventos = reporte.getEventosDestacados();
            boolean removed = eventos.removeIf(e -> e.getEventoId().equals(idEvento));
            if (removed) {
                reporteVentasRepository.save(reporte);
                System.out.println("Evento eliminado de reporte: ID " + idEvento);
                break;
            }
        }
    }

    private EventoVentas mapToEventoVentas(EventoColaDTO dto) {
        EventoVentas evento = new EventoVentas();
        evento.setEventoId(dto.getIdEvento());
        evento.setNombre(dto.getNombre());
        evento.setCiudad(dto.getCiudad());
        evento.setEstablecimiento(dto.getEstablecimiento());
        evento.setFecha(dto.getFecha());
        evento.setHora(dto.getHora());
        evento.setCapacidad(dto.getCapacidad());
        return evento;
    }
}
