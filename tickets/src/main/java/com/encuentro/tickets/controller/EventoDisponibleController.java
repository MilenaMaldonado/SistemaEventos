package com.encuentro.tickets.controller;

import com.encuentro.tickets.model.EventoDisponible;
import com.encuentro.tickets.services.EventoDisponibleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/eventos-disponibles")
public class EventoDisponibleController {

    private final EventoDisponibleService service;

    public EventoDisponibleController(EventoDisponibleService service) {
        this.service = service;
    }

    @GetMapping
    public List<EventoDisponible> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public EventoDisponible getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public EventoDisponible create(@RequestBody EventoDisponible evento) {
        return service.save(evento);
    }

    @PutMapping("/{id}")
    public EventoDisponible update(@PathVariable Long id, @RequestBody EventoDisponible updatedEvento) {
        updatedEvento.setIdEvento(id);
        return service.save(updatedEvento);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
