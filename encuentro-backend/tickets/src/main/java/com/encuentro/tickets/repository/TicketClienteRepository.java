package com.encuentro.tickets.repository;

import com.encuentro.tickets.model.TicketCliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketClienteRepository extends JpaRepository<TicketCliente, Long> {}

