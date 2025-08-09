package com.encuentro.tickets.controller;

import com.encuentro.tickets.dto.ResponseDto;
import com.encuentro.tickets.dto.TicketClienteDTO;
import com.encuentro.tickets.model.TicketCliente;
import com.encuentro.tickets.services.TicketClienteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets-clientes")
public class TicketClienteController {

    private final TicketClienteService service;

    public TicketClienteController(TicketClienteService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ResponseDto> getAll() {
        List<TicketCliente> tickets = service.findAll();
        return ResponseEntity.ok(new ResponseDto("Tickets obtenidos exitosamente", tickets));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseDto> getById(@PathVariable Long id) {
        TicketCliente ticket = service.findById(id);
        if (ticket != null) {
            return ResponseEntity.ok(new ResponseDto("Ticket encontrado", ticket));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDto("Ticket no encontrado", null));
        }
    }

    @PostMapping
    public ResponseEntity<ResponseDto> create(@Valid @RequestBody TicketClienteDTO ticketDTO, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(new ResponseDto("Errores de validación", result.getAllErrors()));
        }
        
        TicketCliente ticket = new TicketCliente();
        ticket.setFechaEmision(ticketDTO.getFechaEmision());
        ticket.setCedula(ticketDTO.getCedula());
        ticket.setMetodoPago(ticketDTO.getMetodoPago());
        ticket.setPrecioUnitarioTicket(ticketDTO.getPrecioUnitarioTicket());
        ticket.setCantidad(ticketDTO.getCantidad());
        ticket.setSubtotal(ticketDTO.getSubtotal());
        ticket.setIva(ticketDTO.getIva());
        ticket.setTotal(ticketDTO.getTotal());
        
        TicketCliente creado = service.save(ticket);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ResponseDto("Ticket creado exitosamente", creado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto> update(@PathVariable Long id, @Valid @RequestBody TicketClienteDTO ticketDTO, BindingResult result) {
        if (result.hasErrors()) {
            return ResponseEntity.badRequest().body(new ResponseDto("Errores de validación", result.getAllErrors()));
        }
        
        TicketCliente ticket = new TicketCliente();
        ticket.setIdTicketCliente(id);
        ticket.setFechaEmision(ticketDTO.getFechaEmision());
        ticket.setCedula(ticketDTO.getCedula());
        ticket.setMetodoPago(ticketDTO.getMetodoPago());
        ticket.setPrecioUnitarioTicket(ticketDTO.getPrecioUnitarioTicket());
        ticket.setCantidad(ticketDTO.getCantidad());
        ticket.setSubtotal(ticketDTO.getSubtotal());
        ticket.setIva(ticketDTO.getIva());
        ticket.setTotal(ticketDTO.getTotal());
        
        TicketCliente actualizado = service.save(ticket);
        return ResponseEntity.ok(new ResponseDto("Ticket actualizado exitosamente", actualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            return ResponseEntity.ok(new ResponseDto("Ticket eliminado exitosamente", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDto("Ticket no encontrado para eliminar", null));
        }
    }
}
