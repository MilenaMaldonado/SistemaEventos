package com.encuentro.tickets.controller;

import com.encuentro.tickets.model.CategoriaTicket;
import com.encuentro.tickets.services.CategoriaTicketService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias-tickets")
public class CategoriaTicketController {

    private final CategoriaTicketService service;

    public CategoriaTicketController(CategoriaTicketService service) {
        this.service = service;
    }

    @GetMapping
    public List<CategoriaTicket> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public CategoriaTicket getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public CategoriaTicket create(@RequestBody CategoriaTicket categoria) {
        return service.save(categoria);
    }

    @PutMapping("/{id}")
    public CategoriaTicket update(@PathVariable Long id, @RequestBody CategoriaTicket updatedCategoria) {
        updatedCategoria.setIdCategoria(id);
        return service.save(updatedCategoria);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
