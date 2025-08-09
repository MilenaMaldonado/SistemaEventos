package ec.edu.espe.msreportes.controller;

import ec.edu.espe.msreportes.dto.ResponseDto;
import ec.edu.espe.msreportes.dto.ReporteVentasRequestDTO;
import ec.edu.espe.msreportes.model.ReporteVentas;
import ec.edu.espe.msreportes.service.ReporteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteService reporteVentasService;

    @GetMapping
    public ResponseEntity<ResponseDto> listarReportes() {
        List<ReporteVentas> reportes = reporteVentasService.listarReportes();
        return ResponseEntity.ok(new ResponseDto("Reportes obtenidos exitosamente", reportes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseDto> obtenerReportePorId(@PathVariable Long id) {
        return reporteVentasService.obtenerReportePorId(id)
                .map(reporte -> ResponseEntity.ok(new ResponseDto("Reporte encontrado", reporte)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ResponseDto("Reporte no encontrado", null)));
    }

    @GetMapping("/fecha/{fechaEvento}")
    public ResponseEntity<ResponseDto> obtenerReportePorFecha(@PathVariable String fechaEvento) {
        try {
            LocalDate fecha = LocalDate.parse(fechaEvento);
            return reporteVentasService.obtenerReportePorFecha(fecha)
                    .map(reporte -> ResponseEntity.ok(new ResponseDto("Reporte encontrado por fecha", reporte)))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(new ResponseDto("No se encontró reporte para la fecha especificada", null)));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ResponseDto("Formato de fecha inválido. Use yyyy-MM-dd", null));
        }
    }

    @PostMapping
    public ResponseEntity<ResponseDto> crearReporte(@Valid @RequestBody ReporteVentasRequestDTO reporteDTO, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(new ResponseDto("Errores de validación", result.getAllErrors()));
        }
        
        ReporteVentas reporteVentas = new ReporteVentas();
        reporteVentas.setTotalVentas(reporteDTO.getTotalVentas());
        reporteVentas.setTicketsVendidos(reporteDTO.getTicketsVendidos());
        reporteVentas.setFechaEvento(reporteDTO.getFechaEvento());
        
        ReporteVentas creado = reporteVentasService.crearReporte(reporteVentas);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ResponseDto("Reporte creado exitosamente", creado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto> actualizarReporte(@PathVariable Long id,
                                                        @Valid @RequestBody ReporteVentasRequestDTO reporteDTO,
                                                        BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(new ResponseDto("Errores de validación", result.getAllErrors()));
        }
        
        try {
            ReporteVentas reporteVentas = new ReporteVentas();
            reporteVentas.setTotalVentas(reporteDTO.getTotalVentas());
            reporteVentas.setTicketsVendidos(reporteDTO.getTicketsVendidos());
            reporteVentas.setFechaEvento(reporteDTO.getFechaEvento());
            
            ReporteVentas actualizado = reporteVentasService.actualizarReporte(id, reporteVentas);
            return ResponseEntity.ok(new ResponseDto("Reporte actualizado exitosamente", actualizado));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDto("Reporte no encontrado para actualizar", null));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto> eliminarReporte(@PathVariable Long id) {
        try {
            reporteVentasService.eliminarReporte(id);
            return ResponseEntity.ok(new ResponseDto("Reporte eliminado exitosamente", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDto("Reporte no encontrado para eliminar", null));
        }
    }
}
