package com.encuentro.tickets.services;

import com.encuentro.tickets.dto.NotificacionesDTO;
import com.encuentro.tickets.model.TicketCliente;
import com.encuentro.tickets.repository.TicketClienteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketClienteService {

    private final TicketClienteRepository repository;


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
