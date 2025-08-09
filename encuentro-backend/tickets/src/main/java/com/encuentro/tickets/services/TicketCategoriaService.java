package com.encuentro.tickets.services;

import com.encuentro.tickets.model.TicketCategoria;
import com.encuentro.tickets.model.TicketCategoriaId;
import com.encuentro.tickets.repository.TicketCategoriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketCategoriaService {

    private final TicketCategoriaRepository repository;

    public TicketCategoriaService(TicketCategoriaRepository repository) {
        this.repository = repository;
    }

    public List<TicketCategoria> findAll() {
        return repository.findAll();
    }

    public TicketCategoria save(TicketCategoria ticketCategoria) {
        return repository.save(ticketCategoria);
    }

    public TicketCategoria findById(TicketCategoriaId id) {
        return repository.findById(id).orElse(null);
    }

    public void delete(TicketCategoriaId id) {
        repository.deleteById(id);
    }
}
