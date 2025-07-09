package com.encuentro.tickets.controller;

import com.encuentro.tickets.model.idTicketCliente;
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
    public List<idTicketCliente> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public idTicketCliente getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public idTicketCliente create(@RequestBody idTicketCliente ticket) {
        return service.save(ticket);
    }

    @PutMapping("/{id}")
    public idTicketCliente update(@PathVariable Long id, @RequestBody idTicketCliente updatedTicket) {
        updatedTicket.setIdTicketCliente(id);
        return service.save(updatedTicket);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
