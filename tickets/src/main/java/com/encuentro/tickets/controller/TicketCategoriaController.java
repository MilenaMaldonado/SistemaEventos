package com.encuentro.tickets.controller;

import com.encuentro.tickets.model.TicketCategoria;
import com.encuentro.tickets.model.TicketCategoriaId;
import com.encuentro.tickets.services.TicketCategoriaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets-categorias")
public class TicketCategoriaController {

    private final TicketCategoriaService service;

    public TicketCategoriaController(TicketCategoriaService service) {
        this.service = service;
    }

    @GetMapping
    public List<TicketCategoria> getAll() {
        return service.findAll();
    }

    @GetMapping("/buscar")
    public TicketCategoria getById(@RequestParam Long idTicketCliente, @RequestParam Long idCategoria) {
        TicketCategoriaId id = new TicketCategoriaId(idTicketCliente, idCategoria);
        return service.findById(id);
    }

    @PostMapping
    public TicketCategoria create(@RequestBody TicketCategoria ticketCategoria) {
        return service.save(ticketCategoria);
    }

    @DeleteMapping
    public void delete(@RequestParam Long idTicketCliente, @RequestParam Long idCategoria) {
        TicketCategoriaId id = new TicketCategoriaId(idTicketCliente, idCategoria);
        service.delete(id);
    }
}
