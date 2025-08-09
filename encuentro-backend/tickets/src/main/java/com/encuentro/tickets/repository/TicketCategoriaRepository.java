package com.encuentro.tickets.repository;

import com.encuentro.tickets.model.TicketCategoria;
import com.encuentro.tickets.model.TicketCategoriaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketCategoriaRepository extends JpaRepository<TicketCategoria, TicketCategoriaId> {}
