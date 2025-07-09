package com.encuentro.tickets.services;

import com.encuentro.tickets.model.CategoriaTicket;
import com.encuentro.tickets.repository.CategoriaTicketRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoriaTicketService {

    private final CategoriaTicketRepository repository;

    public CategoriaTicketService(CategoriaTicketRepository repository) {
        this.repository = repository;
    }

    public List<CategoriaTicket> findAll() {
        return repository.findAll();
    }

    public CategoriaTicket save(CategoriaTicket categoria) {
        return repository.save(categoria);
    }

    public CategoriaTicket findById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
