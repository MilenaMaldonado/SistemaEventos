package ec.edu.espe.msreportes.controller;

import ec.edu.espe.msreportes.model.ReporteVentas;
import ec.edu.espe.msreportes.service.ReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteService reporteVentasService;

    @GetMapping
    public ResponseEntity<List<ReporteVentas>> listarReportes() {
        List<ReporteVentas> reportes = reporteVentasService.listarReportes();
        return ResponseEntity.ok(reportes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReporteVentas> obtenerReportePorId(@PathVariable Long id) {
        return reporteVentasService.obtenerReportePorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Buscar por fechaEvento (pasa fecha en formato yyyy-MM-dd)
    @GetMapping("/fecha/{fechaEvento}")
    public ResponseEntity<ReporteVentas> obtenerReportePorFecha(@PathVariable String fechaEvento) {
        LocalDate fecha = LocalDate.parse(fechaEvento);
        return reporteVentasService.obtenerReportePorFecha(fecha)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ReporteVentas> crearReporte(@RequestBody ReporteVentas reporteVentas) {
        ReporteVentas creado = reporteVentasService.crearReporte(reporteVentas);
        return ResponseEntity.ok(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReporteVentas> actualizarReporte(@PathVariable Long id,
                                                           @RequestBody ReporteVentas reporteVentas) {
        try {
            ReporteVentas actualizado = reporteVentasService.actualizarReporte(id, reporteVentas);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarReporte(@PathVariable Long id) {
        try {
            reporteVentasService.eliminarReporte(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
