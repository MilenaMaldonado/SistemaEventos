package com.encuentro.tickets.controller;

import com.encuentro.tickets.model.TicketCliente;
import com.encuentro.tickets.repository.TicketClienteRepository;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketClienteRepository ticketRepo;

    @PostMapping
    public ResponseEntity<TicketCliente> crear(@RequestBody TicketCliente ticket) {
        return ResponseEntity.ok(ticketRepo.save(ticket));
    }

    @GetMapping
    public List<TicketCliente> listar() {
        return ticketRepo.findAll();
    }
}
