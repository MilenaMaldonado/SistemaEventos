package com.encuentro.tickets.services;

import com.encuentro.tickets.dto.*;
import com.encuentro.tickets.model.*;
import com.encuentro.tickets.repository.*;
import com.encuentro.tickets.ws.SeatUpdateEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final EventoDisponibleRepository eventoRepo;
    private final AsientoRepository asientoRepo;
    private final TicketRepository ticketRepo;
    private final FacturaRepository facturaRepo;
    private final SimpMessagingTemplate ws;
    private final NotificacionProducer notificacionProducer;


    private int holdMinutes=1;

    private  BigDecimal ivaRate = BigDecimal.valueOf(0.12);

    public List<SeatView> getAsientos(Long idEvento) {
        return asientoRepo.findByEventoIdEventoOrderByNumero(idEvento).stream()
                .map(a -> new SeatView(a.getId(), a.getNumero(), a.getEstado(), a.getHoldUntil()))
                .toList();
    }

    @Transactional
    public void hold(HoldSeatsRequest req) {
        EventoDisponible evento = eventoRepo.findById(req.idEvento())
                .orElseThrow(() -> new NoSuchElementException("Evento no encontrado"));

        // Crear asientos si no existen aún (1..capacidad)
        if (asientoRepo.countByEventoIdEventoAndEstado(evento.getIdEvento(), SeatStatus.AVAILABLE)
                + asientoRepo.countByEventoIdEventoAndEstado(evento.getIdEvento(), SeatStatus.HOLD)
                + asientoRepo.countByEventoIdEventoAndEstado(evento.getIdEvento(), SeatStatus.PURCHASED)
                == 0) {
            for (int n = 1; n <= evento.getCapacidad(); n++) {
                asientoRepo.save(Asiento.builder()
                        .evento(evento)
                        .numero(n)
                        .estado(SeatStatus.AVAILABLE)
                        .build());
            }
        }

        Instant now = Instant.now();

        for (Integer n : req.asientos()) {
            Asiento a = asientoRepo.findByEventoIdEventoAndNumero(evento.getIdEvento(), n)
                    .orElseThrow(() -> new NoSuchElementException("Asiento "+n+" no existe"));

            // Expirar HOLD vencido on-demand
            if (a.getEstado() == SeatStatus.HOLD && a.getHoldUntil() != null && a.getHoldUntil().isBefore(now)) {
                a.setEstado(SeatStatus.AVAILABLE);
                a.setHoldUntil(null);
            }

            if (a.getEstado() != SeatStatus.AVAILABLE) {
                throw new IllegalStateException("Asiento "+n+" no disponible");
            }

            a.setEstado(SeatStatus.HOLD);
            a.setHoldUntil(now.plus(holdMinutes, ChronoUnit.MINUTES));
            asientoRepo.saveAndFlush(a); // respeta @Version

            publishSeatUpdate(evento.getIdEvento(), a);
        }
    }

    @Transactional
    public FacturaResponse purchase(PurchaseRequest req) {
        EventoDisponible evento = eventoRepo.findById(req.idEvento())
                .orElseThrow(() -> new NoSuchElementException("Evento no encontrado"));

        Instant now = Instant.now();

        // Validar/confirmar todos los asientos
        List<Asiento> asientos = new ArrayList<>();
        for (Integer n : req.asientos()) {
            Asiento a = asientoRepo.findByEventoIdEventoAndNumero(evento.getIdEvento(), n)
                    .orElseThrow(() -> new NoSuchElementException("Asiento "+n+" no existe"));

            if (a.getEstado() != SeatStatus.HOLD || a.getHoldUntil() == null || a.getHoldUntil().isBefore(now)) {
                throw new IllegalStateException("Asiento "+n+" no está en HOLD o expiró");
            }
            a.setEstado(SeatStatus.PURCHASED);
            a.setHoldUntil(null);
            asientoRepo.saveAndFlush(a);
            asientos.add(a);
        }

        // Totales
        BigDecimal unit = req.precioUnitario().setScale(2, RoundingMode.HALF_UP);
        BigDecimal subtotal = unit.multiply(BigDecimal.valueOf(asientos.size())).setScale(2, RoundingMode.HALF_UP);
        BigDecimal iva = subtotal.multiply(ivaRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(iva).setScale(2, RoundingMode.HALF_UP);

        // Factura
        Factura factura = Factura.builder()
                .nombre(req.nombre())
                .apellido(req.apellido())
                .cedula(req.cedula())
                .evento(evento)
                .subtotal(subtotal)
                .iva(iva)
                .total(total)
                .createdAt(now)
                .build();
        factura = facturaRepo.save(factura);

        // Tickets
        for (Asiento a : asientos) {
            Ticket t = Ticket.builder()
                    .evento(evento)
                    .asiento(a)
                    .factura(factura)
                    .purchasedAt(now)
                    .precioUnitario(unit)
                    .build();
            ticketRepo.save(t);
        }

        // WS updates
        asientos.forEach(a -> publishSeatUpdate(evento.getIdEvento(), a));

        // Enviar notificación por cola
        try {
            String mensaje = String.format("El usuario %s %s compró boletos del evento %d", 
                                          req.nombre(), 
                                          req.apellido(), 
                                          evento.getIdEvento());
            NotificacionesDTO notificacion = new NotificacionesDTO(mensaje, "Compra Boletos");
            notificacionProducer.enviarNotificacion(notificacion);
        } catch (Exception e) {
            // Log error but don't fail the purchase
            System.err.println("Error enviando notificación: " + e.getMessage());
        }

        return new FacturaResponse(
                factura.getId(),
                evento.getIdEvento(),
                req.asientos(),
                unit, subtotal, iva, total, now
        );
    }

    @Transactional
    public int releaseExpiredHolds() {
        int released = asientoRepo.releaseExpired(Instant.now());
        // (Opcional) Podrías reenviar por WS los liberados si los consultas.
        return released;
    }

    public List<CompraResponse> getComprasByCedula(String cedula) {
        List<Factura> facturas = facturaRepo.findByCedulaWithDetails(cedula);
        
        return facturas.stream().map(factura -> {
            List<CompraResponse.TicketInfo> ticketInfos = factura.getTickets().stream()
                    .map(ticket -> CompraResponse.TicketInfo.builder()
                            .ticketId(ticket.getId())
                            .numeroAsiento(ticket.getAsiento().getNumero())
                            .precioUnitario(ticket.getPrecioUnitario())
                            .build())
                    .collect(Collectors.toList());

            return CompraResponse.builder()
                    .facturaId(factura.getId())
                    .idEvento(factura.getEvento().getIdEvento())
                    .nombre(factura.getNombre())
                    .apellido(factura.getApellido())
                    .cedula(factura.getCedula())
                    .tickets(ticketInfos)
                    .subtotal(factura.getSubtotal())
                    .iva(factura.getIva())
                    .total(factura.getTotal())
                    .fechaCompra(factura.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    private void publishSeatUpdate(Long idEvento, Asiento a) {
        ws.convertAndSend("/topic/eventos/" + idEvento + "/asientos",
                new SeatUpdateEvent(idEvento, a.getNumero(), a.getEstado(), a.getHoldUntil()));
    }
}
