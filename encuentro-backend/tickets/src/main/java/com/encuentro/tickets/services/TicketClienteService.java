package com.encuentro.tickets.services;

import com.encuentro.tickets.model.TicketCliente;
import com.encuentro.tickets.repository.TicketClienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketClienteService {

    private final TicketClienteRepository repository;

    public TicketClienteService(TicketClienteRepository repository) {
        this.repository = repository;
    }

    public List<TicketCliente> findAll() {
        return repository.findAll();
    }

    public TicketCliente save(TicketCliente ticket) {
        return repository.save(ticket);
    }

    public TicketCliente findById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
