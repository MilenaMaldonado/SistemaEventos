package com.encuentro.tickets.services;

import com.encuentro.tickets.model.idTicketCliente;
import com.encuentro.tickets.repository.TicketClienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketClienteService {

    private final TicketClienteRepository repository;

    public TicketClienteService(TicketClienteRepository repository) {
        this.repository = repository;
    }

    public List<idTicketCliente> findAll() {
        return repository.findAll();
    }

    public idTicketCliente save(idTicketCliente ticket) {
        return repository.save(ticket);
    }

    public idTicketCliente findById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
