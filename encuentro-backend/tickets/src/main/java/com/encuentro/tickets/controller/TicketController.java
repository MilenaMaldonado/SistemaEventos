package com.encuentro.tickets.controller;

import com.encuentro.tickets.dto.*;

import com.encuentro.tickets.services.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService service;

    @GetMapping("/eventos/{idEvento}/asientos")
    public ResponseEntity<List<SeatView>> asientos(@PathVariable Long idEvento) {
        return ResponseEntity.ok(service.getAsientos(idEvento));
    }

    @PostMapping("/holds")
    public ResponseEntity<Void> hold(@Valid @RequestBody HoldSeatsRequest req) {
        service.hold(req);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/purchases")
    public ResponseEntity<FacturaResponse> purchase(@Valid @RequestBody PurchaseRequest req) {
        return ResponseEntity.ok(service.purchase(req));
    }

    @GetMapping("/compras/{cedula}")
    public ResponseEntity<List<CompraResponse>> getComprasByCedula(@PathVariable String cedula) {
        return ResponseEntity.ok(service.getComprasByCedula(cedula));
    }

    @GetMapping("/metricas")
    public ResponseEntity<MetricasDTO> getMetricasGenerales() {
        return ResponseEntity.ok(service.getMetricasGenerales());
    }

    @GetMapping("/metricas/mes")
    public ResponseEntity<MetricasDTO> getMetricasDelMes() {
        return ResponseEntity.ok(service.getMetricasDelMes());
    }

    @GetMapping("/metricas/rango")
    public ResponseEntity<MetricasDTO> getMetricasPorRango(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        return ResponseEntity.ok(service.getMetricasPorRango(fechaInicio, fechaFin));
    }
}
