package com.encuentro.tickets.controller;

import com.encuentro.tickets.model.TicketCliente;
import com.encuentro.tickets.services.TicketClienteService;
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
    public List<TicketCliente> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public TicketCliente getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public TicketCliente create(@RequestBody TicketCliente ticket) {
        return service.save(ticket);
    }

    @PutMapping("/{id}")
    public TicketCliente update(@PathVariable Long id, @RequestBody TicketCliente updatedTicket) {
        updatedTicket.setIdTicketCliente(id);
        return service.save(updatedTicket);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
