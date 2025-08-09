package ec.edu.espe.msreportes.service;

import ec.edu.espe.msreportes.dto.EventoColaDTO;
import ec.edu.espe.msreportes.model.EventoVentas;
import ec.edu.espe.msreportes.model.ReporteVentas;
import ec.edu.espe.msreportes.repository.ReporteVentasRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReporteService {

    private final ReporteVentasRepository reporteVentasRepository;

    public ReporteVentas crearReporte(ReporteVentas reporte) {
        // Guardar reporte nuevo
        return reporteVentasRepository.save(reporte);
    }

    public List<ReporteVentas> listarReportes() {
        return reporteVentasRepository.findAll();
    }

    public Optional<ReporteVentas> obtenerReportePorId(Long id) {
        return reporteVentasRepository.findById(id);
    }

    public Optional<ReporteVentas> obtenerReportePorFecha(LocalDate fechaEvento) {
        return reporteVentasRepository.findByFechaEvento(fechaEvento);
    }

    public ReporteVentas actualizarReporte(Long id, ReporteVentas reporteActualizado) {
        Optional<ReporteVentas> optionalReporte = reporteVentasRepository.findById(id);
        if (optionalReporte.isEmpty()) {
            throw new RuntimeException("No existe reporte con id: " + id);
        }

        ReporteVentas reporte = optionalReporte.get();
        reporte.setTotalVentas(reporteActualizado.getTotalVentas());
        reporte.setTicketsVendidos(reporteActualizado.getTicketsVendidos());
        reporte.setFechaEvento(reporteActualizado.getFechaEvento());
        reporte.setEventosDestacados(reporteActualizado.getEventosDestacados());

        return reporteVentasRepository.save(reporte);
    }

    public void eliminarReporte(Long id) {
        Optional<ReporteVentas> optionalReporte = reporteVentasRepository.findById(id);
        if (optionalReporte.isEmpty()) {
            throw new RuntimeException("No existe reporte con id: " + id);
        }
        reporteVentasRepository.deleteById(id);
    }

    // Método para agregar o actualizar evento dentro de un reporte
    public ReporteVentas agregarOActualizarEventoEnReporte(EventoColaDTO dto) {
        Optional<ReporteVentas> optionalReporte = reporteVentasRepository.findByFechaEvento(dto.getFecha());

        EventoVentas evento = new EventoVentas();
        evento.setEventoId(dto.getIdEvento());
        evento.setNombre(dto.getNombre());
        evento.setCiudad(dto.getCiudad());
        evento.setEstablecimiento(dto.getEstablecimiento());
        evento.setFecha(dto.getFecha());
        evento.setHora(dto.getHora());
        evento.setCapacidad(dto.getCapacidad());

        if (optionalReporte.isPresent()) {
            ReporteVentas reporte = optionalReporte.get();
            // Buscar si evento ya existe
            boolean encontrado = false;
            for (EventoVentas e : reporte.getEventosDestacados()) {
                if (e.getEventoId().equals(evento.getEventoId())) {
                    // Actualizar evento existente
                    e.setNombre(evento.getNombre());
                    e.setCiudad(evento.getCiudad());
                    e.setEstablecimiento(evento.getEstablecimiento());
                    e.setFecha(evento.getFecha());
                    e.setHora(evento.getHora());
                    e.setCapacidad(evento.getCapacidad());
                    encontrado = true;
                    break;
                }
            }
            if (!encontrado) {
                reporte.getEventosDestacados().add(evento);
            }
            return reporteVentasRepository.save(reporte);
        } else {
            ReporteVentas nuevoReporte = new ReporteVentas();
            nuevoReporte.setFechaEvento(dto.getFecha());
            nuevoReporte.setTotalVentas(0.0);
            nuevoReporte.setTicketsVendidos(0);
            nuevoReporte.setEventosDestacados(List.of(evento));
            return reporteVentasRepository.save(nuevoReporte);
        }
    }

    // Método para eliminar evento de reporte por idEvento
    public ReporteVentas eliminarEventoDeReporte(Long idEvento) {
        List<ReporteVentas> reportes = reporteVentasRepository.findAll();
        for (ReporteVentas reporte : reportes) {
            boolean removed = reporte.getEventosDestacados().removeIf(e -> e.getEventoId().equals(idEvento));
            if (removed) {
                return reporteVentasRepository.save(reporte);
            }
        }
        throw new RuntimeException("Evento con id " + idEvento + " no encontrado en reportes");
    }
}
