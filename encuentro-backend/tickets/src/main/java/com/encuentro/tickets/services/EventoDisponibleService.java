package com.encuentro.tickets.services;

import com.encuentro.tickets.model.EventoDisponible;
import com.encuentro.tickets.repository.EventoDisponibleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventoDisponibleService {

    private final EventoDisponibleRepository repository;

    public EventoDisponibleService(EventoDisponibleRepository repository) {
        this.repository = repository;
    }

    public List<EventoDisponible> findAll() {
        return repository.findAll();
    }

    public EventoDisponible save(EventoDisponible evento) {
        return repository.save(evento);
    }

    public EventoDisponible findById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
